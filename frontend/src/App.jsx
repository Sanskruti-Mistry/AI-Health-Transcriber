import { useState } from 'react';
import './App.css'; // We'll keep the default CSS file for basic styling

function App() {
  const [rawNotes, setRawNotes] = useState('');
  const [transcriptData, setTranscriptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleProcessNotes = async () => {
    if (!rawNotes.trim()) return;
    
    setLoading(true);
    setError(null);
    setTranscriptData(null);

    try {
      // Send the notes to our Python backend
      const response = await fetch('http://localhost:8000/api/process-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: rawNotes })
      });

      if (!response.ok) throw new Error("Failed to connect to backend.");
      
      const data = await response.json();
      setTranscriptData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1> AI Medical Transcriber (Gov. Healthcare)</h1>
      <p>Enter raw patient notes or voice transcriptions below:</p>

      <textarea 
        rows="6" 
        style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '10px' }}
        placeholder="e.g., Patient Ramkumar, 55 male, complaining of severe chest pain for 45 mins..."
        value={rawNotes}
        onChange={(e) => setRawNotes(e.target.value)}
      />

      <button 
        onClick={handleProcessNotes} 
        disabled={loading}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        {loading ? 'Processing via Gemini AI...' : 'Generate Transcript & Triage'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '20px' }}>Error: {error}</p>}

      {/* --- DISPLAY THE AI RESULTS --- */}
      {transcriptData && (
        <div style={{ marginTop: '30px', textAlign: 'left', borderTop: '2px solid #eee', paddingTop: '20px' }}>
          
          {/* Emergency Alert Box */}
          {transcriptData.is_emergency && (
            <div style={{ backgroundColor: '#ffebee', borderLeft: '5px solid #f44336', padding: '15px', marginBottom: '20px' }}>
              <h3 style={{ color: '#d32f2f', marginTop: 0 }}>🚨 MEDICAL EMERGENCY DETECTED</h3>
              <p><strong>Flags:</strong> {transcriptData.emergency_flags?.join(', ')}</p>
              <h4>Recommended Actions:</h4>
              <ul>
                {transcriptData.recommended_emergency_measures?.map((measure, index) => (
                  <li key={index}>{measure}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Structured Transcript */}
          <h3>Structured Patient Record</h3>
          <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
            <p><strong>Name:</strong> {transcriptData.patient_demographics?.name || 'N/A'}</p>
            <p><strong>Age/Gender:</strong> {transcriptData.patient_demographics?.age} / {transcriptData.patient_demographics?.gender}</p>
            <p><strong>Diagnosis:</strong> {transcriptData.diagnosis}</p>
            <p><strong>Symptoms:</strong> {transcriptData.symptoms?.join(', ')}</p>
            <p><strong>Medications:</strong> {transcriptData.prescribed_medications?.join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
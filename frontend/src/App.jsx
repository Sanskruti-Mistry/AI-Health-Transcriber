import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [rawNotes, setRawNotes] = useState('');
  const [transcriptData, setTranscriptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? '#121212' : '#ffffff';
    document.body.style.color = isDarkMode ? '#f5f5f5' : '#333333';
  }, [isDarkMode]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Dictation.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false; 
    recognition.lang = 'en-IN'; 

    recognition.onresult = (event) => {
      const latestTranscript = event.results[event.resultIndex][0].transcript;
      setRawNotes((prev) => prev + (prev ? " " : "") + latestTranscript.trim());
    };

    recognition.onend = () => setIsRecording(false);
    
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const handleProcessNotes = async () => {
    if (!rawNotes.trim()) return;
    setLoading(true);
    setError(null);
    setTranscriptData(null);

    try {
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

  // --- NEW CLEAR FUNCTION ---
  const handleClear = () => {
    setRawNotes('');          // Clears the text box
    setTranscriptData(null);  // Clears the previous AI results
    setError(null);           // Clears any errors
    
    // Safety check: stop the microphone if they hit clear while recording
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
  };

  const copyToClipboard = () => {
    if (transcriptData) {
      navigator.clipboard.writeText(JSON.stringify(transcriptData, null, 2));
      alert("Structured JSON copied to clipboard!");
    }
  };

  const renderWithTooltips = (text) => {
    if (!text || typeof text !== 'string') return text;
    if (!transcriptData?.jargon_explanations || Object.keys(transcriptData.jargon_explanations).length === 0) {
      return text;
    }

    let parts = [text];
    
    Object.entries(transcriptData.jargon_explanations).forEach(([term, explanation]) => {
      const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${safeTerm})`, 'gi'); 
      
      parts = parts.flatMap(part => {
        if (typeof part === 'string') {
          return part.split(regex).map((substring, i) => {
            if (substring.toLowerCase() === term.toLowerCase()) {
              return (
                <span 
                  key={`${term}-${i}`} 
                  className="jargon-word" 
                  data-tooltip={explanation} 
                  title={explanation} 
                >
                  {substring}
                </span>
              );
            }
            return substring;
          });
        }
        return part;
      });
    });

    return parts;
  };

  const theme = {
    cardBg: isDarkMode ? '#1e1e1e' : '#f8f9fa',
    border: isDarkMode ? '#333' : '#ddd',
    inputBg: isDarkMode ? '#2d2d2d' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000'
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: theme.text }}>🏥 AI Medical Transcriber</h1>
        <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ padding: '8px', cursor: 'pointer', borderRadius: '5px' }}>
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <p className="no-print" style={{ color: theme.text }}>Type notes or use the microphone (speak naturally, it will process when you pause).</p>

      <textarea 
        className="no-print"
        rows="6" 
        style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '10px', backgroundColor: theme.inputBg, color: theme.text, border: `1px solid ${theme.border}` }}
        placeholder="e.g., Patient Amit Sharma, 12 male, experiencing dry cough for 2 weeks..."
        value={rawNotes}
        onChange={(e) => setRawNotes(e.target.value)}
      />

      {/* --- ADDED CLEAR BUTTON HERE --- */}
      <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={toggleRecording} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: isRecording ? '#dc3545' : '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
          {isRecording ? '🛑 Stop Dictation' : '🎤 Start Dictation'}
        </button>
        <button onClick={handleProcessNotes} disabled={loading} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '5px' }}>
          {loading ? 'Processing via AI...' : 'Generate Transcript'}
        </button>
        <button onClick={handleClear} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px' }}>
          🗑️ Clear
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {transcriptData && (
        <div style={{ marginTop: '30px', borderTop: `2px solid ${theme.border}`, paddingTop: '20px' }}>
          
          <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button onClick={copyToClipboard} style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>📋 Copy JSON</button>
            <button onClick={() => window.print()} style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px' }}>🖨️ Save as PDF</button>
          </div>

          <h2 style={{ color: theme.text }}>Structured Patient Record</h2>

          {transcriptData.is_emergency && (
            <div className="print-clean" style={{ backgroundColor: '#ffebee', borderLeft: '5px solid #f44336', padding: '15px', marginBottom: '20px', color: '#000', textAlign: 'left' }}>
              <h3 style={{ color: '#d32f2f', margin: '0 0 15px 0', textAlign: 'center' }}>🚨 MEDICAL EMERGENCY DETECTED</h3>
              
              <div style={{ textAlign: 'justify' }}>
                <p style={{ margin: '0 0 10px 0' }}><strong>Critical Flags:</strong> {renderWithTooltips(transcriptData.emergency_flags?.join(', '))}</p>
                <h4 style={{ margin: '15px 0 5px 0' }}>Recommended Actions:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {transcriptData.recommended_emergency_measures?.map((m, i) => <li key={i}>{renderWithTooltips(m)}</li>)}
                </ul>
              </div>
            </div>
          )}

          <div className="print-clean" style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '8px', border: `1px solid ${theme.border}`, textAlign: 'left' }}>
            
            <h3 style={{ borderBottom: `1px solid ${theme.border}`, paddingBottom: '5px', marginTop: 0 }}>Demographics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <p style={{ margin: '5px 0' }}><strong>Name:</strong> {transcriptData.patient_demographics?.name || 'Not provided'}</p>
              <p style={{ margin: '5px 0' }}><strong>Age/Gender:</strong> {transcriptData.patient_demographics?.age || '-'} / {transcriptData.patient_demographics?.gender || '-'}</p>
            </div>

            <h3 style={{ borderBottom: `1px solid ${theme.border}`, paddingBottom: '5px' }}>Clinical Information</h3>
            
            <p style={{ margin: '10px 0' }}><strong>Diagnosis:</strong> {renderWithTooltips(transcriptData.diagnosis) || 'Pending evaluation'}</p>
            
            <p style={{ margin: '15px 0 5px 0' }}><strong>Reported Symptoms:</strong></p>
            <ul style={{ margin: '0 0 15px 0', paddingLeft: '20px' }}>
              {transcriptData.symptoms?.length > 0 
                ? transcriptData.symptoms.map((sym, i) => <li key={i}>{renderWithTooltips(sym)}</li>) 
                : <li>No specific symptoms reported.</li>}
            </ul>

            <p style={{ margin: '15px 0 5px 0' }}><strong>Prescribed Medications:</strong></p>
            <ul style={{ margin: '0 0 15px 0', paddingLeft: '20px' }}>
              {transcriptData.prescribed_medications?.length > 0 
                ? transcriptData.prescribed_medications.map((med, i) => <li key={i}>{renderWithTooltips(med)}</li>) 
                : <li>No medications prescribed.</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
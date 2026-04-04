import google.generativeai as genai
import json

# Configure your API Key (Get this from Google AI Studio)
genai.configure(api_key="YOUR_GEMINI_API_KEY")

def generate_medical_transcript(raw_doctor_notes):
    # We use Gemini 1.5 Flash as it is fast and highly capable for text extraction
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    system_prompt = """
    You are an expert AI medical assistant working for the Indian Government Healthcare System. 
    Your task is to take raw, unstructured doctor's notes (often mixed with Indian context) 
    and convert them into a structured medical transcript.

    Additionally, you must evaluate the notes for any critical medical emergencies 
    (e.g., suspected heart attack, stroke, severe bleeding, oxygen dropping below 90%).

    Return the output EXCLUSIVELY as a valid JSON object with the following structure:
    {
        "patient_demographics": {"age": "", "gender": ""},
        "symptoms": [],
        "diagnosis": "",
        "prescribed_medications": [],
        "is_emergency": boolean,
        "emergency_flags": [],
        "recommended_emergency_measures": []
    }
    """

    # Combine the system instructions with the actual input
    full_prompt = f"{system_prompt}\n\nRaw Doctor Notes:\n{raw_doctor_notes}"

    try:
        # Generate the response, forcing JSON output
        response = model.generate_content(
            full_prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Parse the JSON response
        transcript_data = json.loads(response.text)
        return transcript_data

    except Exception as e:
        return {"error": str(e)}

# --- Example Usage ---
# Simulating raw notes from a Primary Health Centre (PHC)
sample_input = """
Patient is a 55 year old male, Ramkumar. Complaining of severe crushing chest pain 
radiating to the left arm for the last 45 minutes. Sweating profusely. BP is 160/100. 
Give Aspirin immediately and refer to the district hospital.
"""

result = generate_medical_transcript(sample_input)
print(json.dumps(result, indent=4))
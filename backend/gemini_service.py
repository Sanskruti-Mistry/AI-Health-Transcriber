from google import genai
from google.genai import types
import json

# 1. NEW SYNTAX: Initialize the client directly (Do not use genai.configure)
client = genai.Client(api_key="YOUR_GEMINI_API_KEY")

def generate_medical_transcript(raw_doctor_notes):
    system_prompt = """
    You are an expert AI medical assistant for the Indian Government Healthcare System. 
    Convert raw doctor's notes into a structured medical transcript.
    
    CRITICAL INSTRUCTIONS:
    1. The raw notes may be in English, Hindi, Marathi, or a mix (Hinglish). 
    2. You must translate and output the final JSON EXCLUSIVELY in standard English.
    3. Evaluate the notes for any critical medical emergencies.
    4. Identify up to 3 complex medical terms used in the diagnosis or symptoms, and provide a simple, 1-sentence explanation for a layman.

    Return the output EXCLUSIVELY as a valid JSON object with the following structure:
    {
        "patient_demographics": {"name": "", "age": "", "gender": ""},
        "symptoms": [],
        "diagnosis": "",
        "prescribed_medications": [],
        "is_emergency": true,
        "emergency_flags": [],
        "recommended_emergency_measures": [],
        "jargon_explanations": {
            "Medical Term 1": "Simple explanation",
            "Medical Term 2": "Simple explanation"
        }
    }
    """

    full_prompt = f"{system_prompt}\n\nRaw Doctor Notes:\n{raw_doctor_notes}"

    try:
        # 2. NEW SYNTAX: Use client.models.generate_content
        # Note: Changed to 2.5-flash to avoid the 404 error we saw earlier!
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=full_prompt,
            # 3. NEW SYNTAX: Use types.GenerateContentConfig for JSON enforcement
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        # Parse the JSON response
        transcript_data = json.loads(response.text)
        return transcript_data

    except Exception as e:
        return {"error": str(e)}

# --- Example Usage ---
sample_input = """
Patient is a 55 year old male, Ramkumar. Complaining of severe crushing chest pain 
radiating to the left arm for the last 45 minutes. Sweating profusely. BP is 160/100. 
Give Aspirin immediately and refer to the district hospital.
"""

result = generate_medical_transcript(sample_input)
print(json.dumps(result, indent=4))
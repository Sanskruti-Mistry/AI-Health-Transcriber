from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
from dotenv import load_dotenv

# Import the NEW Google GenAI SDK
from google import genai
from google.genai import types

load_dotenv()

# Initialize the client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NotesRequest(BaseModel):
    notes: str

@app.post("/api/process-notes")
async def process_medical_notes(request: NotesRequest):
    system_prompt = """
    You are an expert AI medical assistant for the Indian Government Healthcare System. 
    Convert raw doctor's notes into a structured medical transcript.
    
    CRITICAL INSTRUCTIONS:
    1. The raw notes may be in English, Hindi, or Marathi. You must translate and output the final JSON EXCLUSIVELY in standard English.
    2. Evaluate the notes for any critical medical emergencies.
    3. Identify up to 4 complex medical terms (e.g., Tachycardia, Hypovolemia, Ischemia) used in the diagnosis or symptoms. Provide a simple, 1-sentence explanation for a layman in the `jargon_explanations` dictionary.

    Return the output EXCLUSIVELY as a valid JSON object with the following structure. Do not miss the jargon_explanations:
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
    
    full_prompt = f"{system_prompt}\n\nRaw Doctor Notes:\n{request.notes}"
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=full_prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        return {"error": str(e)}
        # error_msg = str(e)
        # print(f"Backend Crash/Error: {error_msg}")

        # if "503" in error_msg or "429" in error_msg:
        #     print("Google API overloaded. Serving emergency presentation data.")
        #     return {
        #         "patient_demographics": {
        #             "name": "Ramkumar", 
        #             "age": "55", 
        #             "gender": "Male"
        #         },
        #         "symptoms": [
        #             "severe crushing chest pain",
        #             "profuse sweating"
        #         ],
        #         "diagnosis": "Suspected Acute Myocardial Infarction",
        #         "prescribed_medications": [
        #             "Aspirin 300mg stat"
        #         ],
        #         "is_emergency": True,
        #         "emergency_flags": [
        #             "Crushing chest pain",
        #             "High Blood Pressure (160/100)"
        #         ],
        #         "recommended_emergency_measures": [
        #             "Administer Aspirin immediately",
        #             "Urgent ECG required",
        #             "Immediate referral to district hospital cardiology unit"
        #         ],
        #         "jargon_explanations": {
        #             "Myocardial Infarction": "A heart attack caused by blocked blood flow to the heart muscle.",
        #             "Stat": "A medical term meaning 'immediately'."
        #         }
        #     }
            
        # # If it's a different kind of error, send it to React as normal
        # return {"error": error_msg}
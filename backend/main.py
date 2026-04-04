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

# Initialize the new client
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
    Evaluate the notes for any critical medical emergencies.

    Return the output EXCLUSIVELY as a valid JSON object with the following structure:
    {
        "patient_demographics": {"name": "", "age": "", "gender": ""},
        "symptoms": [],
        "diagnosis": "",
        "prescribed_medications": [],
        "is_emergency": true/false,
        "emergency_flags": [],
        "recommended_emergency_measures": []
    }
    """
    
    full_prompt = f"{system_prompt}\n\nRaw Doctor Notes:\n{request.notes}"
    
    try:
        # Use the new generate_content syntax
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
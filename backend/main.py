from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
import requests

app = FastAPI()

# CORS fix
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"

# ✅ Root route
@app.get("/")
def root():
    return {"status": "backend running"}

# ✅ Ignore favicon.ico browser requests
@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(content=b"", media_type="image/x-icon")

# ✅ Chat route (IMPORTANT)
@app.post("/chat")
def chat(data: dict):
    try:
        # The frontend expects a single JSON object, not a stream.
        # We'll make a non-streaming request to Ollama and forward the response.
        payload = {**data, "stream": False}
        response = requests.post(OLLAMA_URL, json=payload)
        
        # Raise an exception for bad status codes (e.g., 404, 500) from Ollama
        response.raise_for_status()
        
        return response.json()
    
    except requests.exceptions.RequestException as e:
        # Handle connection errors to Ollama
        return JSONResponse(status_code=503, content={"error": f"Could not connect to Ollama: {e}"})
    except Exception as e:
        # Handle other errors, including those from raise_for_status()
        return JSONResponse(status_code=500, content={"error": str(e)})
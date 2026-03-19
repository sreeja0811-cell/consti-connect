from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
import numpy as np
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()
# Define which "origins" (websites) are allowed to make requests
origins = [
    "http://localhost:5173", # Default Vite port
    "http://localhost:5174", # The port in your screenshot
    "http://localhost:5175", # Just in case
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Initialize Supabase client
SUPABASE_URL = "https://ldjevlzafluwlmxykxet.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkamV2bHphZmx1d2xteHlreGV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI1NTI0MywiZXhwIjoyMDc1ODMxMjQzfQ.uJuML3tob3JXImpmMPEI1sIViMvxA6O-Q13QM8gvfVY"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Request body schema
class AnalyzeRequest(BaseModel):
    text: str

@app.post("/analyze")
def analyze_text(request: AnalyzeRequest):
    try:
        input_text = request.text
        input_embedding = model.encode(input_text)

        # Fetch articles and embeddings
        response = supabase.table("constitutional_articles").select("id, article_number, full_text, text_embedding").execute()
        rows = response.data

        if not rows:
            raise HTTPException(status_code=404, detail="No articles found in Supabase")

        articles = []
        for row in rows:
            if row.get("text_embedding"):
                try:
                    # Convert JSON string to numpy array
                    embedding = np.array(json.loads(row["text_embedding"]))
                    # Ensure same length as input embedding
                    if embedding.shape != input_embedding.shape:
                        print(f"Skipping row {row['id']} due to shape mismatch")
                        continue

                    # Cosine similarity
                    similarity = np.dot(input_embedding, embedding) / (np.linalg.norm(input_embedding) * np.linalg.norm(embedding))
                    articles.append({
                        "id": row["id"],
                        "article_number": row["article_number"],
                        "full_text": row["full_text"],
                        "similarity": float(similarity)
                    })
                except Exception as e:
                    print(f"Skipping row {row['id']} due to error: {e}")

        # Sort by similarity and return top 3
        top_articles = sorted(articles, key=lambda x: x["similarity"], reverse=True)[:3]

        return {"matches": top_articles}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

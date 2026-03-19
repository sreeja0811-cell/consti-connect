from supabase import create_client, Client
from sentence_transformers import SentenceTransformer
import numpy as np

# --- Replace these with your actual Supabase credentials ---
SUPABASE_URL = "https://ldjevlzafluwlmxykxet.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkamV2bHphZmx1d2xteHlreGV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI1NTI0MywiZXhwIjoyMDc1ODMxMjQzfQ.uJuML3tob3JXImpmMPEI1sIViMvxA6O-Q13QM8gvfVY"  # Use your Service Role Key, NOT the anon key

# Initialize Supabase client

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load the MiniLM model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Fetch all constitutional articles
response = supabase.table("constitutional_articles").select("id, full_text").execute()
articles = response.data

# Generate and update embeddings
for article in articles:
    text = article["full_text"]
    embedding = model.encode(text).tolist()

    supabase.table("constitutional_articles").update({"text_embedding": embedding}).eq("id", article["id"]).execute()
    print(f"✅ Embedded: Article ID {article['id']}")

print("🎉 All embeddings generated and stored successfully!")

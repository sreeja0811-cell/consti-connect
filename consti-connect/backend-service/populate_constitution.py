import json
from supabase import create_client, Client

# --- Step 1: Supabase credentials ---
SUPABASE_URL = "https://ldjevlzafluwlmxykxet.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkamV2bHphZmx1d2xteHlreGV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI1NTI0MywiZXhwIjoyMDc1ODMxMjQzfQ.uJuML3tob3JXImpmMPEI1sIViMvxA6O-Q13QM8gvfVY"  # ⚠️ Not the anon key

# --- Step 2: Initialize client ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Step 3: Load constitution.json file ---
with open("../data/constitution.json", "r") as file:
    constitution_data = json.load(file)

# --- Step 4: Insert data into Supabase ---
for article in constitution_data:
    response = supabase.table("constitutional_articles").insert({
        "article_number": article["article_number"],
        "title": article["title"],
        "full_text": article["full_text"]
    }).execute()
    print(f"✅ Inserted: Article {article['article_number']}")

print("🎉 All articles inserted successfully!")

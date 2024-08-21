import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url:str = os.getenv("SUPABASE_URL")
key:str = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

response = supabase.table('players_test').select("*").execute()
print(response.data)
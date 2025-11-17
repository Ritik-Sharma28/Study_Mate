import os
from pymongo import MongoClient
from dotenv import load_dotenv

# 1. Load variables from your .env file into the environment
load_dotenv()

# 2. Get the "MONGO" variable from the environment
mongo_uri = os.environ.get("MONGO")

if not mongo_uri:
    raise Exception("MONGO environment variable not set! Please create a .env file.")

# 3. Connect using the variable
client = MongoClient(mongo_uri)
db = client["studymate"]
users_collection = db["users"]
posts_collection = db["posts"]

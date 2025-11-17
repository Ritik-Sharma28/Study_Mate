from pymongo import MongoClient

client = MongoClient(MONGO)
db = client["studymate"]
users_collection = db["users"]
posts_collection = db["posts"]


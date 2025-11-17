from pymongo import MongoClient

client = MongoClient(process.env.MONGO)
db = client["studymate"]
users_collection = db["users"]
posts_collection = db["posts"]



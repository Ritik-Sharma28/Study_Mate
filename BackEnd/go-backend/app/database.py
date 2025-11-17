from pymongo import MongoClient

client = MongoClient("mongodb+srv://ritiksharma14y_db_user:blKgkzCQQXhuCBNf@ritik.ta2zrff.mongodb.net/studymate")
db = client["studymate"]
users_collection = db["users"]
posts_collection = db["posts"]

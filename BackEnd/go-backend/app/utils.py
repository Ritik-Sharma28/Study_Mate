from bson import ObjectId
from datetime import datetime

def serialize_post(post):
    post['_id'] = str(post['_id'])
    post['author'] = str(post['author'])
    post['likes'] = [str(uid) for uid in post.get('likes', [])]

    # createdAt / updatedAt convert to string
    if 'createdAt' in post:
        post['createdAt'] = post['createdAt'].isoformat()
    if 'updatedAt' in post:
        post['updatedAt'] = post['updatedAt'].isoformat()

    return post

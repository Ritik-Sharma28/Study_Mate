from pydantic import BaseModel
from typing import List

class Post(BaseModel):
    author: str
    title: str
    summary: str
    content: str
    tags: List[str] = []
    likes: List[str] = []

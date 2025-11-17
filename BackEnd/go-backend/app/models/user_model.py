from pydantic import BaseModel
from typing import List, Optional

class User(BaseModel):
    name: str
    email: str
    username: str
    password: str
    avatarId: str = "default"
    domains: List[str] = []
    learningStyle: Optional[str] = None
    studyTime: Optional[str] = None
    teamPref: Optional[str] = None

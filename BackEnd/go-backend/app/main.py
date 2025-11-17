from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.find_partner import router as partner_router
from app.routers.recommend_posts import router as posts_router

app = FastAPI()

# Allow all origins so any frontend can access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Be cautious with this in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(partner_router, prefix="/api/v1/partners")
app.include_router(posts_router, prefix="/api/v1/posts")

@app.get("/")
def home():
    return {"message": "Backend running"}

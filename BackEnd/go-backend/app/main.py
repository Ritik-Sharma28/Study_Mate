from fastapi import FastAPI
from app.routers.find_partner import router as partner_router
from app.routers.recommend_posts import router as posts_router

app = FastAPI()

app.include_router(partner_router)
app.include_router(posts_router)

@app.get("/")
def home():
    return {"message": "Backend running"}

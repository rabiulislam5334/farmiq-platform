from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routers.crop import router as crop_router
from routers.chat import router as chat_router
from routers.weather import router as weather_router

load_dotenv()

app = FastAPI(title="FarmIQ AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crop_router)
app.include_router(chat_router)
app.include_router(weather_router)

@app.get("/")
def root():
    return {"message": "🌿 FarmIQ AI Service running", "status": "healthy"}

@app.get("/health")
def health():
    return {"status": "ok"}
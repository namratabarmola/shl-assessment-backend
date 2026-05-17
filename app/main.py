from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# This routes directly to your endpoints.py file inside the api subfolder
from app.api.endpoints import router

app = FastAPI()

# Enable CORS so your local React frontend can safely communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This includes all your functional routes (like /chat) from endpoints.py
app.include_router(router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient

app = FastAPI()

# Middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Direct MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["product_transparency"]   # <--- This must be a string
collection = db["products"]

@app.get("/")
def root():
    return {"message": "✅ FastAPI + MongoDB connected!"}

@app.post("/api/suggest-questions")
def generate_questions(payload: dict):
    category = payload.get("category", "").lower()
    if "food" in category:
        questions = ["Is the product organic?", "List ingredients.", "Any allergens?"]
    else:
        questions = ["Provide safety/compliance certifications."]
    
    collection.insert_one({
        "name": payload.get("name", ""),
        "category": payload.get("category", ""),
        "questions": questions
    })
    
    return {"questions": questions}




# to run venv\Scripts\activate

# uvicorn ai-service.app:app --reload --port 5001
# 
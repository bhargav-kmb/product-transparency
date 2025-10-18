from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or your frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["product_transparency"]
collection = db["products"]

class ProductInput(BaseModel):
    name: str
    category: str

@app.post("/api/suggest-questions")
def suggest_questions(payload: ProductInput):
    category = payload.category.lower()
    if "food" in category:
        questions = ["Is the product organic?", "List ingredients.", "Any allergens?"]
    else:
        questions = ["Provide safety/compliance certifications."]
    
    collection.insert_one({
        "name": payload.name,
        "category": payload.category,
        "questions": questions
    })

    return {"questions": questions}

@app.get("/")
def root():
    return {"message": "FastAPI AI service running"}

from fastapi import APIRouter, HTTPException
from models.rag_model import load_rag_model
from model_schemas.query import Query

router = APIRouter()

# Load the model
rag_model = load_rag_model()

@router.get("/ping")
async def ping():
    return {"message": "pong"}

@router.post("/retrieve")
async def retrieve(query: Query):
    try:
        # Use your RetrievalQA chain to get the answer
        result = rag_model({"context": "", "question": query.question})
        return {"answer": result['result'].strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
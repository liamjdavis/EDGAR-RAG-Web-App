from fastapi import APIRouter, HTTPException
from models.rag_model import load_rag_model
from model_schemas.query import Query

router = APIRouter()

# Load the model
rag_model = load_rag_model()
print("loaded rag model")

@router.get("/ping/")
async def ping():
    return {"message": "pong"}

@router.post("/retrieve/")
async def retrieve(query: Query):
    try:
        # Use your RetrievalQA chain to get the answer
        result = rag_model.invoke(query.question)
        answer = result['result'].strip()

        # Extract the relevant answer after the "assistant" part# Find the keyword "assistant" in the result and return only the content after it
        keyword = "<|start_header_id|>assistant<|end_header_id|>"
        if keyword in answer:
            answer = answer.split(keyword)[-1].strip()

        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
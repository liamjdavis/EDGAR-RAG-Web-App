from fastapi import FastAPI
from routes import query

app = FastAPI()

app.include_router(query.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
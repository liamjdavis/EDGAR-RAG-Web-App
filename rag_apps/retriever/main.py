from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import query

app = FastAPI()

# List of allowed origins
origins = [
    "http://nextjs_app",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
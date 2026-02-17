from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.projects import router as projects_router

app = FastAPI(title="RightGhar API", version="1.0.0")

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects_router)


@app.get("/health")
async def health():
    return {"status": "ok"}

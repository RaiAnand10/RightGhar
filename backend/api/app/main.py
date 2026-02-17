from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.middleware import AnonymousUserMiddleware
from app.routers.projects import router as projects_router
from app.routers.quotes import router as quotes_router
from app.routers.reviews import router as reviews_router
from app.routers.notes import router as notes_router
from app.routers.favorites import router as favorites_router
from app.routers.chat import router as chat_router

app = FastAPI(title="RightGhar API", version="1.0.0")

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Anonymous user identity via cookie
app.add_middleware(AnonymousUserMiddleware)

app.include_router(projects_router)
app.include_router(quotes_router)
app.include_router(reviews_router)
app.include_router(notes_router)
app.include_router(favorites_router)
app.include_router(chat_router)


@app.get("/health")
async def health():
    return {"status": "ok"}

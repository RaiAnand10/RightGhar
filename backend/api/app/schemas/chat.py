from pydantic import BaseModel, Field
from typing import List
from app.schemas.project import ProjectListItem


class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    session_id: str = Field(..., description="Unique session identifier for conversation tracking")
    message: str = Field(..., min_length=1, description="User message to send to the chatbot")


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    response: str = Field(..., description="Assistant's response message")
    references: List[ProjectListItem] = Field(default=[], description="Referenced project listings")

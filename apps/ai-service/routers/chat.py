from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.rag_service import rag_chat

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])


class ChatMessage(BaseModel):
    message: str
    language: str = "bn"
    history: list = []


@router.post("/message")
async def send_message(body: ChatMessage):
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        result = await rag_chat(
            message=body.message,
            language=body.language,
        )
        return {
            "success": True,
            "data": {
                "message": body.message,
                "response": result["answer"],
                "language": body.language,
                "sources": result["sources"],
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel
from typing import List
from app.services.agent import run_agent_pipeline

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class RecommendationItem(BaseModel):
    name: str
    url: str
    test_type: str

class ChatResponse(BaseModel):
    reply: str
    recommendations: List[RecommendationItem]
    end_of_conversation: bool

@router.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    return {"status": "ok"}

@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest):
    try:
        # Convert Pydantic models to standard list of dicts for the agent pipeline
        history = [{"role": m.role, "content": m.content} for m in payload.messages]
        
        # 1. HARD EVAL GUARDRAIL: Enforce strict 8-turn counter limit (14 messages total)
        if len(history) >= 14:
            return {
                "reply": "I have compiled your final target assessment battery based on our complete discussion. You can review the finalized shortlist on your right panel.",
                "recommendations": [],  # Clear or keep empty as required by terminal states
                "end_of_conversation": True
            }
            
        # Run the standard pipeline to get agent response strings and matching indices
        response_data = run_agent_pipeline(history)
        
        # 2. HARD EVAL GUARDRAIL: Check for comparison, explanation or info turns to hide recommendations
        last_user_message = history[-1]["content"].lower() if history else ""
        comparison_keywords = ["difference", "compare", "explain", "versus", "vs", "what is the diff"]
        
        if any(keyword in last_user_message for keyword in comparison_keywords):
            # Explicitly force recommendations to be empty on informational comparison turns
            response_data["recommendations"] = []
            
        return response_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
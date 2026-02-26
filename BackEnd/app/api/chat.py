from app.schemas.chat import ChatRequest, ChatResponse
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.repositories.query_repository import create_query_log, get_user_history, get_user_stats
from app.models.user import User
from app.services.chat import ask_question as service_ask_question
from pydantic import BaseModel
from app.schemas.query import Query as QuerySchema
from app.utils.logger import logger

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router = APIRouter(prefix="/chat", tags=["chat"])

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@router.post("/", response_model=ChatResponse)
async def ask_question(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    response_data = await service_ask_question(request.question)
    
    create_query_log(
        db=db,
        query=request.question,
        response=response_data["answer"],
        user_id=current_user.id
    )
    
    return response_data


# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@router.get("/history/{user_id}", response_model=List[QuerySchema])
def get_my_history(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    logger.info(f"Fetching chat history for user_id: {user_id} (Requested by: {current_user.username})")
    try:
        history = get_user_history(db, user_id)
        logger.info(f"Found {len(history)} history entries for user_id {user_id}")
        return history
    except Exception as e:
        logger.error(f"Error fetching chat history for user_id {user_id}: {e}")
        raise


# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@router.get("/stats", response_model=Dict[str, Any])
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return get_user_stats(db, current_user.id)


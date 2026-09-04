from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.schemas import CopilotQuery, CopilotResponse
from app.services.copilot_service import copilot_service
from app.models.all_models import User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])

@router.post("/query", response_model=CopilotResponse)
def query_copilot(query_in: CopilotQuery, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    res = copilot_service.answer_query(query_in.question, db)
    return res

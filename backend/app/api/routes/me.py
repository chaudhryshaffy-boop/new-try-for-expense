from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.schemas.common import Message

router = APIRouter()


@router.get("/me", response_model=Message)
def read_me(user_id: str = Depends(get_current_user)) -> Message:
	return Message(message=user_id)
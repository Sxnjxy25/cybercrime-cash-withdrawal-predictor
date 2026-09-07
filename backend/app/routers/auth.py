from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.all_models import User, AuditLog
from app.schemas.schemas import UserLogin, Token, UserOut
from app.services.auth_service import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class ProfileUpdateRequest(BaseModel):
    full_name: str
    email: str
    badge_id: Optional[str] = None

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        audit = AuditLog(
            username=login_data.username,
            role="UNKNOWN",
            action="LOGIN_FAILED",
            resource="/api/v1/auth/login",
            details="Invalid username or password attempt.",
            status="FAILED"
        )
        db.add(audit)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    
    audit = AuditLog(
        username=user.username,
        role=user.role,
        action="USER_LOGIN",
        resource="/api/v1/auth/login",
        details="User logged into Command Center session successfully.",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "badge_id": user.badge_id,
            "state": user.state,
            "district": user.district
        }
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    audit = AuditLog(
        username=current_user.username,
        role=current_user.role,
        action="USER_LOGOUT",
        resource="/api/v1/auth/logout",
        details="User ended session.",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()
    return {"message": "Logged out successfully"}

@router.post("/change-password")
def change_password(req: PasswordChangeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password does not match.")
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")
    current_user.hashed_password = get_password_hash(req.new_password)
    audit = AuditLog(
        username=current_user.username,
        role=current_user.role,
        action="PASSWORD_CHANGE",
        resource="/api/v1/auth/change-password",
        details="Admin user changed security passcode successfully.",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()
    return {"status": "success", "message": "Password updated successfully."}

@router.put("/profile")
def update_profile(req: ProfileUpdateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.full_name = req.full_name
    current_user.email = req.email
    if req.badge_id:
        current_user.badge_id = req.badge_id
    db.commit()
    return {
        "status": "success",
        "message": "Officer profile updated successfully.",
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role,
            "badge_id": current_user.badge_id
        }
    }

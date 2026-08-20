from datetime import timedelta
from typing import Optional
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.api import deps
from app.models.user import User, Role
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import Token, ForgotPassword, ResetPassword
from jose import jwt, JWTError

router = APIRouter()

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=7)
    
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "refresh_token": security.create_refresh_token(
            user.id, expires_delta=refresh_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserResponse)
def register_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
):
    """
    Register a new user.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    hashed_password = security.get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Get current user profile.
    """
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_user_profile(
    profile_in: ProfileUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Update current user profile.
    """
    if profile_in.email and profile_in.email != current_user.email:
        existing = db.query(User).filter(User.email == profile_in.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered by another user.")
        current_user.email = profile_in.email

    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/change-password")
def change_password(
    password_in: ChangePasswordRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Change password for logged-in user.
    """
    if not security.verify_password(password_in.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password does not match.")

    current_user.hashed_password = security.get_password_hash(password_in.new_password)
    db.add(current_user)
    db.commit()
    return {"message": "Password changed successfully."}

@router.post("/refresh-token", response_model=Token)
def refresh_token(
    refresh_token: str, db: Session = Depends(deps.get_db)
):
    """
    Refresh access token
    """
    try:
        payload = jwt.decode(
            refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Invalid token type")
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="Invalid user")
            
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return {
            "access_token": security.create_access_token(
                user.id, expires_delta=access_token_expires
            ),
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.post("/forgot-password")
def forgot_password(
    form: ForgotPassword, db: Session = Depends(deps.get_db)
):
    """
    Forgot password flow
    """
    user = db.query(User).filter(User.email == form.email).first()
    if user:
        reset_token = security.create_access_token(user.id, expires_delta=timedelta(hours=1))
        print(f"--- MOCK EMAIL ---")
        print(f"To: {user.email}")
        print(f"Subject: Password Reset Request")
        print(f"Link: http://localhost:3000/reset-password?token={reset_token}")
        print(f"------------------")
        
    return {"message": "If an account exists, a reset link has been sent to the email address."}

@router.post("/reset-password")
def reset_password(
    form: ResetPassword, db: Session = Depends(deps.get_db)
):
    """
    Reset password
    """
    try:
        payload = jwt.decode(
            form.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid token")
            
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        user.hashed_password = security.get_password_hash(form.new_password)
        db.commit()
        return {"message": "Password reset successfully"}
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.schemas.user import UserCreate, User, UserInDBBase
from app.repositories.user_repository import (
    check_user_existe,
    create_user,
    get_all_users,
    get_user_by_username,
    update_activation_user
)
from app.core.database import get_db
from fastapi.security import OAuth2PasswordRequestForm
from app.security.jwt import create_access_token
from app.security.password import verify_password
from app.schemas.auth import Token
from app.core.deps import get_current_active_user
from app.utils.logger import logger


# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router = APIRouter(prefix="/users", tags=["users"])

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):

    db_user = check_user_existe(
        db=db,
        email=user.email,
        username=user.username,
    )

    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )

    return create_user(db=db, user=user)


# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_username(db, username=form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    logger.info(f"User {form_data.username} logging in...")
    user_acivate = update_activation_user(db, user, is_active=True)
    logger.info(f"Login activation result for {user.username}: {getattr(user_acivate, 'is_active', 'None')}")
    access_token = create_access_token(subject=user.username)
    return {"access_token": access_token, "token_type": "bearer"}


# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@router.post("/logout", response_model=User, status_code=status.HTTP_201_CREATED)
def deconnexion(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    logger.info(f"User {current_user.username} logging out...")
    user_acivate = update_activation_user(db, current_user, is_active=False)
    logger.info(f"Logout deactivation result for {current_user.username}: {getattr(user_acivate, 'is_active', 'None')}")
    return user_acivate
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserInDBBase, UserUpdate
from app.models.user import User as User_Model
from app.security.password import hash_password 
from typing import List, Union, Any
from app.utils.logger import logger

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def check_user_existe(db: Session, email: str, username:str):
    return (
        db.query(User_Model)
        .filter((User_Model.email == email) | (User_Model.username == username))
        .first()
    )
    
# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::    
def create_user(db:Session, user:UserCreate):
    db_user = User_Model(
        email=user.email,
        username=user.username,
        password_hash=hash_password(user.password),
        role=user.role,
        is_active=False
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def get_user_by_username(db: Session, username: str):
    return db.query(User_Model).filter((User_Model.username == username) | (User_Model.email == username)).first()

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def get_user_by_id(db: Session, id: int):
    return db.query(User_Model).filter(User_Model.id == id).first()

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def get_all_users(db: Session) -> List[UserInDBBase]:
    return db.query(User_Model).all()

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def update_activation_user(db: Session, user: Union[UserUpdate, User_Model], is_active: bool = True):
    logger.info(f"Updating activation for user: {getattr(user, 'username', 'unknown')} to {is_active}")
    
    if isinstance(user, User_Model):
        db_user = user
    else:
        db_user = (
            db.query(User_Model)
            .filter(
                (User_Model.username == user.username) |
                (User_Model.email == user.email)
            )
            .first()
        )

    if not db_user:
        logger.warning(f"User not found for activation update: {user}")
        return None
    
    db_user.is_active = is_active
    logger.info(f"Setting is_active to {is_active} for user {db_user.username}")

    db.commit()
    db.refresh(db_user)
    
    logger.info(f"User {db_user.username} is_active status in DB after refresh: {db_user.is_active}")

    return db_user
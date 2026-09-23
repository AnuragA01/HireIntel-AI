from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)


def register_user(
    db: Session,
    full_name: str,
    email: str,
    password: str,
    role: str,
):
    # Check whether email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        return None

    # Hash password before storing it
    hashed_password = hash_password(password)

    # Create new user
    new_user = User(
        full_name=full_name,
        email=email,
        password_hash=hashed_password,
        role=role,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def login_user(
    db: Session,
    email: str,
    password: str,
):
    # Find user by email
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        return None

    # Verify password
    password_valid = verify_password(
        password,
        user.password_hash,
    )

    if not password_valid:
        return None

    # Create JWT token
    access_token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
        }
    )

    return access_token
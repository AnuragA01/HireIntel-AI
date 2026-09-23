from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):

    full_name: str = Field(
        min_length=3,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        min_length=6,
        max_length=100,
    )

    role: Literal["candidate", "recruiter"]


class LoginRequest(BaseModel):

    email: EmailStr

    password: str


class UserResponse(BaseModel):

    id: int
    full_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):

    access_token: str
    token_type: str
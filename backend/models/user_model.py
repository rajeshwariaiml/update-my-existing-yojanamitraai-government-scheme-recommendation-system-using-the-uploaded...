"""
User Model
==========
Pydantic schemas for auth + profile request/response payloads.
No ORM — persistence is JSON files in backend/database/.
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None


class ProfileModel(BaseModel):
    # email is now optional so demo profiles (per the multilingual spec) save
    # successfully. When omitted, the controller treats the record as the
    # default/demo profile.
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    income: Optional[float] = None
    state: Optional[str] = None
    district: Optional[str] = None
    occupation: Optional[str] = None
    category: Optional[str] = None
    education_level: Optional[str] = None

    # Kannada-aware fields (auto-populated when occupation/category arrive
    # in Kannada). Clients may send them too — both shapes are accepted.
    occupation_original: Optional[str] = None
    occupation_en: Optional[str] = None
    category_original: Optional[str] = None
    category_en: Optional[str] = None


class RecommendRequest(BaseModel):
    query: Optional[str] = None
    profile: Optional[dict] = None
    mode: str = "form"  # "nlp" | "form"
    top_k: int = 10

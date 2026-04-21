"""
Recommend Routes
================
POST /recommend-schemes

Body:
    { "query": "...", "profile": { ... }, "mode": "nlp" | "form", "top_k": 10 }

Delegates to ml_pipeline.recommendation_pipeline via the recommend controller.
"""

from fastapi import APIRouter

from controllers.recommend_controller import recommend_schemes
from models.user_model import RecommendRequest

router = APIRouter(tags=["recommend"])


@router.post("/recommend-schemes")
def recommend(payload: RecommendRequest):
    return recommend_schemes(
        query=payload.query,
        profile=payload.profile,
        mode=payload.mode,
        top_k=payload.top_k,
    )

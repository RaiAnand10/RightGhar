"""Dependency to extract the anonymous user cookie from request state."""

from fastapi import Request, HTTPException


def get_user_cookie(request: Request) -> str:
    uid = getattr(request.state, "user_cookie", None)
    if not uid:
        raise HTTPException(status_code=400, detail="Missing user identity cookie")
    return uid

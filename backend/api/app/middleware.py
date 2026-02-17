"""
Middleware to assign a rightghar_uid cookie (UUID) to every visitor.
This serves as an anonymous user identity — no login required.
"""

import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

COOKIE_NAME = "rightghar_uid"
COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2  # 2 years


class AnonymousUserMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        uid = request.cookies.get(COOKIE_NAME)
        if not uid:
            uid = str(uuid.uuid4())

        # Attach to request state so routers can access it
        request.state.user_cookie = uid

        response: Response = await call_next(request)

        # Always (re)set the cookie to extend expiry
        response.set_cookie(
            key=COOKIE_NAME,
            value=uid,
            max_age=COOKIE_MAX_AGE,
            httponly=False,  # frontend may read it if needed
            samesite="lax",
            secure=False,  # set True in production with HTTPS
        )
        return response

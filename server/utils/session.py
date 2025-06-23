from fastapi import Request

def get_session_from_cookies(request: Request) -> str:
    """쿠키에서 세션 값을 추출"""
    session_cookie = request.cookies.get("session")
    return session_cookie if session_cookie else ""

"""Rate limiting local para proteger rotas expostas.

Em produção com múltiplas instâncias, substitua este armazenamento em memória por
Redis ou outro backend compartilhado.
"""
from collections import defaultdict, deque
from threading import Lock
from time import monotonic

from fastapi import HTTPException, Request, status

_requests = defaultdict(deque)
_lock = Lock()


def enforce_rate_limit(request: Request, scope: str, limit: int, window_seconds: int) -> None:
    client_ip = request.client.host if request.client else "unknown"
    key = f"{scope}:{client_ip}"
    now = monotonic()
    with _lock:
        attempts = _requests[key]
        while attempts and attempts[0] <= now - window_seconds:
            attempts.popleft()
        if len(attempts) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Muitas tentativas. Aguarde alguns minutos e tente novamente.",
                headers={"Retry-After": str(window_seconds)},
            )
        attempts.append(now)

import base64
import hashlib
from cryptography.fernet import Fernet
from app.core.config import settings

def _get_fernet_key() -> bytes:
    # Gerador de chave Fernet de 32 bytes a partir da SECRET_KEY da aplicação
    key_hash = hashlib.sha256(settings.SECRET_KEY.encode('utf-8')).digest()
    return base64.urlsafe_b64encode(key_hash)

_fernet = Fernet(_get_fernet_key())

def encrypt_val(val: str) -> str:
    """
    Criptografa um dado sensível em formato texto plano usando AES-128/Fernet (Base64).
    """
    if not val or not isinstance(val, str):
        return val
    try:
        # Se o dado já for um token Fernet válido, retorna sem duplicar encriptação
        if val.startswith("gAAAAA"):
            return val
        return _fernet.encrypt(val.encode('utf-8')).decode('utf-8')
    except Exception as e:
        raise ValueError(f"Falha de segurança ao criptografar dado sensível: {e}") from e

def decrypt_val(val: str) -> str:
    """
    Descriptografa um token Fernet para o dado original em texto claro.
    """
    if not val or not isinstance(val, str):
        return val
    try:
        if val.startswith("gAAAAA"):
            return _fernet.decrypt(val.encode('utf-8')).decode('utf-8')
        return val
    except Exception as e:
        return val

from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: str
    senha: str

class UserOut(BaseModel):
    id: str
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

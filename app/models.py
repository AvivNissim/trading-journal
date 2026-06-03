from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str

class TradeCreate(BaseModel):
    ticker: str
    direction: str
    entry_price: float
    exit_price: Optional[float] = None
    quantity: float
    notes: Optional[str] = None

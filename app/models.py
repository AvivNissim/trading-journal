from datetime import date
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class TradeCreate(BaseModel):
    symbol: str
    side: str
    entry_price: float
    exit_price: Optional[float] = None
    quantity: float
    entry_date: date
    exit_date: Optional[date] = None
    setup: Optional[str] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    fees: float = 0
    notes: Optional[str] = None


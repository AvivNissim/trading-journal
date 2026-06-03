from fastapi import FastAPI
from app.database import init_db
from app.database import init_db, get_connection
from app.models import UserCreate, TradeCreate

app = FastAPI()

@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def root():
    return {"message": "Trading Journal API running"}

@app.get("/health")
def health():
    return {"status": "ok"}



@app.post("/register")
def register(user: UserCreate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        (user.username, user.password)
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return {"message": "User created", "id": user_id}


@app.post("/login")
def login(user: UserCreate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        (user.username, user.password)
    )
    found_user = cursor.fetchone()
    conn.close()

    if not found_user:
        return {"message": "Invalid credentials"}

    return {"message": "Login successful", "user_id": found_user["id"]}


@app.post("/users/{user_id}/trades")
def create_trade(user_id: int, trade: TradeCreate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO trades (user_id, ticker, direction, entry_price, exit_price, quantity, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        trade.ticker,
        trade.direction,
        trade.entry_price,
        trade.exit_price,
        trade.quantity,
        trade.notes
    ))
    conn.commit()
    trade_id = cursor.lastrowid
    conn.close()
    return {"message": "Trade created", "trade_id": trade_id}


@app.get("/users/{user_id}/trades")
def get_user_trades(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM trades WHERE user_id = ? ORDER BY id DESC",
        (user_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

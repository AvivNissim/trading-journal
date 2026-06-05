from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.database import init_db, get_connection
from app.models import UserCreate, TradeCreate



app = FastAPI()

# app.mount("/static", StaticFiles(directory="app/static"), name="static")
# templates = Jinja2Templates(directory="templates")

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def root():
    return RedirectResponse(url="/app")

@app.get("/app")
def app_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={"request": request}
    )

@app.get("/health")
def health():
    return {"status": "ok"}

# @app.get("/app")
# def app_page(request: Request):
#     return templates.TemplateResponse(
#         request=request,
#         name="index.html",
#         context={}
#     )


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


@app.post("/trades")
def create_trade(trade: TradeCreate, user_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    status = "closed" if trade.exit_price is not None else "open"

    cursor.execute("""
        INSERT INTO trades (
            user_id, symbol, side, entry_price, exit_price, quantity,
            entry_date, exit_date, status, setup, stop_loss,
            take_profit, fees, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        trade.symbol.upper(),
        trade.side.lower(),
        trade.entry_price,
        trade.exit_price,
        trade.quantity,
        trade.entry_date.isoformat(),
        trade.exit_date.isoformat() if trade.exit_date else None,
        status,
        trade.setup,
        trade.stop_loss,
        trade.take_profit,
        trade.fees,
        trade.notes
    ))

    conn.commit()
    trade_id = cursor.lastrowid
    conn.close()

    return {"message": "Trade created", "trade_id": trade_id, "status": status}


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


@app.put("/trades/{trade_id}")
def update_trade(trade_id: int, trade: TradeCreate):
    conn = get_connection()
    cursor = conn.cursor()

    status = "closed" if trade.exit_price is not None else "open"

    cursor.execute("""
        UPDATE trades
        SET symbol = ?,
            side = ?,
            entry_price = ?,
            exit_price = ?,
            quantity = ?,
            entry_date = ?,
            exit_date = ?,
            status = ?,
            setup = ?,
            stop_loss = ?,
            take_profit = ?,
            fees = ?,
            notes = ?
        WHERE id = ?
    """, (
        trade.symbol.upper(),
        trade.side.lower(),
        trade.entry_price,
        trade.exit_price,
        trade.quantity,
        trade.entry_date.isoformat(),
        trade.exit_date.isoformat() if trade.exit_date else None,
        status,
        trade.setup,
        trade.stop_loss,
        trade.take_profit,
        trade.fees,
        trade.notes,
        trade_id
    ))

    conn.commit()
    conn.close()

    return {"message": "Trade updated", "status": status}
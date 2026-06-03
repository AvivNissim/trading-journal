let currentUserId = null;

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const authMessage = document.getElementById("authMessage");

const tickerInput = document.getElementById("ticker");
const directionInput = document.getElementById("direction");
const entryPriceInput = document.getElementById("entryPrice");
const exitPriceInput = document.getElementById("exitPrice");
const quantityInput = document.getElementById("quantity");
const notesInput = document.getElementById("notes");
const addTradeBtn = document.getElementById("addTradeBtn");
const loadTradesBtn = document.getElementById("loadTradesBtn");
const tradeMessage = document.getElementById("tradeMessage");
const tradesTableBody = document.getElementById("tradesTableBody");

async function registerUser() {
  const payload = {
    username: usernameInput.value.trim(),
    password: passwordInput.value.trim()
  };

  if (!payload.username || !payload.password) {
    authMessage.textContent = "Please enter username and password";
    return;
  }

  const response = await fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  authMessage.textContent = data.message || "Register completed";
}

registerBtn.addEventListener("click", registerUser);

async function loginUser() {
  const payload = {
    username: usernameInput.value.trim(),
    password: passwordInput.value.trim()
  };

  if (!payload.username || !payload.password) {
    authMessage.textContent = "Please enter username and password";
    return;
  }

  const response = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (data.user_id) {
    currentUserId = data.user_id;
    authMessage.textContent = `Login successful. User ID: ${currentUserId}`;
  } else {
    authMessage.textContent = data.message || "Login failed";
  }
}

loginBtn.addEventListener("click", loginUser);

async function addTrade() {
  if (!currentUserId) {
    tradeMessage.textContent = "Please login first";
    return;
  }

  const payload = {
    ticker: tickerInput.value.trim(),
    direction: directionInput.value,
    entry_price: Number(entryPriceInput.value),
    exit_price: exitPriceInput.value ? Number(exitPriceInput.value) : null,
    quantity: Number(quantityInput.value),
    notes: notesInput.value.trim()
  };

  if (!payload.ticker || !payload.entry_price || !payload.quantity) {
    tradeMessage.textContent = "Please fill ticker, entry price and quantity";
    return;
  }

  const response = await fetch(`/users/${currentUserId}/trades`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  tradeMessage.textContent = data.message || "Trade added";
}

addTradeBtn.addEventListener("click", addTrade);


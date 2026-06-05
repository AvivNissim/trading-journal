let currentUserId = null;

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const authMessage = document.getElementById("authMessage");
const sessionMessage = document.getElementById("sessionMessage");

const tickerInput = document.getElementById("ticker");
const directionInput = document.getElementById("direction");
const entryPriceInput = document.getElementById("entryPrice");
const exitPriceInput = document.getElementById("exitPrice");
const quantityInput = document.getElementById("quantity");
const notesInput = document.getElementById("notes");
const addTradeBtn = document.getElementById("addTradeBtn");
const tradesTableBody = document.getElementById("tradesTableBody");
const tradeMessage = document.getElementById("tradeMessage");

const exitPriceValue = document.getElementById("exitPrice").value;
const exitDateValue = document.getElementById("exitDate").value;

const payload = {
  symbol: document.getElementById("symbol").value,
  side: document.getElementById("side").value,
  entry_price: Number(document.getElementById("entryPrice").value),
  exit_price: exitPriceValue === "" ? null : Number(exitPriceValue),
  quantity: Number(document.getElementById("quantity").value),
  entry_date: document.getElementById("entryDate").value,
  exit_date: exitDateValue === "" ? null : exitDateValue,
  setup: document.getElementById("setup").value || null,
  stop_loss: document.getElementById("stopLoss").value === "" ? null : Number(document.getElementById("stopLoss").value),
  take_profit: document.getElementById("takeProfit").value === "" ? null : Number(document.getElementById("takeProfit").value),
  fees: document.getElementById("fees").value === "" ? 0 : Number(document.getElementById("fees").value),
  notes: document.getElementById("notes").value || null
};

function updateAuthUIAfterLogin(username) {
  registerBtn.classList.add("hidden");
  loginBtn.classList.add("hidden");
  sessionMessage.textContent = `Connected as ${username}`;
}

function clearTradeForm() {
  tickerInput.value = "";
  directionInput.value = "Long";
  entryPriceInput.value = "";
  exitPriceInput.value = "";
  quantityInput.value = "";
  notesInput.value = "";
}

function renderTrades(trades) {
  tradesTableBody.innerHTML = "";

  for (const trade of trades) {
    const row = document.createElement("tr");
    const statusBadge = trade.status === "closed"
      ? '<span class="badge closed">Closed</span>'
      : '<span class="badge open">Open</span>';
    row.innerHTML = `
    <td>${trade.symbol}</td>
    <td>${trade.side}</td>
    <td>${trade.entry_price}</td>
    <td>${trade.exit_price ?? "-"}</td>
    <td>${trade.quantity}</td>
    <td>${trade.entry_date}</td>
    <td>${trade.exit_date ?? "-"}</td>
    <td>${statusBadge}</td>
    `;
    tradesTableBody.appendChild(row);
  }
}

async function loadTrades() {
  if (!currentUserId) {
    return;
  }

  const response = await fetch(`/users/${currentUserId}/trades`);
  const data = await response.json();

  renderTrades(data);
  tradeMessage.textContent = `Loaded ${data.length} trades`;
}

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
    authMessage.textContent = "Login successful";
    updateAuthUIAfterLogin(payload.username);
    await loadTrades();
  } else {
    authMessage.textContent = data.message || "Login failed";
  }
}

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

  if (data.id) {
    currentUserId = data.id;
    authMessage.textContent = "Registration successful and logged in";
    updateAuthUIAfterLogin(payload.username);
    await loadTrades();
  } else {
    authMessage.textContent = data.message || "Registration failed";
  }
}

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

  if (data.trade_id) {
    tradeMessage.textContent = "Trade created successfully";
    clearTradeForm();
    await loadTrades();
  } else {
    tradeMessage.textContent = data.message || "Failed to create trade";
  }
}

registerBtn.addEventListener("click", registerUser);
loginBtn.addEventListener("click", loginUser);
addTradeBtn.addEventListener("click", addTrade);


const API_BASE = localStorage.getItem("authApiBase") || "http://localhost:8081/api/auth";

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const formTitle = document.getElementById("form-title");
const statusMsg = document.getElementById("status-msg");
const apiBaseLabel = document.getElementById("api-base-label");

const openLoginButton = document.getElementById("open-login");
const openRegisterButton = document.getElementById("open-register");
const ctaLoginButton = document.getElementById("cta-login");
const ctaRegisterButton = document.getElementById("cta-register");
const closePanelButton = document.getElementById("close-panel");
const authPanel = document.getElementById("auth-panel");

apiBaseLabel.textContent = API_BASE;

let currentMode = "login";

function showStatus(message, type = "info") {
  statusMsg.textContent = message;
  statusMsg.classList.remove("hidden", "bg-red-50", "text-red-700", "bg-emerald-50", "text-emerald-700", "bg-slate-100", "text-slate-700");

  if (type === "error") {
    statusMsg.classList.add("bg-red-50", "text-red-700");
    return;
  }

  if (type === "success") {
    statusMsg.classList.add("bg-emerald-50", "text-emerald-700");
    return;
  }

  statusMsg.classList.add("bg-slate-100", "text-slate-700");
}

function switchMode(mode) {
  currentMode = mode;
  const isLogin = mode === "login";

  formTitle.textContent = isLogin ? "Login" : "Register";
  loginForm.classList.toggle("hidden", !isLogin);
  registerForm.classList.toggle("hidden", isLogin);

  openLoginButton.classList.toggle("bg-slate-100", isLogin);
  openRegisterButton.classList.toggle("bg-brand-700", !isLogin);

  statusMsg.classList.add("hidden");
  authPanel.classList.remove("hidden");
}

function hidePanel() {
  authPanel.classList.add("hidden");
}

async function postJson(path, payload) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const rawBody = await response.text();
  const data = rawBody ? JSON.parse(rawBody) : {};

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const payload = {
    email: formData.get("email")?.toString().trim(),
    password: formData.get("password")?.toString(),
  };

  try {
    showStatus("Signing you in...", "info");
    const result = await postJson("/login", payload);

    localStorage.setItem("authToken", result.token || "");
    localStorage.setItem("currentUser", JSON.stringify(result));

    showStatus("Login successful. Token saved to localStorage.", "success");
    loginForm.reset();
  } catch (error) {
    showStatus(error.message || "Unable to login.", "error");
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(registerForm);
  const payload = {
    fullName: formData.get("fullName")?.toString().trim(),
    email: formData.get("email")?.toString().trim(),
    password: formData.get("password")?.toString(),
    role: formData.get("role")?.toString(),
  };

  try {
    showStatus("Creating your account...", "info");
    await postJson("/register", payload);

    showStatus("Registration successful. Please login now.", "success");
    registerForm.reset();
    switchMode("login");
  } catch (error) {
    showStatus(error.message || "Unable to register.", "error");
  }
});

openLoginButton.addEventListener("click", () => switchMode("login"));
openRegisterButton.addEventListener("click", () => switchMode("register"));
ctaLoginButton.addEventListener("click", () => switchMode("login"));
ctaRegisterButton.addEventListener("click", () => switchMode("register"));
closePanelButton.addEventListener("click", hidePanel);

switchMode("login");

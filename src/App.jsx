import { useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const isLogin = mode === "login";

  function switchMode() {
    setMode(isLogin ? "signup" : "login");
    setMessage({ text: "", type: "" });
    setPassword("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setMessage({ text: "Please enter username and password", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch(`${API_URL}/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.message || "Something went wrong", type: "error" });
        return;
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      } else {
        setMessage({ text: `${data.message}. Please login.`, type: "success" });
        setMode("login");
        setPassword("");
      }
    } catch {
      setMessage({ text: "Cannot reach the server. Is the backend running?", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUsername("");
    setPassword("");
    setMessage({ text: "", type: "" });
  }

  if (token) {
    return (
      <div className="container">
        <div className="card">
          <h2>Welcome{username ? `, ${username}` : ""}!</h2>
          <p className="subtitle">You are logged in.</p>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <form className="card" onSubmit={handleSubmit}>
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        <p className="subtitle">
          {isLogin ? "Welcome back! Please sign in." : "Create a new account."}
        </p>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          autoComplete={isLogin ? "current-password" : "new-password"}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message.text && <p className={`message ${message.type}`}>{message.text}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </button>

        <p className="switch">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button type="button" className="link" onClick={switchMode}>
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </form>
    </div>
  );
}

export default App;

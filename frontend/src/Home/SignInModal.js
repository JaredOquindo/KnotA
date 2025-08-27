import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./HomePage.css";

export default function SignInModal({ onClose, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      if (!data.token || !data.user || !data.user.role) {
        setError("Login successful, but server response missing critical user data.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setIsLoading(false);
      onClose();

      const redirectPath = data.user.role === "superadmin" ? "/superadmin" : "/app";
      navigate(redirectPath);
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <AnimatePresence>
        <motion.div
          className="login-modal-box"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.35 }}
        >
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            ✖
          </button>

          <div className="login-modal-content">
            <div className="login-left-side">
              <div className="login-top-label">Keeping Networks of Ties</div>
              <img src="/Knot4.png" alt="Graduates" className="login-image" />
            </div>

            <div className="login-right-side">
              <h2 className="login-welcome">
                Welcome to <span className="knot-span">knot</span>
              </h2>

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="email-input">Email</label>
                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                    className={error ? "input-error" : ""}
                  />
                </div>

                <div className="form-group password-group">
                  <label htmlFor="password-input">Password</label>
                  <div className="password-input-container">
                    <input
                      id="password-input"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      disabled={isLoading}
                      className={error ? "input-error" : ""}
                    />
                    <span
                      className="password-toggle-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>

                {error && <p className="error-message">{error}</p>}

                <button type="submit" className="login-btn-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Log in"}
                </button>

                <div className="login-divider">OR LOGIN WITH</div>
                <button type="button" className="google-login-btn" disabled={isLoading}>
                  <FcGoogle /> Google
                </button>
              </form>

              <p className="already-account">
                Don’t have an account yet?{" "}
                <span className="login-link" onClick={onSwitchToRegister}>
                  Sign up
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

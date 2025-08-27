import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "./HomePage.css";

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      alert("✅ Registration successful! You can now log in.");
      onSwitchToLogin();
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <AnimatePresence>
        <motion.div
          className="login-modal-box"
          initial={{ opacity: 0, y: 50 }}   // start invisible & below
          animate={{ opacity: 1, y: 0 }}    // fade in & slide to center
          exit={{ opacity: 0, y: 50 }}      // fade out & slide down
          transition={{ duration: 0.35 }}
        >
          <button className="close-btn" onClick={onClose}>✖</button>

          <div className="login-modal-content">
            <div className="login-left-side">
              <div className="login-top-label">Keeping Networks of Ties</div>
              <img src="/Knot4.png" alt="Graduates" className="login-image" />
            </div>

            <div className="login-right-side">
              <h2 className="login-welcome">
                Create a <span className="knot-span">knot</span> account
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="form-group password-group">
                  <label>Password</label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                    />
                    <span
                      className="password-toggle-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
                <div className="form-group password-group">
                  <label>Confirm Password</label>
                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      required
                    />
                    <span
                      className="password-toggle-icon"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>

                <button type="submit" className="login-btn-full" disabled={loading}>
                  {loading ? "Registering..." : "Sign Up"}
                </button>
              </form>

              <p className="already-account">
                Already have an account?{" "}
                <span className="login-link" onClick={onSwitchToLogin}>
                  Log in
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

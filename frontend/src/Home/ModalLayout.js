// ModalLayout.jsx
import "./HomePage.css";

export default function ModalLayout({ onClose, children }) {
  return (
    <div className="modal-overlay">
      <div className="login-modal-box">
        {/* Close Button */}
        <button className="close-btn" onClick={onClose}>✖</button>

        <div className="login-modal-content">
          {/* Left Side (always same) */}
          <div className="login-left-side">
            <div className="login-top-label">Keeping Networks of Ties</div>
            <img
              src="/Knot4.png"
              alt="Illustration"
              className="login-image"
            />
          </div>

          {/* Right Side (changes per modal) */}
          <div className="login-right-side">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

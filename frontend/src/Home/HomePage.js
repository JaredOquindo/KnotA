import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRightLong, FaArrowRightToBracket } from "react-icons/fa6";
import { motion } from "framer-motion"; // ✅ animations
import RegisterModal from "./RegisterModal";
import SignInModal from "./SignInModal";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Sticky Header scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleRegister = (data) => {
    console.log("Registered User:", data);
    setShowRegister(false);
  };

  const openLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const openRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

  const goToInstitutionRegistration = () => {
    navigate("/register-institution");
  };

  return (
    <div className="home-page">
      {/* Floating Icons */}
      <div className="floating-icons homepage-icons">
        <span className="icon">★</span>
        <span className="icon">✿</span>
        <span className="icon">❖</span>
        <span className="icon">✦</span>
      </div>

      {/* Sticky Header */}
      <header className={`header-container ${isScrolled ? "scrolled" : ""}`}>
        <div className="logo-container">
          <img src="/knot7.png" alt="Knot Logo" className="logo" />
        </div>
        <div className="auth-buttons">
          <nav className="nav-links">
            <a href="#home" className="nav-link active">Home</a>
            <a href="#why-knot" className="nav-link">About</a>
          </nav>
          <button className="signin-btn" onClick={openLogin}>Sign In</button>
          <button className="signup-btn" onClick={openRegister}>Sign Up</button>
        </div>
      </header>

      {/* Hero Section */}
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        id="home"
      >
        <motion.div 
          className="hero-text-container"
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="hero-top-label">Keeping Networks of Ties</div>
          <h1>Your Alumni Tie <br /> Starts Here</h1>
          <p>
            Knot is an alumni tracking and engagement platform that aims to
            strengthen the connection between universities and their alumni.
          </p>
          <div className="hero-buttons">
            <button 
              className="tie-in-btn" 
              onClick={goToInstitutionRegistration}
            >
              Tie In <span className="icon"><FaArrowRightToBracket /></span>
            </button>
            <a href="#why-knot">
              <button className="learn-more-btn">
                Learn More <span className="icon"><FaArrowRightLong /></span>
              </button>
            </a>
          </div>
        </motion.div>

        <motion.div 
          className="side-image-container"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <img src="/Group91.png" alt="Alumni Tie" className="side-image" />
        </motion.div>
      </motion.div>

      {/* Why Knot Section */}
      <motion.section 
        className="why-knot-section" 
        id="why-knot"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="why-knot-container">
          <h2>Why Knot?</h2>
          <p>
            Knot is your all-in-one platform designed to keep alumni and institutions tied together through meaningful engagement. 
            With features like Donations, Events, News, Surveys, and Mentorship, your alumni can stay connected, give back, and grow with your community.
          </p>
          <div className="features-grid">
            {["Donation Campaign", "Event Management", "News", "Survey", "Mentorship"].map((f, i) => (
              <motion.div 
                key={i} 
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                viewport={{ once: true }}
              >
                {f}
              </motion.div>
            ))}
          </div>
          <a href="#join-now">
            <button className="learn-more-btn-full">
              Learn More <span className="icon"><FaArrowRightLong /></span>
            </button>
          </a>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section 
        className="join-now-section"
        id="join-now"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h3>Join Now and Start Creating Connections</h3>
        <p>Start building a bridge to your institution</p>
        <div className="join-buttons">
          <button 
            className="tie-in-btn" 
            onClick={goToInstitutionRegistration}
          >
            Tie In <span className="icon"><FaArrowRightToBracket /></span>
          </button>
          <a href="#home">
            <button className="learn-more-btn">
              Back to Top <span className="icon"><FaArrowRightLong /></span>
            </button>
          </a>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-logo-section">
            <img src="/knot7.png" alt="Knot Logo" className="footer-logo" />
            <p>
              Knot is an alumni tracking and engagement platform that aims to
              strengthen the connection between universities and their alumni.
            </p>
          </div>
          <div className="footer-links-group">
            <h4 className="footer-link-heading">About Us <span className="arrow">›</span></h4>
            <a href="/mission">Mission, Vision & Values</a>
            <a href="/story">Our story</a>
            <div className="contact-info">
              <p className="footer-contact-info">support@knot.tech</p>
              <p className="footer-contact-info">+63 (900) 000-0000</p>
            </div>
          </div>
          <div className="footer-links-group">
            <h4 className="footer-link-heading">Platform <span className="arrow">›</span></h4>
            <a href="/campaigns">Campaign</a>
            <a href="/events">Event Management</a>
            <a href="/news">News</a>
            <a href="/surveys">Survey</a>
            <a href="/mentorship">Mentorship</a>
          </div>
          <div className="footer-links-group">
            <h4 className="footer-link-heading">Support <span className="arrow">›</span></h4>
            <a href="mailto:support@knot.tech">Email Us Directly</a>
            <a href="/knowledge-base">Knowledge Base</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Copyright ©2025 Knot. All Rights Reserved.</p>
          <div className="bottom-links">
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-of-use">Terms of Use</a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showLogin && (
        <SignInModal 
          onClose={() => setShowLogin(false)} 
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}
      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          handleRegister={handleRegister}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
}

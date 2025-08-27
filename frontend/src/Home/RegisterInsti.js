import { useState, useEffect } from "react";
import "./RegisterInsti.css";

export default function InstitutionRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState({
    officialInstitutionName: "",
    institutionType: "",
    accreditationStatus: "",
    contactEmail: "",
    contactPhone: "",
    institutionWebsite: "",
    physicalAddress: "",
    verificationDocuments: [],
    institutionLogo: null,
    missionStatement: "",
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNextStep = () => setCurrentStep((prev) => prev + 1);
  const handlePreviousStep = () => setCurrentStep((prev) => prev - 1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, key) => {
    if (key === "verificationDocuments") {
      setRegistrationData((prev) => ({
        ...prev,
        verificationDocuments: Array.from(e.target.files),
      }));
    } else {
      setRegistrationData((prev) => ({
        ...prev,
        [key]: e.target.files[0],
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();

      Object.entries(registrationData).forEach(([key, value]) => {
        if (key === "verificationDocuments" && value.length > 0) {
          value.forEach((file) => formData.append("verificationDocuments", file));
        } else if (key === "institutionLogo" && value) {
          formData.append("institutionLogo", value);
        } else {
          formData.append(key, value);
        }
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/institutions`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Failed to submit: ${response.statusText}`);

      await response.json();
      setSuccess(true);
      handleNextStep(); // go to Finish step
    } catch (err) {
      console.error("Submission error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Sticky Header */}
      <header className={`header-container ${isScrolled ? "scrolled" : ""}`}>
        <div className="logo-container">
          <a href="/">
            <img src="/knot7.png" alt="Knot Logo" className="logo" />
          </a>
        </div>
        <div className="auth-buttons">
          <button type="button" className="signin-btn">
            Sign In
          </button>
          <button type="button" className="signup-btn">
            Sign Up
          </button>
        </div>
      </header>

      <div className="institution-registration-container">
        <div className="main-content-wrapper">
          {/* Stepper */}
          <div className="stepper-container">
            <h2>Institution Registration</h2>
            <div className="stepper-tracker">
              {["Institution Info", "Verification Docs", "Identity", "Finish"].map(
                (label, index) => (
                  <div
                    key={label}
                    className={`stepper-step ${currentStep >= index + 1 ? "active" : ""}`}
                  >
                    <div className="stepper-circle">{index + 1}</div>
                    <span className="stepper-text">{label}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="register-insti-form">
            {currentStep === 1 && (
              <div className="form-step">
                <h3>Step 1: Institution Information</h3>
                <input
                  type="text1"
                  name="officialInstitutionName"
                  placeholder="Official Institution Name"
                  value={registrationData.officialInstitutionName}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text1"
                  name="institutionType"
                  placeholder="Institution Type"
                  value={registrationData.institutionType}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text1"
                  name="accreditationStatus"
                  placeholder="Accreditation Status"
                  value={registrationData.accreditationStatus}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="email1"
                  name="contactEmail"
                  placeholder="Contact Email"
                  value={registrationData.contactEmail}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="tel"
                  name="contactPhone"
                  placeholder="Contact Phone"
                  value={registrationData.contactPhone}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="url"
                  name="institutionWebsite"
                  placeholder="Website URL (Optional)"
                  value={registrationData.institutionWebsite}
                  onChange={handleInputChange}
                />
                <input
                  type="text1"
                  name="physicalAddress"
                  placeholder="Physical Address"
                  value={registrationData.physicalAddress}
                  onChange={handleInputChange}
                  required
                />
                <button type="button" onClick={handleNextStep}>
                  Next
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="form-step">
                <h3>Step 2: Verification Documents</h3>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(e, "verificationDocuments")}
                  required
                />
                <div className="form-navigation">
                  <button type="button" onClick={handlePreviousStep}>
                    Back
                  </button>
                  <button type="button" onClick={handleNextStep}>
                    Next
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="form-step">
                <h3>Step 3: Institution Identity (Optional)</h3>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "institutionLogo")}
                />
                <textarea
                  name="missionStatement"
                  placeholder="Brief mission or vision statement"
                  value={registrationData.missionStatement}
                  onChange={handleInputChange}
                />
                <div className="form-navigation">
                  <button type="button" onClick={handlePreviousStep}>
                    Back
                  </button>
                  {/* ✅ Only this one actually submits */}
                  <button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
                {error && <p className="error-text">{error}</p>}
              </div>
            )}

            {currentStep === 4 && success && (
              <div className="form-step">
                <h3>Registration Submitted Successfully!</h3>
                <p>
                  Thank you for registering. Our administrators will now review your
                  submission. You will receive an email once approved.
                </p>
                <button type="button" onClick={() => (window.location.href = "/")}>
                  Return to Home
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* FOOTER SECTION */}
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
              <p className="footer-contact-info"><span></span> support@knot.tech</p>
              <p className="footer-contact-info"><span></span> +63 (900) 000-0000</p>
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
    </div>
  );
}

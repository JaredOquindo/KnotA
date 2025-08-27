import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import "./ProfilePage.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account"); // account | institution | documents | paymaya

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  // PayMaya state
  const [paymayaData, setPaymayaData] = useState({
    accountName: "",
    subMerchantId: "",
  });
  const [paymayaLocked, setPaymayaLocked] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");

  // 🔲 Modal states
  const [imageModal, setImageModal] = useState({
    open: false,
    type: null, // "user" | "institution"
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user data");

        const data = await res.json();
        setUser(data);
        setInstitution(data.institution || null);

        setFormData({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zipCode || "",
          country: data.country || "",
        });

        // Prefill PayMaya if backend provides
        setPaymayaData({
          accountName: data.paymayaAccountName || "",
          subMerchantId: data.paymayaSubMerchantId || "",
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
        setUser({ fullName: "Guest User" });
        setInstitution(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // 🔒 Auto-lock PayMaya when leaving the tab
  useEffect(() => {
    if (activeTab !== "paymaya") {
      setPaymayaLocked(true);
    }
  }, [activeTab]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handlePaymayaChange = (e) => {
    setPaymayaData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUnlockPaymaya = () => {
    // TODO: Replace with real backend password verification
    if (passwordInput === "1234") {
      setPaymayaLocked(false);
      setPasswordInput("");
    } else {
      alert("Incorrect password");
    }
  };

  // 🔲 Modal Handlers
  const openImageModal = (type) => {
    setImageModal({ open: true, type });
    setPreviewImage(null);
  };

  const closeImageModal = () => {
    setImageModal({ open: false, type: null });
    setPreviewImage(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const saveNewImage = () => {
    if (previewImage) {
      if (imageModal.type === "user") {
        setUser((prev) => ({ ...prev, profileImage: previewImage }));
      } else if (imageModal.type === "institution") {
        setInstitution((prev) => ({ ...prev, logo: previewImage }));
      }
    }
    closeImageModal();
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-images-row">
            {/* Profile Image */}
            <div
              className="profile-avatar-wrapper"
              onClick={() => openImageModal("user")}
            >
              <div className="profile-avatar no-image">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="User" />
                ) : (
                  "no image"
                )}
              </div>
              <div className="image-label">Your Profile</div>
            </div>

            {/* Institution Logo */}
            <div
              className="institution-logo-wrapper"
              onClick={() => openImageModal("institution")}
            >
              <div className="institution-logo no-image">
                {institution?.logo ? (
                  <img src={institution.logo} alt="Institution" />
                ) : (
                  "no image"
                )}
              </div>
              <div className="image-label">Your Institution</div>
            </div>
          </div>

          {/* Admin Info Box */}
          <div className="admin-info-box">
            <div className="admin-label">Admin</div>
            <div className="admin-content">
              <h3 className="admin-name">{user.fullName}</h3>
              {institution && (
                <p className="admin-institution">
                  {institution.officialInstitutionName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main-content">
          {/* Tabs */}
          <div className="profile-tabs">
            <button
              className={activeTab === "account" ? "active-tab" : ""}
              onClick={() => setActiveTab("account")}
            >
              Account Settings
            </button>
            <button
              className={activeTab === "institution" ? "active-tab" : ""}
              onClick={() => setActiveTab("institution")}
            >
              Institution Settings
            </button>
            <button
              className={activeTab === "documents" ? "active-tab" : ""}
              onClick={() => setActiveTab("documents")}
            >
              Documents
            </button>
            <button
              className={activeTab === "paymaya" ? "active-tab" : ""}
              onClick={() => setActiveTab("paymaya")}
            >
              PayMaya Settings
            </button>
          </div>

          <div className="tab-content" style={{ position: "relative" }}>
            {/* Edit Icon */}
            {!isEditing &&
              (activeTab === "account" ||
                activeTab === "institution" ||
                activeTab === "paymaya") && (
                <FaEdit
                  className="edit-icon"
                  onClick={() => setIsEditing(true)}
                />
              )}

            {/* Account Settings */}
            {activeTab === "account" && (
              <div className="profile-form">
                <div className="form-row">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="input-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="input-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="input-group">
                    <label>Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="input-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="profile-actions">
                    <button className="save-btn" onClick={handleSave}>
                      Save
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Institution Settings */}
            {activeTab === "institution" && institution && (
              <div className="profile-form">
                <div className="form-row">
                  <div className="input-group">
                    <label>Institution Name</label>
                    <input
                      type="text"
                      value={institution.officialInstitutionName || ""}
                      onChange={(e) =>
                        setInstitution((prev) => ({
                          ...prev,
                          officialInstitutionName: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="input-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={institution.contactEmail || ""}
                      onChange={(e) =>
                        setInstitution((prev) => ({
                          ...prev,
                          contactEmail: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={institution.contactPhone || ""}
                      onChange={(e) =>
                        setInstitution((prev) => ({
                          ...prev,
                          contactPhone: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="input-group">
                    <label>Type</label>
                    <input
                      type="text"
                      value={institution.institutionType || ""}
                      onChange={(e) =>
                        setInstitution((prev) => ({
                          ...prev,
                          institutionType: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Accreditation</label>
                    <input
                      type="text"
                      value={institution.accreditationStatus || ""}
                      onChange={(e) =>
                        setInstitution((prev) => ({
                          ...prev,
                          accreditationStatus: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="profile-actions">
                    <button className="save-btn" onClick={handleSave}>
                      Save
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Documents */}
            {activeTab === "documents" && (
              <div className="documents-page">
                <h3>Documents</h3>
                <p>No documents uploaded yet.</p>
              </div>
            )}

            {/* PayMaya Settings */}
            {activeTab === "paymaya" && (
              <div className="paymaya-page">
                <h3>PayMaya Settings</h3>

                {paymayaLocked ? (
                  <div className="unlock-section">
                    <p>This page is locked. Enter your account password:</p>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                    />
                    <button onClick={handleUnlockPaymaya}>Unlock</button>
                  </div>
                ) : (
                  <div className="profile-form">
                    <div className="form-row">
                      <div className="input-group">
                        <label>PayMaya Account Name</label>
                        <input
                          type="text"
                          name="accountName"
                          value={paymayaData.accountName}
                          onChange={handlePaymayaChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="input-group">
                        <label>Submerchant ID</label>
                        <input
                          type="text"
                          name="subMerchantId"
                          value={paymayaData.subMerchantId}
                          onChange={handlePaymayaChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="profile-actions">
                        <button className="save-btn" onClick={handleSave}>
                          Save
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔲 Image Modal */}
      {imageModal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <FaEdit
              className="modal-edit-icon"
              onClick={() =>
                document.getElementById("fileInput").click()
              }
            />
            <div className="modal-image-box">
              {previewImage ? (
                <img src={previewImage} alt="Preview" />
              ) : (
                <p>Upload new image</p>
              )}
            </div>
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleImageUpload}
            />
            <div className="modal-actions">
              <button className="save-btn" onClick={saveNewImage}>
                Save
              </button>
              <button className="cancel-btn" onClick={closeImageModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

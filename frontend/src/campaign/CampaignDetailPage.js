import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdOutlineDeleteOutline } from "react-icons/md";
import "./CampaignDetailPage.css";
import DonationForm from "./DonationForm";

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    keyTerms: "",
    contactEmail: "",
    contactPhone: "",
  });

  function getBase64Image(imgString) {
    if (!imgString) return null;
    if (imgString.startsWith("http") || imgString.startsWith("data:image"))
      return imgString;
    return `data:image/png;base64,${imgString}`;
  }

  const formatToPhilippinePeso = (amount) => {
    if (isNaN(amount)) return "₱0.00";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDonationDate = (isoString) => {
    if (!isoString) return "No Date Available";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Invalid Date";
    const options = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return date.toLocaleDateString("en-PH", options);
  };

  const fetchCampaign = useCallback(async () => {
    setCampaign(null);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/campaigns/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setCampaign(data);
      setIsClosed(data.isClosed === true);
      setFormData({
        title: data.title || "",
        description: data.description || "",
        keyTerms: data.keyTerms ? data.keyTerms.join(", ") : "",
        contactEmail: data.contactEmail || "",
        contactPhone: data.contactPhone || "",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load campaign details.");
    }
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const donors = campaign ? campaign.donations : [];
  const totalDonated = donors.reduce((sum, d) => sum + d.amount, 0);
  const targetAmount = campaign ? campaign.targetAmount : 0;
  const progressPercentage = (totalDonated / targetAmount) * 100;
  const formattedProgress = Math.min(progressPercentage, 100).toFixed(2);
  const backLink = isClosed ? "/app/campaigns/archive" : "/app/campaigns";
  const backLabel = isClosed ? "Archive" : "Campaigns";

  const handleClose = async () => {
    if (!window.confirm("Are you sure you want to close this campaign?")) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/campaigns/${id}/close`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok)
        throw new Error(`Failed to close campaign, status: ${res.status}`);
      alert("Campaign closed successfully.");
      navigate("/app/campaigns/archive");
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to DELETE this campaign? This action cannot be undone."
      )
    )
      return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/campaigns/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok)
        throw new Error(`Failed to delete campaign, status: ${res.status}`);
      alert("Campaign deleted successfully.");
      navigate("/app/campaigns");
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const updatedCampaign = {
      ...formData,
      keyTerms: formData.keyTerms
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/campaigns/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updatedCampaign),
      });
      if (!res.ok)
        throw new Error(`Failed to update campaign, status: ${res.status}`);
      const data = await res.json();
      setCampaign(data);
      setIsEditing(false);
      setLoading(false);
      alert("Campaign updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDonationSubmit = () => {
    fetchCampaign();
  };

  return (
    <div className="container">
      <div className="header">
        <Link to={backLink} className="back-link">
          ← Back to {backLabel}
        </Link>
      </div>

      <div className="event-buttons">
        {!isClosed && (
          <button
            className="icon-btn"
            onClick={() => setIsEditing(true)}
            disabled={loading}
            title="Edit Campaign"
          >
            <FaEdit size={20} />
          </button>
        )}

        <button
          className="icon-btn danger-btn"
          onClick={handleDelete}
          disabled={loading}
          title="Delete Campaign"
        >
          <MdOutlineDeleteOutline size={20} />
        </button>

        {!isClosed && (
          <button
            className="danger-btn"
            onClick={handleClose}
            disabled={loading}
          >
            {loading ? "Processing..." : "Close Campaign"}
          </button>
        )}
      </div>

      {error && <p className="error-message">Error: {error}</p>}

      {!campaign ? (
        <p>Loading campaign...</p>
      ) : (
        <>
          <div className="campaign-detail">
            <div className="left-side">
              {campaign.banner ? (
                <img
                  src={getBase64Image(campaign.banner)}
                  alt={`${campaign.title} banner`}
                  className="campaign-banner"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="no-image">No image available</div>
              )}
              <h1 className="campaign-title">{campaign.title}</h1>
              <div className="tags">
                {campaign.keyTerms?.map((term, idx) => (
                  <span key={idx} className="tag">
                    {term}
                  </span>
                ))}
              </div>
              <p className="campaign-description">{campaign.description}</p>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(progressPercentage, 100)}%`,
                    }}
                  />
                  <span className="progress-percentage">
                    {formattedProgress}%
                  </span>
                </div>
                <div className="progress-labels">
                  <span className="raised-amount">
                    {formatToPhilippinePeso(totalDonated)} raised
                  </span>
                  <span className="goal-amount">
                    {formatToPhilippinePeso(targetAmount)} goal
                  </span>
                </div>
              </div>
            </div>

            <div className="right-side">
              {!isClosed && (
                <div style={{ marginTop: 20, textAlign: "center" }}>
                  <button
                    onClick={() => setShowDonationForm(true)}
                    className="primary-btn"
                    style={{ backgroundColor: "#15803d" }}
                  >
                    Make a Donation
                  </button>
                </div>
              )}
              <div className="contact-info">
                <h3>Contact Information</h3>
                <p>
                  <b>Email:</b> {campaign.contactEmail || "N/A"}
                </p>
                <p>
                  <b>Phone:</b> {campaign.contactPhone || "N/A"}
                </p>
              </div>

              <div className="donors">
                <h3>Donors</h3>
                {donors.length > 0 ? (
                  <ul>
                    {donors.map((donor, idx) => (
                      <li key={idx}>
                        <div className="donor-card">
                          <div className="donor-info">
                            <div className="donor-avatar"></div>
                            <div className="donor-text">
                              <h4>{donor.name}</h4>
                              <span className="donation-date">
                                Donated on {formatDonationDate(donor.donatedAt)}
                              </span>
                            </div>
                          </div>
                          <div className="donation-amount-container">
                            <span className="donation-amount">
                              {formatToPhilippinePeso(donor.amount)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No donations yet.</p>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="edit-section" style={{ marginTop: 20 }}>
              <h3>Edit Campaign</h3>
              <label>
                Title:
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </label>
              <label>
                Description:
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </label>
              <label>
                Key Terms (comma separated):
                <input
                  type="text"
                  name="keyTerms"
                  value={formData.keyTerms}
                  onChange={handleChange}
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                />
              </label>
              <label>
                Phone:
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                />
              </label>
              <div className="form-actions" style={{ marginTop: 10 }}>
                <button
                  className="primary-btn"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  className="danger-btn"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  style={{ marginLeft: 8 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showDonationForm && (
        <DonationForm
          onClose={() => setShowDonationForm(false)}
          onSubmit={handleDonationSubmit}
          campaignId={id}
        />
      )}
    </div>
  );
}

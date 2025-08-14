import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./CampaignDetailPage.css";

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    keyTerms: "",
    contactEmail: "",
    contactPhone: "",
  });

  function getBase64Image(imgString) {
    if (!imgString) return null;
    if (imgString.startsWith("data:image")) return imgString;
    return `data:image/png;base64,${imgString}`;
  }

  useEffect(() => {
    fetch(`http://localhost:5000/campaigns/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCampaign(data);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          keyTerms: data.keyTerms ? data.keyTerms.join(", ") : "",
          contactEmail: data.contactEmail || "",
          contactPhone: data.contactPhone || "",
        });
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const donors = [
    { name: "John Doe", amount: 100 },
    { name: "Jane Smith", amount: 50 },
    { name: "Bob Johnson", amount: 75 },
  ];

  const totalDonated = donors.reduce((sum, d) => sum + d.amount, 0);
  const targetAmount = 500; // example target

  const handleClose = () => {
    if (!window.confirm("Are you sure you want to close this campaign?")) return;

    setLoading(true);
    fetch(`http://localhost:5000/campaigns/${id}/close`, { method: "PATCH" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to close campaign, status: ${res.status}`);
        alert("Campaign closed successfully.");
        navigate("/campaigns");
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to DELETE this campaign? This action cannot be undone.")) return;

    setLoading(true);
    fetch(`http://localhost:5000/campaigns/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to delete campaign, status: ${res.status}`);
        alert("Campaign deleted successfully.");
        navigate("/campaigns");
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleSave = () => {
    setLoading(true);
    const updatedCampaign = {
      ...formData,
      keyTerms: formData.keyTerms
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
    };

    fetch(`http://localhost:5000/campaigns/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedCampaign),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to update campaign, status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCampaign(data);
        setIsEditing(false);
        setLoading(false);
        alert("Campaign updated successfully.");
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="campaign-page">
      <div className="campaign-container">
        <Link to="/campaigns" className="back-link">
          ← Back to Campaigns
        </Link>

        {error && <p className="error-message">Error: {error}</p>}

        {!campaign ? (
          <p>Loading campaign...</p>
        ) : (
          <div className="campaign-detail">
            {/* Left Side */}
            <div className="left-side">
              {campaign.banner ? (
                <img
                  src={getBase64Image(campaign.banner)}
                  alt={`${campaign.title} banner`}
                  className="campaign-banner"
                />
              ) : (
                <div className="no-image">No image available</div>
              )}

              <h1 className="campaign-title">{campaign.title}</h1>

              <div className="tags">
                {campaign.keyTerms?.map((term, idx) => (
                  <span key={idx} className="tag">{term}</span>
                ))}
              </div>

              <p className="campaign-description">{campaign.description}</p>

              {/* Donation thermometer / progress bar */}
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min((totalDonated / targetAmount) * 100, 100)}%` }}
                />
              </div>
              <p style={{ textAlign: "center", marginTop: 4 }}>
                ${totalDonated} raised of ${targetAmount}
              </p>
            </div>

            {/* Right Side */}
            <div className="right-side">
              <div className="campaign-buttons">
                <button className="primary-btn" onClick={() => setIsEditing(true)} disabled={loading}>
                  Edit
                </button>
                <button className="primary-btn" onClick={handleClose} disabled={loading}>
                  Close Campaign
                </button>
                <button className="danger-btn" onClick={handleDelete} disabled={loading}>
                  Delete
                </button>
              </div>

              <div className="contact-info">
                <p><b>Email:</b> {campaign.contactEmail || "N/A"}</p>
                <p><b>Phone:</b> {campaign.contactPhone || "N/A"}</p>
              </div>

              <div className="donors">
                <h3>Donors</h3>
                <ul>
                  {donors.map((donor, idx) => (
                    <li key={idx}>{donor.name} - ${donor.amount}</li>
                  ))}
                </ul>
              </div>

              {isEditing && (
                <div className="edit-section" style={{ marginTop: 20 }}>
                  <h3>Edit Campaign</h3>
                  <label>
                    Title:
                    <input type="text" name="title" value={formData.title} onChange={handleChange} />
                  </label>
                  <label>
                    Description:
                    <textarea name="description" value={formData.description} onChange={handleChange} />
                  </label>
                  <label>
                    Key Terms (comma separated):
                    <input type="text" name="keyTerms" value={formData.keyTerms} onChange={handleChange} />
                  </label>
                  <label>
                    Email:
                    <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} />
                  </label>
                  <label>
                    Phone:
                    <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange} />
                  </label>
                  <div className="form-actions" style={{ marginTop: 10 }}>
                    <button className="primary-btn" onClick={handleSave} disabled={loading}>
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button className="danger-btn" onClick={() => setIsEditing(false)} disabled={loading} style={{ marginLeft: 8 }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

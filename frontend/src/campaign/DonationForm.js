import React, { useState } from "react";
import "./DonationForm.css";

const DonationForm = ({ onClose, onSubmit, campaignId }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
    company: "",
    receiveUpdates: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();
    const donationDataWithTimestamp = {
      ...formData,
      timestamp: now.toISOString(),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/campaigns/${campaignId}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationDataWithTimestamp),
      });

      if (!response.ok) {
        throw new Error('Failed to save donation');
      }

      const updatedCampaign = await response.json();
      console.log('Donation successfully saved:', updatedCampaign);

      if (onSubmit) {
        onSubmit(updatedCampaign);
      }

      onClose();
    } catch (error) {
      console.error('Error submitting donation:', error);
      alert('Error submitting donation. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>Make a Donation</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Your name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Your email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Donation Amount (PHP):
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="1"
            />
          </label>
          <label>
            Company name (if applicable):
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="receiveUpdates"
              checked={formData.receiveUpdates}
              onChange={handleChange}
            />
            I would like to receive occasional updates via email
          </label>
          <button type="submit" className="donate-btn">
            Donate
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonationForm;
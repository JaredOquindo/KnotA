import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// reuse the same CSS

export default function AddCampaignPage() {
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    startDate: "",
    endDate: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
  });

  const [keyTerms, setKeyTerms] = useState([]); // array of tags
  const [currentTerm, setCurrentTerm] = useState(""); // current input
  const [images, setImages] = useState([]); // array of uploaded images (max 3)
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Key terms
  const handleKeyTermChange = (e) => setCurrentTerm(e.target.value);
  const handleAddTerm = () => {
    const term = currentTerm.trim();
    if (term && !keyTerms.includes(term)) {
      setKeyTerms([...keyTerms, term]);
    }
    setCurrentTerm("");
  };
  const handleRemoveTerm = (termToRemove) =>
    setKeyTerms(keyTerms.filter((t) => t !== termToRemove));

  // Image upload (max 3)
  const handleImageUpload = (file) => {
    if (!file) return;
    if (images.length >= 3) {
      alert("Maximum 3 images allowed");
      return;
    }
    setImages([...images, file]);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };
  const handleFileChange = (e) => handleImageUpload(e.target.files[0]);
  const removeImage = (idx) =>
    setImages(images.filter((_, index) => index !== idx));

  // Submit campaign
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("targetAmount", formData.targetAmount);
    data.append("startDate", formData.startDate);
    data.append("endDate", formData.endDate);
    data.append("description", formData.description);
    data.append("contactEmail", formData.contactEmail);
    data.append("contactPhone", formData.contactPhone);
    data.append("keyTerms", JSON.stringify(keyTerms));

    images.forEach((img) => data.append("pictures", img));

    try {
      const res = await fetch("http://localhost:5000/campaigns", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        navigate("/campaigns");
      } else {
        alert("Failed to create campaign");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating campaign");
    }
  };

  return (
    <div className="add-event-container">
      <Link to="/campaigns">⬅ Back to Campaigns</Link>
      <h1>Add Campaign</h1>
      <form onSubmit={handleSubmit}>
        <div className="left-column">
          <input
            name="title"
            placeholder="Campaign Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            name="targetAmount"
            type="number"
            placeholder="Target Amount"
            value={formData.targetAmount}
            onChange={handleChange}
            min={0}
            required
          />
          <div className="date-row">
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
          <textarea
            name="description"
            placeholder="Description (max 300 characters)"
            value={formData.description}
            onChange={handleChange}
            maxLength={300}
            required
          />

          {/* Image Upload */}
          <div
            className="image-upload-box"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("imageInput").click()}
          >
            {images.length > 0 ? (
              <div className="image-preview-container">
                {images.map((img, idx) => (
                  <div key={idx} className="image-preview-wrapper">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Preview ${idx + 1}`}
                      className="image-preview"
                    />
                    <span className="remove-image" onClick={() => removeImage(idx)}>
                      ×
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p>Click or drag image here to upload (max 3)</p>
            )}
            <input
              type="file"
              id="imageInput"
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="right-column">
          {/* Key Terms Input */}
          <div className="key-terms-input">
            <input
              type="text"
              placeholder="Add key term"
              value={currentTerm}
              onChange={handleKeyTermChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTerm();
                }
              }}
            />
            <button type="button" onClick={handleAddTerm}>
              Add
            </button>
          </div>

          <div className="tags-container">
            {keyTerms.map((term, index) => (
              <div key={index} className="tag">
                {term} <span onClick={() => handleRemoveTerm(term)}>×</span>
              </div>
            ))}
          </div>

          {/* Move Contact Info under key terms */}
          <input
            name="contactEmail"
            type="email"
            placeholder="Contact Email"
            value={formData.contactEmail}
            onChange={handleChange}
            required
          />
          <input
            name="contactPhone"
            placeholder="Contact Phone"
            value={formData.contactPhone}
            onChange={handleChange}
            required
          />

          <button type="submit">Submit Campaign</button>
        </div>
      </form>
    </div>
  );
}

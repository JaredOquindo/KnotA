import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AddEventPage.css";

export default function AddEventPage() {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [keyTerms, setKeyTerms] = useState([]); // array of tags
  const [currentTerm, setCurrentTerm] = useState(""); // current input
  const [image, setImage] = useState(null); // uploaded image
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeyTermChange = (e) => {
    setCurrentTerm(e.target.value);
  };

  const handleAddTerm = () => {
    const term = currentTerm.trim();
    if (term && !keyTerms.includes(term)) {
      setKeyTerms([...keyTerms, term]);
    }
    setCurrentTerm("");
  };

  const handleRemoveTerm = (termToRemove) => {
    setKeyTerms(keyTerms.filter((t) => t !== termToRemove));
  };

  const handleImageUpload = (file) => {
    setImage(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleImageUpload(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("location", formData.location);
    data.append("startDate", formData.startDate);
    data.append("endDate", formData.endDate);
    data.append("description", formData.description);
    data.append("keyTerms", JSON.stringify(keyTerms));
    if (image) data.append("image", image);

    try {
      const res = await fetch("http://localhost:5000/events", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        navigate("/events");
      } else {
        alert("Failed to create event");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating event");
    }
  };

  return (
    <div className="add-event-container">
      <Link to="/events">⬅ Back to Events</Link>
      <h1>Add Event</h1>
      <form onSubmit={handleSubmit}>
        <div className="left-column">
          <input
            name="title"
            placeholder="Event Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
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

          {/* Image Upload Box at the bottom */}
          <div
            className="image-upload-box"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("imageInput").click()}
          >
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="image-preview"
              />
            ) : (
              <p>Click or drag image here to upload</p>
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

          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}

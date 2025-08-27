import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./AddEventPage.css";

export default function AddEventPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Institution ID may come from navigation or backend
  const [institutionId, setInstitutionId] = useState(location.state?.institutionId || null);
  const [loadingInstitution, setLoadingInstitution] = useState(!institutionId);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [keyTerms, setKeyTerms] = useState([]);
  const [currentTerm, setCurrentTerm] = useState("");
  const [images, setImages] = useState([]);

  // Fetch logged-in user's institution if missing
  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("You are not logged in");
          setLoadingInstitution(false);
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/institutions/my-institution`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        console.log("Institution fetch response:", res.status, data);

        if (res.ok && data._id) {
          setInstitutionId(data._id);
        } else {
          alert(data.message || "No institution associated with your account");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to fetch institution");
      } finally {
        setLoadingInstitution(false);
      }
    };

    if (!institutionId) fetchInstitution();
  }, [institutionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeyTermChange = (e) => setCurrentTerm(e.target.value);

  const handleAddTerm = () => {
    const term = currentTerm.trim();
    if (term && !keyTerms.includes(term)) setKeyTerms([...keyTerms, term]);
    setCurrentTerm("");
  };

  const handleRemoveTerm = (termToRemove) => {
    setKeyTerms(keyTerms.filter((t) => t !== termToRemove));
  };

  const handleImageUpload = (file) => {
    if (file) setImages([file]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleImageUpload(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    handleImageUpload(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!institutionId) return alert("Institution ID is missing!");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("location", formData.location);
    data.append("startDate", formData.startDate);
    data.append("endDate", formData.endDate);
    data.append("description", formData.description);
    data.append("keyTerms", JSON.stringify(keyTerms));
    data.append("institution", institutionId);
    images.forEach((img) => data.append("pictures", img));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in");
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        method: "POST",
        body: data,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) navigate("/app/events");
      else {
        const errData = await res.json();
        console.error("Failed to create event:", errData);
        alert(errData.message || "Failed to create event");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating event");
    }
  };

  if (loadingInstitution) return <p>Loading institution data...</p>;

  return (
    <div className="add-event-container">
      <Link to="/app/events">⬅ Back to Events</Link>
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
          <div
            className="image-upload-box"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("imageInput").click()}
          >
            {images[0] ? (
              <img
                src={URL.createObjectURL(images[0])}
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

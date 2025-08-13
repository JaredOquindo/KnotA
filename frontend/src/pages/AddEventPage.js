import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function AddEventPage() {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
    keyTerms: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare form data without images
    const data = new FormData();
    data.append("title", formData.title);
    data.append("location", formData.location);
    data.append("startDate", formData.startDate);
    data.append("endDate", formData.endDate);
    data.append("description", formData.description);

    // Append keyTerms as JSON stringified array
    const termsArray = formData.keyTerms
      .split(",")
      .map((term) => term.trim())
      .filter(Boolean);
    data.append("keyTerms", JSON.stringify(termsArray));

    try {
      const res = await fetch("http://localhost:5000/events", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        navigate("/events"); // Redirect to /events on success
      } else {
        alert("Failed to create event");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating event");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <Link to="/events">⬅ Back to Events</Link>
      <h1>Add Event</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
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
        <textarea
          name="description"
          placeholder="Description (max 300 characters)"
          value={formData.description}
          onChange={handleChange}
          maxLength={300}
          required
        />
        <input
          name="keyTerms"
          placeholder="Key Terms (comma separated)"
          value={formData.keyTerms}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

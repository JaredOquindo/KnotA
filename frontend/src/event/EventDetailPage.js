import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./EventDetailPage.css";

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
    keyTerms: "",
  });

  const [isClosed, setIsClosed] = useState(false);

  // Pagination state for participants
  const [currentPage, setCurrentPage] = useState(1);
  const PARTICIPANTS_PER_PAGE = 5;

  // Mobile layout state - switches at 1000px
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  function getBase64Image(imgString) {
    if (!imgString) return null;
    if (imgString.startsWith("data:image")) return imgString;
    return `data:image/png;base64,${imgString}`;
  }

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 600);
    }

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setEvent(null);
    setError(null);
    fetch(`http://localhost:5000/events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setEvent(data);
        setIsClosed(data.isClosed === true);
        setFormData({
          title: data.title || "",
          location: data.location || "",
          startDate: data.startDate ? data.startDate.slice(0, 10) : "",
          endDate: data.endDate ? data.endDate.slice(0, 10) : "",
          description: data.description || "",
          keyTerms: data.keyTerms ? data.keyTerms.join(", ") : "",
        });
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const backLink = isClosed ? "/events/archive" : "/events";
  const backLabel = isClosed ? "Archive" : "Events";

  const handleClose = () => {
    if (!window.confirm("Are you sure you want to close this event?")) return;

    setLoading(true);
    fetch(`http://localhost:5000/events/${id}/close`, { method: "PATCH" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to close event, status: ${res.status}`);
        alert("Event closed successfully.");
        navigate("/events/archive");
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleDelete = () => {
    if (
      !window.confirm(
        "Are you sure you want to DELETE this event? This action cannot be undone."
      )
    )
      return;

    setLoading(true);
    fetch(`http://localhost:5000/events/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to delete event, status: ${res.status}`);
        alert("Event deleted successfully.");
        navigate("/events");
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

  const handleSave = () => {
    setLoading(true);
    const updatedEvent = {
      ...formData,
      keyTerms: formData.keyTerms
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
    };

    fetch(`http://localhost:5000/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedEvent),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to update event, status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setEvent(data);
        setIsEditing(false);
        setLoading(false);
        alert("Event updated successfully.");
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Pagination helpers
  const participants = event?.participants || [];
  const totalParticipants = participants.length;
  const totalPages = Math.ceil(totalParticipants / PARTICIPANTS_PER_PAGE);
  const displayedParticipants = participants.slice(
    (currentPage - 1) * PARTICIPANTS_PER_PAGE,
    currentPage * PARTICIPANTS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="container">
      <div className="header">
        <Link to={backLink} className="back-link">
          ← Back to {backLabel}
        </Link>
      </div>

      {/* Buttons fixed at top-right inside container */}
      <div className="event-buttons">
        {!event?.isClosed && (
          <button
            className="danger-btn"
            onClick={handleClose}
            disabled={loading}
            title="Close Event"
          >
            {loading ? "Processing..." : "Close Event"}
          </button>
        )}
        <button
          className="primary-btn"
          onClick={() => setIsEditing(true)}
          disabled={loading}
          title="Edit Event"
          style={{ marginLeft: 8 }}
        >
          Edit
        </button>
        <button
          className="danger-btn"
          onClick={handleDelete}
          disabled={loading}
          title="Delete Event"
          style={{ marginLeft: 8 }}
        >
          {loading ? "Processing..." : "Delete"}
        </button>
      </div>

      {error && <p className="error-message">Error: {error}</p>}

      {!event ? (
        <p>Loading event details...</p>
      ) : (
        <>
          <div className={`event-main ${isMobile ? "portrait-layout" : ""}`}>
            {/* Left image */}
            <div className="event-image-box">
              {event.banner ? (
                <img
                  src={getBase64Image(event.banner)}
                  alt={`${event.title} banner`}
                  className="event-banner"
                  onError={(e) => {
                    e.target.style.display = "none";
                    console.warn("Failed to load banner image:", e.target.src);
                  }}
                />
              ) : (
                <div className="no-image">No image available</div>
              )}
            </div>

            {/* Right info box */}
            <div className="event-info-box">
              {/* Key terms */}
              {event.keyTerms && event.keyTerms.length > 0 && (
                <div className="tags" aria-label="Event key terms">
                  {event.keyTerms.map((term, idx) => (
                    <span key={idx} className="chip">
                      {term}
                    </span>
                  ))}
                </div>
              )}

              {/* Dates underneath tags */}
              <div className="dates" style={{ marginTop: "8px" }}>
                <span>
                  <b>Start Date:</b> {new Date(event.startDate).toLocaleDateString()}
                </span>
                <span style={{ marginLeft: 16 }}>
                  <b>End Date:</b> {new Date(event.endDate).toLocaleDateString()}
                </span>
              </div>

              {/* Title */}
              <h1 className="event-title">{event.title}</h1>

              {/* Description */}
              <p className="event-description">{event.description}</p>
            </div>
          </div>

          {/* Participants box */}
          <div className="participants-section">
            <h2>Participants</h2>
            {totalParticipants > 0 ? (
              <>
                <table className="participants-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Batch</th>
                      <th>Address</th>
                      <th>Job Title</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedParticipants.map((p, idx) => (
                      <tr key={idx}>
                        <td>{p.name}</td>
                        <td>{p.batch}</td>
                        <td>{p.address}</td>
                        <td>{p.jobTitle}</td>
                        <td>{p.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pagination">
                  <span>
                    Showing {(currentPage - 1) * PARTICIPANTS_PER_PAGE + 1} to{" "}
                    {Math.min(currentPage * PARTICIPANTS_PER_PAGE, totalParticipants)} of {totalParticipants}
                  </span>
                  <div className="pagination-controls">
                    <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                      {"<"}
                    </button>
                    <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                      {">"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p>No participants have joined this event yet.</p>
            )}
          </div>

          {/* Edit form */}
          {isEditing && (
            <div className="edit-section" style={{ marginTop: 30 }}>
              <h2>Edit Event</h2>
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
                Location:
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </label>
              <label>
                Start Date:
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
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
              <div className="form-actions">
                <button className="primary-btn" onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  style={{ marginLeft: 10 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

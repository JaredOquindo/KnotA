import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdOutlineDeleteOutline } from "react-icons/md";
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

  const PARTICIPANTS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1200);

  function getBase64Image(imgString) {
    if (!imgString) return null;
    if (imgString.startsWith("http") || imgString.startsWith("data:image")) return imgString;
    return `data:image/png;base64,${imgString}`;
  }

  // Handle window resize for mobile layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1200);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch event details
  useEffect(() => {
    setEvent(null);
    setError(null);

    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

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
      } catch (err) {
        console.error(err);
        setError("Failed to load event details.");
      }
    };

    fetchEvent();
  }, [id]);

  const backLink = isClosed ? "/app/events/archive" : "/app/events";
  const backLabel = isClosed ? "Archive" : "Events";

  const handleClose = async () => {
    if (!window.confirm("Are you sure you want to close this event?")) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${id}/close`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Failed to close event, status: ${res.status}`);
      alert("Event closed successfully.");
      navigate("/app/events/archive");
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to DELETE this event? This action cannot be undone."))
      return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Failed to delete event, status: ${res.status}`);
      alert("Event deleted successfully.");
      navigate("/app/events");
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

  const handleSave = async () => {
    setLoading(true);
    const updatedEvent = {
      ...formData,
      keyTerms: formData.keyTerms.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updatedEvent),
      });
      if (!res.ok) throw new Error(`Failed to update event, status: ${res.status}`);
      const data = await res.json();
      setEvent(data);
      setIsEditing(false);
      setLoading(false);
      alert("Event updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Participants pagination
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

      <div className="event-buttons">
        <button
          className="icon-btn"
          onClick={() => setIsEditing(true)}
          disabled={loading}
          title="Edit Event"
        >
          <FaEdit size={20} />
        </button>

        <button
          className="icon-btn danger-btn"
          onClick={handleDelete}
          disabled={loading}
          title="Delete Event"
        >
          <MdOutlineDeleteOutline size={20} />
        </button>

        {!isClosed && (
          <button
            className="danger-btn"
            onClick={handleClose}
            disabled={loading}
          >
            {loading ? "Processing..." : "Close Event"}
          </button>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      {!event ? (
        <p>Loading event details...</p>
      ) : (
        <>
          <div className={`event-main ${isMobile ? "portrait-layout" : ""}`}>
            <div className="event-image-box">
              {event.banner ? (
                <img
                  src={getBase64Image(event.banner)}
                  alt={`${event.title} banner`}
                  className="event-banner"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="no-image">No image available</div>
              )}
            </div>

            <div className="event-info-box">
              {event.keyTerms?.length > 0 && (
                <div className="tags">
                  {event.keyTerms.map((term, idx) => (
                    <span key={idx} className="chip">{term}</span>
                  ))}
                </div>
              )}

              <div className="dates" style={{ marginTop: "8px" }}>
                <span>
                  <b>Start Date:</b> {new Date(event.startDate).toLocaleDateString()}
                </span>
                <span style={{ marginLeft: 16 }}>
                  <b>End Date:</b> {new Date(event.endDate).toLocaleDateString()}
                </span>
              </div>

              <h1 className="event-title">{event.title}</h1>
              <p className="event-description">{event.description}</p>
            </div>
          </div>

          <div className="participants-section">
            <h2>Participants</h2>
            {totalParticipants > 0 ? (
              <>
                <div className="participants-grid">
                  {displayedParticipants.map((p, idx) => (
                    <div key={idx} className="participant-box">
                      <div><strong>Name:</strong> {p.name}</div>
                      <div><strong>Batch:</strong> {p.batch}</div>
                      <div><strong>Address:</strong> {p.address}</div>
                      <div><strong>Job Title:</strong> {p.jobTitle}</div>
                      <div><strong>Date:</strong> {p.date}</div>
                    </div>
                  ))}
                </div>

                <div className="pagination">
                  <span>
                    Showing {(currentPage - 1) * PARTICIPANTS_PER_PAGE + 1} to{" "}
                    {Math.min(currentPage * PARTICIPANTS_PER_PAGE, totalParticipants)} of{" "}
                    {totalParticipants}
                  </span>
                  <div className="pagination-controls">
                    <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>{"<"}</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} onClick={() => goToPage(page)} className={currentPage === page ? "active" : ""}>
                        {page}
                      </button>
                    ))}
                    <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>{">"}</button>
                  </div>
                </div>
              </>
            ) : (
              <p>No participants have joined this event yet.</p>
            )}
          </div>

          {isEditing && (
            <div className="edit-section" style={{ marginTop: 30 }}>
              <h2>Edit Event</h2>
              <label>
                Title: <input type="text" name="title" value={formData.title} onChange={handleChange} />
              </label>
              <label>
                Location: <input type="text" name="location" value={formData.location} onChange={handleChange} />
              </label>
              <label>
                Start Date: <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
              </label>
              <label>
                End Date: <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
              </label>
              <label>
                Description: <textarea name="description" value={formData.description} onChange={handleChange} />
              </label>
              <label>
                Key Terms (comma separated): <input type="text" name="keyTerms" value={formData.keyTerms} onChange={handleChange} />
              </label>

              <div className="form-actions">
                <button className="primary-btn" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)} disabled={loading}>Cancel</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

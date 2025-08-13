import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./EventsPage.css";

export default function ArchivePage() {
  const [events, setEvents] = useState(null); // null means loading
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const EVENTS_PER_PAGE = 3;

  useEffect(() => {
    fetch(`http://localhost:5000/events?isClosed=true&limit=50`)
      .then((res) => res.json())
      .then(({ events }) => {
        setEvents(events);
      })
      .catch((err) => {
        console.error(err);
        setEvents([]);
      });
  }, []);

  function getBase64Image(imgString) {
    if (!imgString) return null;
    if (imgString.startsWith("data:image")) return imgString;
    return `data:image/png;base64,${imgString}`;
  }

  // Filter events by search term (case insensitive)
  const filteredEvents = events
    ? events.filter((event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const currentEvents = filteredEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE);

  // Pagination handlers
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const SkeletonCard = () => (
    <div className="eventCard skeletonCard" aria-busy="true" aria-label="Loading event">
      <div className="eventCardContent">
        <div className="skeletonImage" />
        <div className="keyTermsDatesContainer">
          <div className="skeletonKeyTerms" />
          <div className="skeletonDates" />
        </div>
        <div className="skeletonTitle" />
        <div className="skeletonDescription" />
        <div className="eventFooter">
          <div className="skeletonAttendee" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      <h1>Archived Events</h1>
      <p>Total Archived: {events ? events.length : "..."}</p>

      <div className="header">
        <input
          type="text"
          placeholder="Search archived events by title..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="searchInput"
          disabled={events === null}
        />
      </div>

      {events === null ? (
        <div className="eventsList">
          {[...Array(EVENTS_PER_PAGE)].map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : currentEvents.length === 0 ? (
        <div
          className="eventsList"
          style={{ justifyContent: "center", position: "relative" }}
        >
          <p
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#666",
              fontSize: "1.2rem",
              fontWeight: "bold",
              textAlign: "center",
              width: "100%",
            }}
          >
            No archived events found.
          </p>

          <div
            className="eventCard"
            style={{
              visibility: "hidden",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            <div className="eventCardContent">
              <div
                style={{
                  height: "200px",
                  backgroundColor: "#eee",
                  borderRadius: 10,
                  marginBottom: 8,
                }}
              />
              <div className="keyTermsDatesContainer" />
              <div style={{ height: "1.5rem", marginBottom: "0.5rem" }} aria-hidden="true" />
              <p style={{ height: "3rem" }} aria-hidden="true" />
              <div className="eventFooter" style={{ height: "1.5rem" }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="eventsList">
          {currentEvents.map((event) => (
            <Link key={event._id} to={`/events/${event._id}`} className="eventCard">
              <div className="eventCardContent">
                {event.pictures && event.pictures.length > 0 ? (
                  <img
                    src={getBase64Image(event.pictures[0])}
                    alt={event.title}
                    className="eventImage"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: "200px",
                      backgroundColor: "#eee",
                      borderRadius: 10,
                      marginBottom: 8,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#999",
                    }}
                  >
                    No image available
                  </div>
                )}

                <div className="keyTermsDatesContainer">
                  {event.keyTerms && event.keyTerms.length > 0 ? (
                    <div className="keyTermsContainer">
                      {event.keyTerms.map((term, idx) => (
                        <span key={idx} className="keyTerm">
                          {term}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "red", fontSize: "10px" }}>No key terms</div>
                  )}

                  <div className="datesContainer">
                    <p>
                      <b>Start:</b> {new Date(event.startDate).toLocaleDateString()}
                    </p>
                    <p>
                      <b>End:</b> {new Date(event.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <h2>{event.title}</h2>

                <p>{event.description}</p>

                <div className="eventFooter">
                  <span role="img" aria-label="user">
                    👤
                  </span>{" "}
                  {event.attendeeCount || 1}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="pagination-bar">
        <span className="pagination-info">
          {filteredEvents.length === 0
            ? 0
            : startIndex + 1} to{" "}
          {Math.min(startIndex + EVENTS_PER_PAGE, filteredEvents.length)} of {filteredEvents.length}
        </span>
        <div className="pagination-controls">
          <button onClick={goToPrev} disabled={currentPage === 1} className="page-btn">
            &lt;
          </button>
          <span className="page-text">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNext}
            disabled={currentPage === totalPages || totalPages === 0}
            className="page-btn"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { MdLockOpen, MdLockOutline as MdLockClosed } from "react-icons/md";
import "./EventsPage.css";

export default function EventsPage({ showClosed = false }) {
  const EVENTS_PER_PAGE = 3;

  const [events, setEvents] = useState(null); // null means loading
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  // Debounce search input (400ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch events from backend
  const fetchEvents = useCallback(() => {
    setEvents(null);
    setError(null);

    const params = new URLSearchParams();
    params.append("isClosed", showClosed ? "true" : "false");
    if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
    params.append("page", currentPage);
    params.append("limit", EVENTS_PER_PAGE);

    fetch(`http://localhost:5000/events?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then((data) => {
        setEvents(data.events);
        setTotalCount(data.totalCount);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load events.");
        setEvents([]);
        setTotalCount(0);
      });
  }, [showClosed, debouncedSearchTerm, currentPage]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const totalPages = Math.max(1, Math.ceil(totalCount / EVENTS_PER_PAGE));

  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Skeleton card
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
      <h1>{showClosed ? "Archived Events" : "Open Events"}</h1>
      <p>Total Events: {events === null ? "..." : totalCount}</p>

      <div className="header">
        <input
          type="text"
          placeholder="Search by event title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="searchInput"
          disabled={events === null}
          aria-label="Search events"
        />
      </div>

      {events === null ? (
        <div className="eventsList">
          {[...Array(EVENTS_PER_PAGE)].map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : events.length === 0 ? (
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
            {showClosed ? "No archived events found." : "No open events found."}
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
              <div
                style={{ height: "1.5rem", marginBottom: "0.5rem" }}
                aria-hidden="true"
              />
              <p style={{ height: "3rem" }} aria-hidden="true" />
              <div className="eventFooter" style={{ height: "1.5rem" }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="eventsList">
          {events.map((event) => (
            <Link key={event._id} to={`/events/${event._id}`} className="eventCard">
              <div className="eventCardContent">
                {event.pictures && event.pictures.length > 0 ? (
                  <img
                    src={event.pictures[0]}
                    alt={event.title}
                    className="eventImage"
                    onError={(e) => {
                      e.target.style.display = "none";
                      console.warn("Failed to load image:", e.target.src);
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
                  {event.isClosed ? (
                    <MdLockClosed style={{ color: "red", fontSize: "1.2rem" }} />
                  ) : (
                    <MdLockOpen style={{ color: "green", fontSize: "1.2rem" }} />
                  )}
                  {" "}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="pagination-bar">
        <span className="pagination-info">
          {totalCount === 0
            ? 0
            : (currentPage - 1) * EVENTS_PER_PAGE + 1}{" "}
          to {Math.min(currentPage * EVENTS_PER_PAGE, totalCount)} of {totalCount}
        </span>
        <div className="pagination-controls">
          <button
            onClick={goToPrev}
            disabled={currentPage === 1}
            className="page-btn"
          >
            &lt;
          </button>
          <span className="page-text">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            &gt;
          </button>
        </div>
      </div>

      <Link to="/add" className="addButton" aria-label="Add Event">
        <span className="plus">+</span>
        <span className="text">Add Event</span>
      </Link>
    </div>
  );
}

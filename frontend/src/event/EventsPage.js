import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { MdLockOpen, MdLockOutline as MdLockClosed } from "react-icons/md";
import "./EventsPage.css";

export default function EventsPage({ showClosed = false, institutionId: propInstitutionId }) {
  const EVENTS_PER_PAGE = 3;

  const [institutionId, setInstitutionId] = useState(propInstitutionId || null);
  const [events, setEvents] = useState(null); // null = loading
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  // Fetch logged-in user's institution if no propInstitutionId
  useEffect(() => {
    if (!propInstitutionId && !institutionId) {
      const fetchInstitution = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");

          const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) throw new Error("Failed to get user");

          const data = await res.json();

          if (!data.institution?._id) throw new Error("No institution found for this user");

          setInstitutionId(data.institution._id);
        } catch (err) {
          console.error(err);
          setError("Could not fetch institution.");
        }
      };
      fetchInstitution();
    }
  }, [propInstitutionId, institutionId]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    if (!institutionId) {
      console.log("Waiting for institutionId...");
      return;
    }

    console.log("Fetching events for institution:", institutionId);
    setEvents(null);
    setError(null);

    const params = new URLSearchParams();
    params.append("isClosed", showClosed ? "true" : "false");
    if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
    params.append("page", currentPage);
    params.append("limit", EVENTS_PER_PAGE);
    params.append("institution", institutionId);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/events?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEvents(data.events);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error(err);
      setError("Failed to load events.");
      setEvents([]);
      setTotalCount(0);
    }
  }, [showClosed, debouncedSearchTerm, currentPage, institutionId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const totalPages = Math.max(1, Math.ceil(totalCount / EVENTS_PER_PAGE));
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const getBase64Image = (imgString) => {
    if (!imgString) return null;
    if (imgString.startsWith("http") || imgString.startsWith("data:image")) return imgString;
    return `data:image/png;base64,${imgString}`;
  };

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
        <div className="eventsList" style={{ justifyContent: "center", position: "relative" }}>
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
        </div>
      ) : (
        <div className="eventsList">
          {events.map((event) => (
            <Link key={event._id} to={`/app/events/${event._id}`} className="eventCard">
              <div className="eventCardContent">
                {event.pictures && event.pictures.length > 0 ? (
                  <img
                    src={getBase64Image(event.pictures[0])}
                    alt={event.title}
                    className="eventImage"
                    onError={(e) => (e.target.style.display = "none")}
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
                        <span key={idx} className="keyTerm">{term}</span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "red", fontSize: "10px" }}>No key terms</div>
                  )}

                  <div className="datesContainer">
                    <p><b>Start:</b> {new Date(event.startDate).toLocaleDateString()}</p>
                    <p><b>End:</b> {new Date(event.endDate).toLocaleDateString()}</p>
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
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="pagination-bar">
        <span className="pagination-info">
          {totalCount === 0 ? 0 : (currentPage - 1) * EVENTS_PER_PAGE + 1}{" "}
          to {Math.min(currentPage * EVENTS_PER_PAGE, totalCount)} of {totalCount}
        </span>
        <div className="pagination-controls">
          <button onClick={goToPrev} disabled={currentPage === 1} className="page-btn">&lt;</button>
          <span className="page-text">Page {currentPage} of {totalPages}</span>
          <button onClick={goToNext} disabled={currentPage === totalPages} className="page-btn">&gt;</button>
        </div>
      </div>

      {!showClosed && (
        <Link to="/app/add" className="addButton" aria-label="Add Event">
          <span className="plus">+</span>
          <span className="text">Add Event</span>
        </Link>
      )}
    </div>
  );
}

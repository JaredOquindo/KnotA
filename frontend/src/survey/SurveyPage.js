import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { HiOutlineNewspaper } from "react-icons/hi"; // Icon

export default function SurveyPage({ showClosed = false }) {
  const SURVEYS_PER_PAGE = 6; // 2 rows × 3 cards

  const [surveys, setSurveys] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch surveys
  const fetchSurveys = useCallback(() => {
    setSurveys(null);
    setError(null);

    const params = new URLSearchParams();
    params.append("isClosed", showClosed ? "true" : "false");
    if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
    params.append("page", currentPage);
    params.append("limit", SURVEYS_PER_PAGE);

    fetch(`http://localhost:5000/surveys?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch surveys");
        return res.json();
      })
      .then((data) => {
        setSurveys(data.surveys);
        setTotalCount(data.totalCount);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load surveys.");
        setSurveys([]);
        setTotalCount(0);
      });
  }, [showClosed, debouncedSearchTerm, currentPage]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const totalPages = Math.max(1, Math.ceil(totalCount / SURVEYS_PER_PAGE));
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Loading skeleton
  const SkeletonCard = () => (
    <div
      className="eventCard skeletonCard"
      style={{
        height: "180px",
        display: "flex",
        flexDirection: "column",
      }}
      aria-busy="true"
      aria-label="Loading survey"
    >
      <div className="eventCardContent" style={{ flex: 1 }}>
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
      <h1>{showClosed ? "Archived Surveys" : "Active Surveys"}</h1>
      <p>Total Surveys: {surveys === null ? "..." : totalCount}</p>

      <div className="header">
        <input
          type="text"
          placeholder="Search by survey title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="searchInput"
          disabled={surveys === null}
          aria-label="Search surveys"
        />
      </div>

      {surveys === null ? (
        <div
          className="eventsList"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "15px",
          }}
        >
          {[...Array(SURVEYS_PER_PAGE)].map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : surveys.length === 0 ? (
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
            {showClosed
              ? "No archived surveys found."
              : "No active surveys found."}
          </p>
        </div>
      ) : (
        <div
          className="eventsList"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "15px",
          }}
        >
          {surveys.map((survey) => (
            <Link
              key={survey._id}
              to={`/surveys/${survey._id}`}
              className="eventCard"
              style={{
                height: "180px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="eventCardContent" style={{ flex: 1 }}>
                {/* Yellow Header with Icon on Left */}
                <div
                  style={{
                    backgroundColor: "#F4B826",
                    padding: "8px 12px",
                    borderRadius: "8px 8px 0 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    fontSize: "1.5rem",
                    color: "white",
                  }}
                >
                  <HiOutlineNewspaper />
                </div>

                {/* Title */}
                <h2
                  style={{
                    margin: "10px 0 5px",
                    fontSize: "1rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {survey.title}
                </h2>

                {/* Description */}
                <p
                  style={{
                    color: "#555",
                    fontSize: "0.9rem",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {survey.description}
                </p>

                {/* Footer */}
                <div
                  className="eventFooter"
                  style={{ fontSize: "0.85rem", marginTop: "auto" }}
                >
                  <span role="img" aria-label="responses"></span>{" "}
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
            : (currentPage - 1) * SURVEYS_PER_PAGE + 1}{" "}
          to {Math.min(currentPage * SURVEYS_PER_PAGE, totalCount)} of{" "}
          {totalCount}
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

      <Link to="/survey/add" className="addButton" aria-label="Add Survey">
        <span className="plus">+</span>
        <span className="text">Add Survey</span>
      </Link>
    </div>
  );
}

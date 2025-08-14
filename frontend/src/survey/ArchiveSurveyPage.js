import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
 // you can reuse the same CSS

export default function ArchiveSurveyPage() {
  const [surveys, setSurveys] = useState(null); // null means loading
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const SURVEYS_PER_PAGE = 3;

  useEffect(() => {
    fetch(`http://localhost:5000/surveys?isClosed=true&limit=50`)
      .then((res) => res.json())
      .then(({ surveys }) => setSurveys(surveys))
      .catch((err) => {
        console.error(err);
        setSurveys([]);
      });
  }, []);

  function getBase64Image(imgString) {
    if (!imgString) return null;
    if (imgString.startsWith("data:image")) return imgString;
    return `data:image/png;base64,${imgString}`;
  }

  // Filter surveys by search term
  const filteredSurveys = surveys
    ? surveys.filter((survey) =>
        survey.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredSurveys.length / SURVEYS_PER_PAGE));
  const startIndex = (currentPage - 1) * SURVEYS_PER_PAGE;
  const currentSurveys = filteredSurveys.slice(startIndex, startIndex + SURVEYS_PER_PAGE);

  // Pagination handlers
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const SkeletonCard = () => (
    <div className="eventCard skeletonCard" aria-busy="true" aria-label="Loading survey">
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
      <h1>Archived Surveys</h1>
      <p>Total Archived: {surveys ? surveys.length : "..."}</p>

      <div className="header">
        <input
          type="text"
          placeholder="Search archived surveys by title..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="searchInput"
          disabled={surveys === null}
        />
      </div>

      {surveys === null ? (
        <div className="eventsList">
          {[...Array(SURVEYS_PER_PAGE)].map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : currentSurveys.length === 0 ? (
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
            No archived surveys found.
          </p>
        </div>
      ) : (
        <div className="eventsList">
          {currentSurveys.map((survey) => (
            <Link key={survey._id} to={`/survey/${survey._id}`} className="eventCard">
              <div className="eventCardContent">
                {survey.pictures && survey.pictures.length > 0 ? (
                  <img
                    src={getBase64Image(survey.pictures[0])}
                    alt={survey.title}
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
                  {survey.keyTerms && survey.keyTerms.length > 0 ? (
                    <div className="keyTermsContainer">
                      {survey.keyTerms.map((term, idx) => (
                        <span key={idx} className="keyTerm">
                          {term}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "red", fontSize: "10px" }}>No key terms</div>
                  )}
                </div>

                <h2>{survey.title}</h2>

                <p>{survey.description}</p>

                <div className="eventFooter">
                  <span role="img" aria-label="user">👤</span> {survey.participantCount || 0}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="pagination-bar">
        <span className="pagination-info">
          {filteredSurveys.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + SURVEYS_PER_PAGE, filteredSurveys.length)} of {filteredSurveys.length}
        </span>
        <div className="pagination-controls">
          <button onClick={goToPrev} disabled={currentPage === 1} className="page-btn">
            &lt;
          </button>
          <span className="page-text">
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={goToNext} disabled={currentPage === totalPages || totalPages === 0} className="page-btn">
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

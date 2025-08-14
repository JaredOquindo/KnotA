import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
 // reuse same CSS

export default function ArchiveCampaignPage() {
  const [campaigns, setCampaigns] = useState(null); // null = loading
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 3;

  useEffect(() => {
    fetch(`http://localhost:5000/campaigns?isClosed=true&limit=50`)
      .then((res) => res.json())
      .then(({ campaigns }) => setCampaigns(campaigns))
      .catch((err) => {
        console.error(err);
        setCampaigns([]);
      });
  }, []);

  // Filter campaigns by search term
  const filteredCampaigns = campaigns
    ? campaigns.filter((c) =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Pagination calculations
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE)
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentCampaigns = filteredCampaigns.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Pagination handlers
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const SkeletonCard = () => (
    <div
      className="eventCard skeletonCard"
      aria-busy="true"
      aria-label="Loading campaign"
    >
      <div className="eventCardContent">
        <div className="skeletonImage" />
        <div className="keyTermsDatesContainer">
          <div className="skeletonKeyTerms" />
          <div className="skeletonDates" />
        </div>
        <div className="skeletonTitle" />
        <div className="skeletonDescription" />
      </div>
    </div>
  );

  return (
    <div className="container">
      <h1>Archived Campaigns</h1>
      <p>Total Archived: {campaigns ? campaigns.length : "..."}</p>

      <div className="header">
        <input
          type="text"
          placeholder="Search archived campaigns by title..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="searchInput"
          disabled={campaigns === null}
        />
      </div>

      {campaigns === null ? (
        <div className="eventsList">
          {[...Array(ITEMS_PER_PAGE)].map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : currentCampaigns.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            color: "#666",
            fontWeight: "bold",
            marginTop: 50,
          }}
        >
          No archived campaigns found.
        </p>
      ) : (
        <div className="eventsList">
          {currentCampaigns.map((campaign) => (
            <Link
              key={campaign._id}
              to={`/campaigns/${campaign._id}`}
              className="eventCard"
            >
              <div className="eventCardContent">
                {campaign.pictures && campaign.pictures.length > 0 ? (
                  <img
                    src={campaign.pictures[0]}
                    alt={campaign.title}
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
                  {campaign.keyTerms && campaign.keyTerms.length > 0 ? (
                    <div className="keyTermsContainer">
                      {campaign.keyTerms.map((term, idx) => (
                        <span key={idx} className="keyTerm">
                          {term}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "red", fontSize: "10px" }}>
                      No key terms
                    </div>
                  )}

                  <div className="datesContainer">
                    <p>
                      <b>Start:</b>{" "}
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </p>
                    <p>
                      <b>End:</b>{" "}
                      {new Date(campaign.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <h2>{campaign.title}</h2>
                <p>{campaign.description}</p>
                <p>
                  <b>Target:</b> ${campaign.targetAmount}
                </p>
                <p>
                  <b>Contact:</b> {campaign.contactEmail} |{" "}
                  {campaign.contactPhone}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="pagination-bar">
        <span className="pagination-info">
          {filteredCampaigns.length === 0
            ? 0
            : startIndex + 1}{" "}
          to{" "}
          {Math.min(startIndex + ITEMS_PER_PAGE, filteredCampaigns.length)} of{" "}
          {filteredCampaigns.length}
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

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"; // you can reuse the same CSS

export default function CampaignPage({ showClosed = false }) {
  const ITEMS_PER_PAGE = 3;

  const [campaigns, setCampaigns] = useState(null); // null means loading
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch campaigns from backend
  const fetchCampaigns = useCallback(() => {
    setCampaigns(null);
    setError(null);

    const params = new URLSearchParams();
    params.append("isClosed", showClosed ? "true" : "false");
    if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
    params.append("page", currentPage);
    params.append("limit", ITEMS_PER_PAGE);

    fetch(`http://localhost:5000/campaigns?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch campaigns");
        return res.json();
      })
      .then((data) => {
        setCampaigns(data.campaigns);
        setTotalCount(data.totalCount);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load campaigns.");
        setCampaigns([]);
        setTotalCount(0);
      });
  }, [showClosed, debouncedSearchTerm, currentPage]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Skeleton card while loading
  const SkeletonCard = () => (
    <div className="eventCard skeletonCard" aria-busy="true" aria-label="Loading campaign">
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
      <h1>{showClosed ? "Archived Campaigns" : "Active Campaigns"}</h1>
      <p>Total Campaigns: {campaigns === null ? "..." : totalCount}</p>

      <div className="header">
        <input
          type="text"
          placeholder="Search by campaign title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="searchInput"
          disabled={campaigns === null}
          aria-label="Search campaigns"
        />
      </div>

      {campaigns === null ? (
        <div className="eventsList">
          {[...Array(ITEMS_PER_PAGE)].map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : campaigns.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666", fontWeight: "bold", marginTop: 50 }}>
          {showClosed ? "No archived campaigns found." : "No active campaigns found."}
        </p>
      ) : (
        <div className="eventsList">
          {campaigns.map((campaign) => (
            <Link key={campaign._id} to={`/campaigns/${campaign._id}`} className="eventCard">
              <div className="eventCardContent">
                {campaign.pictures && campaign.pictures.length > 0 ? (
                  <img
                    src={campaign.pictures[0]}
                    alt={campaign.title}
                    className="eventImage"
                    onError={(e) => { e.target.style.display = "none"; }}
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
                        <span key={idx} className="keyTerm">{term}</span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "red", fontSize: "10px" }}>No key terms</div>
                  )}

                  <div className="datesContainer">
                    <p><b>Start:</b> {new Date(campaign.startDate).toLocaleDateString()}</p>
                    <p><b>End:</b> {new Date(campaign.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <h2>{campaign.title}</h2>
                <p>{campaign.description}</p>
                <p><b>Target:</b> ${campaign.targetAmount}</p>
                <p><b>Contact:</b> {campaign.contactEmail} | {campaign.contactPhone}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="pagination-bar">
        <span className="pagination-info">
          {totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
          {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount}
        </span>
        <div className="pagination-controls">
          <button onClick={goToPrev} disabled={currentPage === 1} className="page-btn">&lt;</button>
          <span className="page-text">Page {currentPage} of {totalPages}</span>
          <button onClick={goToNext} disabled={currentPage === totalPages} className="page-btn">&gt;</button>
        </div>
      </div>

      <Link to="/add-campaign" className="addButton" aria-label="Add Campaign">
        <span className="plus">+</span>
        <span className="text">Add Campaign</span>
      </Link>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

export default function CampaignPage({ showClosed = false, institutionId: propInstitutionId }) {
  const CAMPAIGNS_PER_PAGE = 3;

  const [institutionId, setInstitutionId] = useState(propInstitutionId || null);
  const [campaigns, setCampaigns] = useState(null); // null = loading
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const formatToPhilippinePeso = (amount) => {
    if (isNaN(amount)) return "₱0.00";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Fetch logged-in user's institution if no propInstitutionId
  useEffect(() => {
    if (!propInstitutionId && !institutionId) {
      const fetchInstitution = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");

          const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/me`, {
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

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    if (!institutionId) {
      console.log("Waiting for institutionId...");
      return;
    }

    console.log("Fetching campaigns for institution:", institutionId);
    setCampaigns(null);
    setError(null);

    const params = new URLSearchParams();
    params.append("isClosed", showClosed ? "true" : "false");
    if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
    params.append("page", currentPage);
    params.append("limit", CAMPAIGNS_PER_PAGE);
    params.append("institution", institutionId);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/campaigns?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCampaigns(data.campaigns);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error(err);
      setError("Failed to load campaigns.");
      setCampaigns([]);
      setTotalCount(0);
    }
  }, [showClosed, debouncedSearchTerm, currentPage, institutionId]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const totalPages = Math.max(1, Math.ceil(totalCount / CAMPAIGNS_PER_PAGE));
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const getBase64Image = (imgString) => {
    if (!imgString) return null;
    if (imgString.startsWith("http") || imgString.startsWith("data:image")) return imgString;
    return `data:image/png;base64,${imgString}`;
  };

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
        <div className="eventFooter">
          <div className="skeletonAttendee" />
        </div>
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
          {[...Array(CAMPAIGNS_PER_PAGE)].map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : campaigns.length === 0 ? (
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
            {showClosed ? "No archived campaigns found." : "No active campaigns found."}
          </p>
        </div>
      ) : (
        <div className="eventsList">
          {campaigns.map((campaign) => {
            const totalDonated = campaign.donations.reduce((sum, d) => sum + d.amount, 0);
            const progress = Math.min((totalDonated / campaign.targetAmount) * 100, 100);

            return (
              <Link key={campaign._id} to={`/app/campaigns/${campaign._id}`} className="eventCard">
                <div className="eventCardContent">
                  {campaign.pictures && campaign.pictures.length > 0 ? (
                    <img
                      src={getBase64Image(campaign.pictures[0])}
                      alt={campaign.title}
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

                  {/* Progress bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "1rem" }}>
                    <div style={{ flexGrow: 1, height: "8px", backgroundColor: "#e0e0e0", borderRadius: "4px" }}>
                      <div
                        style={{
                          height: "100%",
                          backgroundColor: "#f4b400",
                          borderRadius: "4px",
                          transition: "width 0.4s ease-in-out",
                          width: `${progress}%`,
                        }}
                      ></div>
                    </div>
                    <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#f4b400" }}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#555", marginTop: "4px" }}>
                    <span style={{ fontWeight: "bold", color: "#f4b400" }}>
                      {formatToPhilippinePeso(totalDonated)}
                    </span>{" "}
                    raised of{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {formatToPhilippinePeso(campaign.targetAmount)}
                    </span>
                  </p>

                  <p><b>Contact:</b> {campaign.contactEmail} | {campaign.contactPhone}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="pagination-bar">
        <span className="pagination-info">
          {totalCount === 0 ? 0 : (currentPage - 1) * CAMPAIGNS_PER_PAGE + 1}{" "}
          to {Math.min(currentPage * CAMPAIGNS_PER_PAGE, totalCount)} of {totalCount}
        </span>
        <div className="pagination-controls">
          <button onClick={goToPrev} disabled={currentPage === 1} className="page-btn">&lt;</button>
          <span className="page-text">Page {currentPage} of {totalPages}</span>
          <button onClick={goToNext} disabled={currentPage === totalPages} className="page-btn">&gt;</button>
        </div>
      </div>

      {!showClosed && (
        <Link to="/app/add-campaign" className="addButton" aria-label="Add Campaign">
          <span className="plus">+</span>
          <span className="text">Add Campaign</span>
        </Link>
      )}
    </div>
  );
}

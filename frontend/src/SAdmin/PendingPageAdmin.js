import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./PendingPageAdmin.css";

export default function PendingPageAdmin() {
  const PENDING_PER_PAGE = 5;

  const [pendings, setPendings] = useState(null);
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

  // Fetch pending institutions
  const fetchPendings = useCallback(() => {
    setPendings(null);
    setError(null);

    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
    params.append("page", currentPage);
    params.append("limit", PENDING_PER_PAGE);

    fetch(`http://localhost:5000/institutions/pending?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch pending items");
        return res.json();
      })
      .then((data) => {
        setPendings(data.pendings);
        setTotalCount(data.totalCount);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load pending items.");
        setPendings([]);
        setTotalCount(0);
      });
  }, [debouncedSearchTerm, currentPage]);

  useEffect(() => {
    fetchPendings();
  }, [fetchPendings]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PENDING_PER_PAGE));
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const approveInstitution = async (id) => {
    if (!window.confirm("Approve this institution? An email will be sent.")) return;
    try {
      const res = await fetch(`http://localhost:5000/institutions/${id}/approve`, { method: "PATCH" });
      const data = await res.json();
      alert(data.message);
      fetchPendings();
    } catch (err) {
      console.error(err);
      alert("Failed to approve institution");
    }
  };

  const deleteInstitution = async (id) => {
    if (!window.confirm("Are you sure you want to delete this institution?")) return;
    try {
      await fetch(`http://localhost:5000/institutions/${id}`, { method: "DELETE" });
      fetchPendings();
    } catch (err) {
      console.error(err);
      alert("Failed to delete institution");
    }
  };

  const SkeletonItem = () => (
    <div className="list-item skeleton-item" aria-busy="true">
      <div className="skeleton-logo"></div>
      <div className="skeleton-content">
        <div className="skeleton-text skeleton-title"></div>
        <div className="skeleton-text skeleton-address"></div>
      </div>
      <div className="skeleton-text skeleton-date"></div>
    </div>
  );

  return (
    <div className="container1">
      <h1>Pending Requests</h1>
      <p>Total Pending: {pendings === null ? "..." : totalCount}</p>

      <div className="header">
        <input
          type="text"
          placeholder="Search pending requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="searchInput"
          disabled={pendings === null}
        />
      </div>

      <div className="recordsListWrapper">
        <div className="list-header">
          <span className="list-header-name">Name</span>
          <span className="list-header-update">Last Update</span>
          <span className="list-header-actions">Actions</span>
        </div>

        {pendings === null ? (
          [...Array(PENDING_PER_PAGE)].map((_, idx) => <SkeletonItem key={idx} />)
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : pendings.length === 0 ? (
          <div className="empty-message">No pending requests found.</div>
        ) : (
          <div className="list-container">
            {pendings.map((pending) => (
              <div key={pending._id} className="list-item">
                <div className="list-item-content">
                  <div className="list-item-logo">
                    <img src={pending.logoUrl || "/default-logo.png"} alt={`${pending.officialInstitutionName} logo`} />
                  </div>
                  <div className="list-item-text">
                    <div className="list-item-title">
                      <Link to={`/app/pending/${pending._id}`} className="recordLink">
                        {pending.officialInstitutionName}
                      </Link>
                    </div>
                    <div className="list-item-address">
                      {pending.address || "Address not available"}
                    </div>
                  </div>
                </div>
                <div className="list-item-date">
                  {new Date(pending.createdAt).toLocaleDateString()}
                </div>
                <div className="list-item-actions">
                  <button className="approve-btn" onClick={() => approveInstitution(pending._id)}>Approve</button>
                  <button className="delete-btn" onClick={() => deleteInstitution(pending._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pagination-bar">
        <span className="pagination-info">
          {totalCount === 0 ? 0 : (currentPage - 1) * PENDING_PER_PAGE + 1} to{" "}
          {Math.min(currentPage * PENDING_PER_PAGE, totalCount)} of {totalCount}
        </span>
        <div className="pagination-controls">
          <button onClick={goToPrev} disabled={currentPage === 1} className="page-btn">&lt;</button>
          <span className="page-text">Page {currentPage} of {totalPages}</span>
          <button onClick={goToNext} disabled={currentPage === totalPages} className="page-btn">&gt;</button>
        </div>
      </div>
    </div>
  );
}

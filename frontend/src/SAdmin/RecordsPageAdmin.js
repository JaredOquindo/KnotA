import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./RecordsPageAdmin.css";

export default function RecordsPageAdmin() {
  const RECORDS_PER_PAGE = 5;

  const [records, setRecords] = useState(null);
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

  // Fetch approved institutions
  const fetchRecords = useCallback(() => {
    setRecords(null);
    setError(null);

    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
    params.append("page", currentPage);
    params.append("limit", RECORDS_PER_PAGE);

    fetch(`${process.env.REACT_APP_API_URL}/institutions/approved?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch records");
        return res.json();
      })
      .then((data) => {
        setRecords(data.institutions);
        setTotalCount(data.totalCount);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load records.");
        setRecords([]);
        setTotalCount(0);
      });
  }, [debouncedSearchTerm, currentPage]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const totalPages = Math.max(1, Math.ceil(totalCount / RECORDS_PER_PAGE));
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const approveRecord = async (id) => {
    if (!window.confirm("Approve this institution? An email will be sent.")) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/institutions/${id}/approve`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to approve institution");
      const data = await res.json();
      alert(data.message);
      fetchRecords();
    } catch (err) {
      console.error(err);
      alert("Failed to approve institution");
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
      <h1>Records</h1>
      <p>Total Records: {records === null ? "..." : totalCount}</p>

      <div className="header">
        <input
          type="text"
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="searchInput"
          disabled={records === null}
        />
      </div>

      <div className="recordsListWrapper">
        <div className="list-header">
          <span className="list-header-name">Name</span>
          <span className="list-header-type">Type</span>
          <span className="list-header-date">Date Added</span>
          <span className="list-header-status">Status</span>
          <span className="list-header-actions">Actions</span>
        </div>

        {records === null ? (
          [...Array(RECORDS_PER_PAGE)].map((_, idx) => <SkeletonItem key={idx} />)
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : records.length === 0 ? (
          <div className="empty-message">No records found.</div>
        ) : (
          <div className="list-container">
            {records.map((record) => (
              <div key={record._id} className="list-item">
                <div className="list-item-content">
                  <div className="list-item-logo">
                    <img src={record.logoUrl || "/default-logo.png"} alt={`${record.officialInstitutionName} logo`} />
                  </div>
                  <div className="list-item-text">
                    <div className="list-item-title">
                      <Link to={`/app/records/${record._id}`} className="recordLink">
                        {record.officialInstitutionName}
                      </Link>
                    </div>
                    <div className="list-item-type">{record.institutionType}</div>
                  </div>
                </div>
                <div className="list-item-date">
                  {new Date(record.createdAt).toLocaleDateString()}
                </div>
                <div className="list-item-status">
                  {record.isApproved ? "approved" : "pending"}
                </div>
                <div className="list-item-actions">
                  {!record.isApproved && (
                    <button className="approve-btn" onClick={() => approveRecord(record._id)}>Approve</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pagination-bar">
        <span className="pagination-info">
          {totalCount === 0 ? 0 : (currentPage - 1) * RECORDS_PER_PAGE + 1} to{" "}
          {Math.min(currentPage * RECORDS_PER_PAGE, totalCount)} of {totalCount}
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

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./SurveyDetailPage.css";

// Import the new SurveySummary component
import SurveySummary from "./SurveySummary";

export default function SurveyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [editSurvey, setEditSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null); // for individual submission modal
  const [showSummary, setShowSummary] = useState(false); // for the summary graph modal

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/surveys/${id}`);
        if (!res.ok) throw new Error("Failed to load survey");
        const data = await res.json();
        setSurvey(data);
        setEditSurvey(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/surveys/${id}/responses`);
        if (!res.ok) throw new Error("Failed to load submissions");
        const data = await res.json();
        setSubmissions(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSurvey();
    fetchSubmissions();
  }, [id]);

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const handleSubmitAnswers = async (e) => {
    e.preventDefault();

    if (Object.keys(answers).length === 0) {
      alert("Please answer at least one question before submitting.");
      return;
    }

    try {
      const payload = {
        surveyId: survey._id,
        answers: Object.entries(answers).map(([qIndex, value]) => {
          const questionId = survey.questions[qIndex]._id;
          return {
            questionId: questionId,
            answer: value,
          };
        }),
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/surveys/${id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Submission failed:", errorData);
        throw new Error("Failed to submit survey");
      }

      alert("Survey submitted successfully!");
      navigate("/app/survey");
    } catch (err) {
      console.error("An error occurred during submission:", err);
      alert("An error occurred. Please try again.");
    }
  };

  const handleEdit = () => setEditMode(true);
  const handleCancelEdit = () => {
    setEditSurvey(survey);
    setEditMode(false);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/surveys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editSurvey),
      });
      if (!res.ok) throw new Error("Failed to update survey");
      const updated = await res.json();
      setSurvey(updated);
      setEditMode(false);
      alert("Survey updated successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this survey?")) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/surveys/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete survey");
        alert("Survey deleted successfully");
        navigate("/app/survey");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClose = async () => {
    if (window.confirm("Are you sure you want to close this survey?")) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/surveys/${id}/close`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to close survey");
        alert("Survey closed and moved to archive successfully");
        navigate("/app/survey/archive");
      } catch (err) {
        console.error(err);
      }
    }
  };

  // DELETE a submission
  const handleDeleteSubmission = async (submissionId) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/surveys/${id}/responses/${submissionId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete submission");
        alert("Submission deleted successfully!");
        setSubmissions((prev) => prev.filter((s) => s._id !== submissionId));
        closeSubmissionModal();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const renderQuestionField = (q, i) => {
    if (editMode) {
      return (
        <div className="edit-question">
          <input
            type="text"
            value={editSurvey.questions[i].text}
            onChange={(e) => {
              const newQ = [...editSurvey.questions];
              newQ[i].text = e.target.value;
              setEditSurvey({ ...editSurvey, questions: newQ });
            }}
          />
          <p className="question-type">({q.type})</p>
          {(q.type === "multiple-choice" || q.type === "checkbox" || q.type === "dropdown") && (
            <div className="options-edit">
              {editSurvey.questions[i].options.map((opt, idx) => (
                <div key={idx} className="option-edit">
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => {
                      const newQ = [...editSurvey.questions];
                      newQ[i].options[idx].text = e.target.value;
                      setEditSurvey({ ...editSurvey, questions: newQ });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newQ = [...editSurvey.questions];
                      newQ[i].options.splice(idx, 1);
                      setEditSurvey({ ...editSurvey, questions: newQ });
                    }}
                  >
                    Delete Option
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newQ = [...editSurvey.questions];
                  newQ[i].options.push({ text: "" });
                  setEditSurvey({ ...editSurvey, questions: newQ });
                }}
              >
                Add Option
              </button>
            </div>
          )}
        </div>
      );
    }

    switch (q.type) {
      case "multiple-choice":
        return q.options.map((opt, idx) => (
          <label key={idx} className="option-item">
            <input
              type="radio"
              name={`q-${i}`}
              value={opt.text}
              onChange={(e) => handleAnswerChange(i, e.target.value)}
              required={q.required}
            />
            {opt.text}
          </label>
        ));
      case "checkbox":
        return q.options.map((opt, idx) => (
          <label key={idx} className="option-item">
            <input
              type="checkbox"
              name={`q-${i}`}
              value={opt.text}
              onChange={(e) => {
                const prev = answers[i] || [];
                const newValue = e.target.checked
                  ? [...prev, opt.text]
                  : prev.filter((v) => v !== opt.text);
                handleAnswerChange(i, newValue);
              }}
            />
            {opt.text}
          </label>
        ));
      case "dropdown":
        return (
          <select
            name={`q-${i}`}
            onChange={(e) => handleAnswerChange(i, e.target.value)}
            required={q.required}
          >
            <option value="">-- Select --</option>
            {q.options.map((opt, idx) => (
              <option key={idx} value={opt.text}>
                {opt.text}
              </option>
            ))}
          </select>
        );
      case "yes-no":
        return (
          <>
            <label>
              <input
                type="radio"
                name={`q-${i}`}
                value="Yes"
                onChange={(e) => handleAnswerChange(i, e.target.value)}
                required={q.required}
              />{" "}
              Yes
            </label>
            <label>
              <input
                type="radio"
                name={`q-${i}`}
                value="No"
                onChange={(e) => handleAnswerChange(i, e.target.value)}
              />{" "}
              No
            </label>
          </>
        );
      case "rating":
        return (
          <div className="rating-container">
            {[1, 2, 3, 4, 5].map((num) => (
              <label key={num}>
                <input
                  type="radio"
                  name={`q-${i}`}
                  value={num}
                  onChange={(e) => handleAnswerChange(i, e.target.value)}
                  required={q.required}
                />{" "}
                {num}
              </label>
            ))}
          </div>
        );
      case "open-ended":
        return (
          <textarea
            name={`q-${i}`}
            onChange={(e) => handleAnswerChange(i, e.target.value)}
            required={q.required}
          ></textarea>
        );
      default:
        return <p>Unsupported question type</p>;
    }
  };

  const openSubmissionModal = (submission) => setSelectedSubmission(submission);
  const closeSubmissionModal = () => setSelectedSubmission(null);
  const openSummaryPopup = () => setShowSummary(true);
  const closeSummaryPopup = () => setShowSummary(false);

  if (loading) return <p>Loading survey...</p>;
  if (!survey) return <p>Survey not found.</p>;

  return (
    <div className="survey-detail-page">
      <Link to="/app/survey" className="back-link">
        ⬅ Back to Surveys
      </Link>

      <div className="survey-two-columns">
        <div className="survey-form-wrapper">
          <div className="survey-header-box">
            {editMode ? (
              <>
                <input
                  type="text"
                  value={editSurvey.title}
                  onChange={(e) => setEditSurvey({ ...editSurvey, title: e.target.value })}
                />
                <textarea
                  value={editSurvey.description}
                  onChange={(e) => setEditSurvey({ ...editSurvey, description: e.target.value })}
                ></textarea>
              </>
            ) : (
              <>
                <h1>{survey.title}</h1>
                <p>{survey.description}</p>
              </>
            )}
          </div>

          {!editMode ? (
            <form onSubmit={handleSubmitAnswers} className="survey-form">
              {survey.questions.map((q, i) => (
                <div key={i} className="survey-question">
                  <h3>
                    {q.text} {q.required && <span className="required">*</span>}
                  </h3>
                  {renderQuestionField(q, i)}
                </div>
              ))}
              <button type="submit" className="submit-btn">
                Submit Answers
              </button>
            </form>
          ) : (
            <div className="survey-form">
              {editSurvey.questions.map((q, i) => (
                <div key={i} className="survey-question">
                  {renderQuestionField(q, i)}
                </div>
              ))}
              <div className="edit-actions">
                <button onClick={handleSaveEdit} className="save-btn">
                  Save
                </button>
                <button onClick={handleCancelEdit} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="survey-stats-wrapper">
          <h2>Survey Responses</h2>
          <p>
            <strong>Total Submissions:</strong> {submissions.length}
          </p>
          <ul className="submission-list">
            {submissions.map((s, index) => (
              <li
                key={index}
                className="submission-item"
                onClick={() => openSubmissionModal(s)}
                style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
              >
                {s.userName || "Anonymous"}
              </li>
            ))}
          </ul>

          <div className="survey-actions">
            <button className="edit-btn" onClick={handleEdit}>
              Edit
            </button>
            <button className="delete-btn" onClick={handleDelete}>
              Delete
            </button>
            <button className="close-btn" onClick={handleClose}>
              Close Survey
            </button>
            <button className="summary-btn" onClick={openSummaryPopup}>
              Generate Summary
            </button>
          </div>
        </div>
      </div>

      {selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="submission-form">
              <div className="submission-header">
                <h3>{survey.title}</h3>
                <p>{survey.description}</p>
                <p className="submission-user">
                  <strong>Submitted by:</strong> {selectedSubmission.userName || "Anonymous"}
                </p>
              </div>
              <hr />
              <div className="submission-answers">
                {selectedSubmission.answers.map((a, i) => (
                  <div key={i} className="submission-answer-item">
                    <p className="submission-question">
                      <strong>{a.question}</strong>
                    </p>
                    <div className="submission-answer">
                      {Array.isArray(a.answer) ? a.answer.join(", ") : a.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => handleDeleteSubmission(selectedSubmission._id)}
                className="delete-btn"
              >
                Delete Submission
              </button>
              <button onClick={closeSubmissionModal} className="close-modal-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showSummary && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="summary-header">
              <h3>Survey Summary for "{survey.title}"</h3>
            </div>
            <hr />
            <div className="summary-content">
              {/* This is where the summary component is rendered */}
              <SurveySummary questions={survey.questions} submissions={submissions} />
            </div>
            <div className="modal-actions">
              <button onClick={closeSummaryPopup} className="close-modal-btn">
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
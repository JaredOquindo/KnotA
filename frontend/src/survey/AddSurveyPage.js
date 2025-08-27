import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AddSurveyPage.css";
import { FiDelete } from "react-icons/fi";
import { IoPersonSharp } from "react-icons/io5";

export default function SurveyCreatorPage() {
  const navigate = useNavigate();

  const [institutionId, setInstitutionId] = useState(null);
  const [creatorId, setCreatorId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAudience: "",
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    type: "multiple-choice",
    required: false,
    options: [],
  });
  const [currentOption, setCurrentOption] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user's institution ID and creator ID on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to get user data");

        const data = await res.json();
        if (!data.institution?._id)
          throw new Error("No institution found for this user");
        if (!data._id) throw new Error("Could not find user ID");

        setInstitutionId(data.institution._id);
        setCreatorId(data._id);
      } catch (err) {
        console.error(err);
        setError("Could not fetch user information. Please log in again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentQuestion((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddOption = () => {
    if (currentOption.trim() !== "") {
      setCurrentQuestion((prev) => ({
        ...prev,
        options: [...prev.options, { text: currentOption }],
      }));
      setCurrentOption("");
    }
  };

  const handleRemoveOption = (index) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleAddQuestion = () => {
    if (currentQuestion.text.trim() !== "") {
      setQuestions((prev) => [...prev, currentQuestion]);
      setCurrentQuestion({
        text: "",
        type: "multiple-choice",
        required: false,
        options: [],
      });
    }
  };

  const handleRemovePreviewQuestion = (indexToRemove) => {
    setQuestions((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!institutionId || !creatorId) {
      setError("Cannot create survey. Missing institution or creator ID.");
      return;
    }

    const payload = {
      ...formData,
      questions,
      institution: institutionId,
      creatorId: creatorId, // FIXED: Changed from 'creator' to 'creatorId'
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated.");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/surveys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newSurvey = await res.json();
        console.log("Survey created:", newSurvey);
        navigate("/app/survey");
      } else {
        const errorData = await res.json();
        console.error("Failed to create survey:", errorData);
        setError(errorData.message || "Failed to create survey.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  const renderQuestionPreviewContent = (question) => {
    switch (question.type) {
      case "multiple-choice":
      case "checkbox":
      case "dropdown":
        return (
          <div className="preview-options-container">
            {question.options.length > 0 ? (
              question.options.map((opt, j) => (
                <div key={j} className="preview-option-item">
                  <input
                    type={question.type === "multiple-choice" ? "radio" : "checkbox"}
                    name={`preview-question-${question.text}`}
                    disabled
                  />
                  <label>{opt.text}</label>
                </div>
              ))
            ) : (
              <p className="no-options-placeholder">No options added yet.</p>
            )}
            {question.type === "dropdown" && question.options.length > 0 && (
              <select className="preview-select" disabled>
                {question.options.map((opt, j) => (
                  <option key={j} value={opt.text}>{opt.text}</option>
                ))}
              </select>
            )}
          </div>
        );
      case "yes-no":
        return (
          <div className="preview-options-container">
            <div className="preview-option-item">
              <input type="radio" name={`preview-question-${question.text}-yesno`} disabled />
              <label>Yes</label>
            </div>
            <div className="preview-option-item">
              <input type="radio" name={`preview-question-${question.text}-yesno`} disabled />
              <label>No</label>
            </div>
          </div>
        );
      case "rating":
        return (
          <div className="preview-rating-container">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="preview-rating-item">
                <input type="radio" name={`preview-question-${question.text}-rating`} disabled />
                <label>{num}</label>
              </div>
            ))}
          </div>
        );
      case "open-ended":
        return (
          <textarea
            className="preview-open-ended"
            placeholder="User's answer will go here..."
            disabled
          ></textarea>
        );
      default:
        return (
          <div className="preview-generic-placeholder">
            <p>Type: {question.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
            <div className="preview-input-placeholder"></div>
          </div>
        );
    }
  };

  if (loading) return <p>Loading user data...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="survey-creator-page">
      <Link to="/app/survey">⬅ Back to Surveys</Link>
      <h1>Create Survey</h1>
      <form onSubmit={handleSubmit}>
        <div className="left-column">
          <div className="survey-details">
            <input
              name="title"
              placeholder="Survey Title"
              value={formData.title}
              onChange={handleChange}
              required
              className="fixed-height-input"
            />
            <textarea
              name="description"
              placeholder="Description / Instructions"
              value={formData.description}
              onChange={handleChange}
              required
            />
            <input
              name="targetAudience"
              placeholder="Target Audience (optional)"
              value={formData.targetAudience}
              onChange={handleChange}
            />
          </div>

          <div className="preview-questions-box">
            <h2>Preview Questions</h2>
            <div className="preview-question-list">
              {questions.map((q, i) => (
                <div key={i} className="preview-question-card">
                  <h3>
                    {q.text} {q.required && <span className="required-star">*</span>}
                  </h3>
                  {renderQuestionPreviewContent(q)}
                  <button
                    type="button"
                    className="remove-preview-question-btn"
                    onClick={() => handleRemovePreviewQuestion(i)}
                  >
                    <FiDelete />
                  </button>
                </div>
              ))}
              {questions.length === 0 && (
                <p className="no-questions-message">Add questions to see a preview here!</p>
              )}
            </div>
          </div>
        </div>

        <div className="right-column">
          <button type="submit" className="submit-survey-btn" disabled={!institutionId || !creatorId}>
            Submit Survey
          </button>
          <div className="survey-creator-container">
            <h2>Add Questions</h2>
            <textarea
              name="text"
              placeholder="Question text"
              value={currentQuestion.text}
              onChange={handleQuestionChange}
              required
              className="survey-question"
            />
            <div className="dropdown-required-row">
              <select
                name="type"
                value={currentQuestion.type}
                onChange={handleQuestionChange}
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="yes-no">Yes/No</option>
                <option value="rating">Rating</option>
                <option value="open-ended">Open Ended</option>
                <option value="dropdown">Dropdown</option>
                <option value="checkbox">Checkbox</option>
                <option value="matrix">Matrix</option>
                <option value="ranking">Ranking</option>
                <option value="semantic-differential">Semantic Differential</option>
                <option value="demographic">Demographic</option>
              </select>
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  name="required"
                  checked={currentQuestion.required}
                  onChange={handleQuestionChange}
                />
                Required
              </label>
            </div>

            {(currentQuestion.type === "multiple-choice" ||
              currentQuestion.type === "dropdown" ||
              currentQuestion.type === "checkbox") && (
              <div className="options-section">
                <textarea
                  placeholder="Option text"
                  value={currentOption}
                  onChange={(e) => setCurrentOption(e.target.value)}
                  className="option-text-textarea"
                />
                <button
                  type="button"
                  className="add-option-btn"
                  onClick={handleAddOption}
                >
                  Add Option
                </button>
                <ul>
                  {currentQuestion.options.map((opt, i) => (
                    <li key={i}>
                      {opt.text}{" "}
                      <button
                        type="button"
                        className="remove-option-btn"
                        onClick={() => handleRemoveOption(i)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              type="button"
              className="add-question-btn"
              onClick={handleAddQuestion}
            >
              Add Question
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
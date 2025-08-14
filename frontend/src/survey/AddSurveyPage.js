import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AddSurveyPage.css"; // CSS import is restored to a separate file
import { FiDelete } from "react-icons/fi";


export default function SurveyCreatorPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAudience: "",
    creatorId: "64f9e1a2b7f9c1234567890a",
  });

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    type: "multiple-choice",
    required: false,
    options: [],
  });

  const [currentOption, setCurrentOption] = useState("");

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

  // Function to remove a question from the preview
  const handleRemovePreviewQuestion = (indexToRemove) => {
    setQuestions((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, questions };
    try {
      const res = await fetch("http://localhost:5000/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newSurvey = await res.json();
        console.log("Survey created:", newSurvey);
        navigate("/survey");
      } else {
        console.error("Failed to create survey");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to render question specific content in preview
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
                    disabled // Disable for preview
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
            {/* Keeping a simple placeholder for other types */}
            <div className="preview-input-placeholder"></div>
          </div>
        );
    }
  };

  return (
    <div className="survey-creator-page">
      <Link to="/survey">⬅ Back to Surveys</Link>
      <h1>Create Survey</h1>
      <form onSubmit={handleSubmit}>
        {/* Left column */}
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
            <div className="preview-question-list"> {/* Container for question cards, handles spacing */}
              {questions.map((q, i) => (
                <div key={i} className="preview-question-card">
                  <h3>{q.text} {q.required && <span className="required-star">*</span>}</h3>
                  {renderQuestionPreviewContent(q)} {/* Dynamic content */}
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

        {/* Right column */}
        <div className="right-column">
          <button type="submit" className="submit-survey-btn">
            Submit Survey
          </button>

          <div className="survey-creator-container">
            <h2>Add Questions</h2>

            {/* Question text input changed to textarea */}
            <textarea
              name="text"
              placeholder="Question text"
              value={currentQuestion.text}
              onChange={handleQuestionChange}
              required
              className="survey-question" /* Added class for styling */
            />

            {/* Dropdown + required checkbox in same row */}
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
                <option value="semantic-differential">
                  Semantic Differential
                </option>
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

            {/* Options section */}
            {(currentQuestion.type === "multiple-choice" ||
              currentQuestion.type === "dropdown" ||
              currentQuestion.type === "checkbox") && (
              <div className="options-section">
                {/* Changed input to textarea for option text */}
                <textarea
                  placeholder="Option text"
                  value={currentOption}
                  onChange={(e) => setCurrentOption(e.target.value)}
                  className="option-text-textarea" /* Added class for styling */
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

import React, { useState } from 'react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SurveySummary = ({ questions, submissions }) => {
  // State to track the selected chart type for each question, initialized to 'bar'
  const [chartTypes, setChartTypes] = useState(
    questions.reduce((acc, q) => ({ ...acc, [q.text]: 'bar' }), {})
  );

  // A helper function to process the raw submission data into a format suitable for charts.
  const processDataForQuestion = (question, submissions) => {
    const counts = {};
    submissions.forEach(submission => {
      const answerObj = submission.answers.find(ans => ans.question === question.text);
      if (answerObj) {
        if (Array.isArray(answerObj.answer)) {
          answerObj.answer.forEach(option => {
            counts[option] = (counts[option] || 0) + 1;
          });
        } else {
          counts[answerObj.answer] = (counts[answerObj.answer] || 0) + 1;
        }
      }
    });
    return counts;
  };

  // A function to handle chart type changes from the dropdown
  const handleChartTypeChange = (questionText, type) => {
    setChartTypes(prevTypes => ({
      ...prevTypes,
      [questionText]: type,
    }));
  };

  // A helper function to render the correct chart type.
  const renderChart = (question, data, selectedType) => {
    const chartLabels = Object.keys(data);
    const chartData = Object.values(data);

    const chartConfig = {
      labels: chartLabels,
      datasets: [
        {
          label: `Responses for "${question.text}"`,
          data: chartData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(201, 203, 207, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(201, 203, 207, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: question.text,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };
    
    // Render the chart component based on the selectedType
    switch (selectedType) {
      case 'bar':
        return <Bar data={chartConfig} options={chartOptions} />;
      case 'pie':
        return <Pie data={chartConfig} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={chartConfig} options={chartOptions} />;
      default:
        return null;
    }
  };

  return (
    <div className="survey-summary">
      {submissions.length === 0 ? (
        <p>No submissions to summarize yet.</p>
      ) : (
        questions.map((question, index) => {
          if (question.type === 'open-ended') {
            return (
              <div key={index} className="summary-item">
                <h4>{question.text}</h4>
                <ul>
                  {submissions.map((s, sIndex) => {
                    const answerObj = s.answers.find(ans => ans.question === question.text);
                    return answerObj && <li key={sIndex}>{answerObj.answer}</li>;
                  })}
                </ul>
              </div>
            );
          } else {
            const questionData = processDataForQuestion(question, submissions);
            const selectedChartType = chartTypes[question.text] || 'bar';

            return (
              <div key={index} className="summary-item">
                <div className="chart-controls">
                  <label htmlFor={`chart-type-${index}`}>Choose Chart Type: </label>
                  <select
                    id={`chart-type-${index}`}
                    value={selectedChartType}
                    onChange={(e) => handleChartTypeChange(question.text, e.target.value)}
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="doughnut">Doughnut Chart</option>
                  </select>
                </div>
                {Object.keys(questionData).length > 0 ? (
                  renderChart(question, questionData, selectedChartType)
                ) : (
                  <p>No data available for this question.</p>
                )}
              </div>
            );
          }
        })
      )}
    </div>
  );
};

export default SurveySummary;
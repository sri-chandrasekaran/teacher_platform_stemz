import React, { useState, useEffect } from "react";
import "../styles/popup.css";
import { getUserCourseProgress } from "../services/progressService";
import { getStudentResponses } from "../services/progressService";

const Popup = ({ isOpen, onClose, student, course }) => {
  const [toggle, setToggle] = useState("Lesson");
  const [selectedLesson, setSelectedLesson] = useState(1);
  const [progress, setProgress] = useState(0);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseLoading, setResponseLoading] = useState(false);
  const [studentResponses, setStudentResponses] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      if (course && student) {
        setLoading(true);
        try {
          const data = await getUserCourseProgress(course, student);
          console.log("Progress data:", data);
          
          if (data && data.completion_percentage !== undefined) {
            setProgress(data.completion_percentage);
            setProgressData(data);
            console.log("Progress", data.completion_percentage);
            console.log("Completed assignments", data.completed_assignments_list);
            console.log("Total assignments", data.available_assignments);
          } else {
            console.warn("No completion_percentage found in response:", data);
            setProgress(0);
            setProgressData(null);
          }
        } catch (error) {
          console.error("Error fetching progress:", error);
          setProgress(0);
          setProgressData(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProgress();
  }, [student, course]);


  useEffect(() => {
    const fetchStudentResponses = async () => {
      if (course && student && selectedLesson) {
        setResponseLoading(true);
        try {
          // Fetch student responses for the specific lesson
          const responses = await getStudentResponses(student, course, selectedLesson);
          setStudentResponses(responses);
        } catch (error) {
          console.error("Error fetching student responses:", error);
          setStudentResponses(null);
        } finally {
          setResponseLoading(false);
        }
      }
    };

    fetchStudentResponses();
  }, [student, course, selectedLesson, toggle]);


  if (!isOpen) return null;

  const handleToggleChange = (value) => {
    setToggle(value);
  };

  const handleLessonClick = (lessonNumber) => {
    setSelectedLesson(lessonNumber);
    setToggle("Lesson"); // Reset to lesson tab when switching lessons
  };

  const isAssignmentCompletedFromResponses = (lessonNum, assignmentType) => {
    if (!studentResponses || !studentResponses.success || !studentResponses.responses) return false;
    
    const lessonData = studentResponses.responses.find(r => r.lessonId === `lesson${lessonNum}`);
    if (!lessonData) return false;

    switch (assignmentType.toLowerCase()) {
      case 'lesson':
        return lessonData.bpqResponses && lessonData.bpqResponses.length > 0;
      case 'worksheet':
        return lessonData.worksheet && lessonData.worksheet.submittedAt;
      case 'quiz':
        return lessonData.quiz && lessonData.quiz.length > 0;
      default:
        return false;
    }
  };


  // Helper function to get assignments for current tab
  const getAssignmentsForTab = () => {
    if (!progressData) return [];

    const { completed_assignments_list = [], available_assignments = {}, breakdown = {} } = progressData;

    const completedMapFromProgress = new Map();
    completed_assignments_list.forEach(assignment => {
      const key = `${assignment.assignment_type}_${assignment.assignment_number}`;
      completedMapFromProgress.set(key, assignment);
    });

    // Get assignments based on current tab
    let assignments = [];
    const tabKey = toggle.toLowerCase();
    const lessonNumber = selectedLesson.toString();

    let hasAssignment = false;
    if (tabKey === 'lesson') {
      hasAssignment = available_assignments.lessons?.includes(lessonNumber) || false;
    } else if (tabKey === 'worksheet') {
      hasAssignment = available_assignments.worksheets?.includes(lessonNumber) || false;
    } else if (tabKey === 'quiz') {
      // hasAssignment = available_assignments.quiz === false;
      hasAssignment = available_assignments.quizzes?.includes(lessonNumber) || false;
    }

    if (!hasAssignment) {
      return []; // No assignment of this type for this lesson
    }


    const key = `${tabKey}_${selectedLesson}`;
    // const isCompleted = completedMap.has(key);
    // const completedData = completedMap.get(key) || null;
    const isCompletedFromProgress = completedMapFromProgress.has(key);
    const isCompletedFromResponses = isAssignmentCompletedFromResponses(selectedLesson, tabKey);
    const isCompleted = isCompletedFromProgress || isCompletedFromResponses;

    const completedData = completedMapFromProgress.get(key) || null;
    
    return [{
      id: key,
      name: `${toggle} ${selectedLesson}`,
      number: selectedLesson,
      type: tabKey,
      isCompleted,
      completedData,
      hasResponses: isCompletedFromResponses
    }];
  };

  // Helper function to render student responses for lessons
  const renderStudentResponses = (assignment) => {
    if (!assignment.hasResponses || !studentResponses || !studentResponses.success || !studentResponses.responses) {
      return null;
    }

    const lessonData = studentResponses.responses.find(r => r.lessonId === `lesson${assignment.number}`);
    if (!lessonData) return null;

    const responses = lessonData.bpqResponses || [];
    
    if (responses.length === 0) return null;

    return (
      <div className="student-responses">
        <h5>Student Responses to Big Picture Questions:</h5>
        {responses.map((response, index) => (
          <div key={response.questionId || index} className="response-item">
            <div className="question-id">
  <strong>Question {response.questionId?.split('_')[1] || index + 1}:</strong>
  {response.questionText && (
    <p className="question-text">{response.questionText}</p>
  )}
</div>
            <div className="response-content">
              <div className="initial-answer">
                <p><strong>Initial Answer:</strong></p>
                <p className="answer-text">{response.initialAnswer || "No initial answer provided"}</p>
              </div>
              {response.finalAnswer && response.finalAnswer !== response.initialAnswer && (
                <div className="final-answer">
                  <p><strong>Final Answer:</strong></p>
                  <p className="answer-text">{response.finalAnswer}</p>
                </div>
              )}
              {response.feedback && (
                <div className="feedback">
                  <p><strong>Feedback:</strong></p>
                  <p className="feedback-text">{response.feedback}</p>
                </div>
              )}
              {response.scores && (
                <div className="scores">
                  <p><strong>Scores:</strong></p>
                  <div className="scores-grid">
                    {Object.entries(response.scores).map(([skill, score]) => (
                      <div key={skill} className="score-item">
                        <span className="skill-name">{skill}:</span>
                        <span className="score-value">{score}/20</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div className="response-timestamp">
          <small>Last updated: {new Date(studentResponses.student?.lastUpdated || Date.now()).toLocaleDateString()}</small>
        </div>
      </div>
    );
  };

  // Helper function to render worksheet responses
  const renderWorksheetResponses = (assignment) => {
    if (!assignment.hasResponses || !studentResponses || !studentResponses.success || !studentResponses.responses) {
      return null;
    }

    const lessonData = studentResponses.responses.find(r => r.lessonId === `lesson${assignment.number}`);
    if (!lessonData || !lessonData.worksheet) return null;

    const worksheet = lessonData.worksheet;

    return (
      <div className="worksheet-responses">
        <h5>Worksheet Responses:</h5>
        <div className="worksheet-details">
          {worksheet.submittedAt && (
            <p className="completion-info">
              <strong>Submitted:</strong> {new Date(worksheet.submittedAt).toLocaleDateString()}
            </p>
          )}
          {worksheet.worksheetId && (
            <p className="worksheet-id">
              <strong>Worksheet ID:</strong> {worksheet.worksheetId}
            </p>
          )}
          {worksheet.attemptNumber && (
            <p className="attempt-number">
              <strong>Attempt:</strong> {worksheet.attemptNumber}
            </p>
          )}
          {worksheet.score !== undefined && (
            <p className="worksheet-score">
              <strong>Score:</strong> {worksheet.score}%
            </p>
          )}
          {worksheet.answers && worksheet.answers.length > 0 ? (
            <div className="worksheet-answers">
              <p><strong>Answers provided:</strong> {worksheet.answers.length}</p>
              <div className="answers-summary">
                {worksheet.answers.slice(0, 15).map((answer, index) => (
                  <div key={index} className="answer-preview">
                    <strong>Q{index + 1} {answer.questionId?.split('_')[3] || 'Question'}:</strong> 
                    <div className="answer-content">
                      <span className="answer-text">
                        {answer.answer || answer.selectedAnswer || answer.value}
                      </span>
                      <span className={`answer-status ${answer.correct ? 'correct' : 'incorrect'}`}>
                        {answer.correct ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="no-answers">Worksheet submitted but no specific answers recorded</p>
          )}
          {worksheet.feedback && (
            <div className="worksheet-feedback">
              <p><strong>Feedback:</strong></p>
              <p className="feedback-text">{worksheet.feedback}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper function to render quiz responses
  const renderQuizResponses = (assignment) => {
    if (!assignment.hasResponses || !studentResponses || !studentResponses.success || !studentResponses.responses) {
      return null;
    }

    const lessonData = studentResponses.responses.find(r => r.lessonId === `lesson${assignment.number}`);
    if (!lessonData || !lessonData.quiz || lessonData.quiz.length === 0) return null;

    // Sort quiz attempts by attempt number (latest first)
    const sortedAttempts = [...lessonData.quiz].sort((a, b) => (b.attemptNumber || 0) - (a.attemptNumber || 0));
    const latestAttempt = sortedAttempts[0];

    return (
      <div className="quiz-responses">
        <h5>Quiz Results:</h5>
        <div className="quiz-summary">
          <p><strong>Total Attempts:</strong> {lessonData.quiz.length}</p>
          {latestAttempt && (
            <div className="latest-attempt">
              <p><strong>Latest Attempt #{latestAttempt.attemptNumber || 1}:</strong></p>
              <div className="attempt-details">
                {latestAttempt.score !== undefined && latestAttempt.total !== undefined && (
                  <p className="quiz-score">
                    <strong>Score:</strong> {latestAttempt.score}/{latestAttempt.total} 
                    ({Math.round((latestAttempt.score / latestAttempt.total) * 100)}%)
                  </p>
                )}
                {latestAttempt.submittedAt && (
                  <p className="submission-date">
                    <strong>Submitted:</strong> {new Date(latestAttempt.submittedAt).toLocaleDateString()}
                  </p>
                )}
                {latestAttempt.answers && latestAttempt.answers.length > 0 && (
                  <div className="quiz-answers">
                    <p><strong>Question Responses:</strong></p>
                    <div className="quiz-answers-list">
                      {latestAttempt.answers.slice(0, 20).map((answer, index) => (
                        <div key={index} className={`quiz-answer-item ${answer.correct ? 'correct' : 'incorrect'}`}>
                          <div className="question-info">
                            <strong>Q{index + 1}:</strong> 
                            <span className="question-id">{answer.questionId?.split('_').pop() || `Question ${index + 1}`}</span>
                          </div>
                          <div className="answer-info">
                            <span className="selected-answer">
                              <strong>Answer:</strong> {answer.selectedAnswer || answer.answer || 'No answer recorded'}
                            </span>
                            <span className={`answer-result ${answer.correct ? 'correct' : 'incorrect'}`}>
                              {answer.correct ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {latestAttempt.answers.length > 5 && (
                        <div className="more-answers">
                          {/* <em>...and {latestAttempt.answers.length - 5} more questions</em> */}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {sortedAttempts.length > 1 && (
            <div className="all-attempts">
              <p><strong>All Attempts:</strong></p>
              <div className="attempts-list">
                {sortedAttempts.map((attempt, index) => (
                  <div key={index} className="attempt-summary">
                    <span>Attempt #{attempt.attemptNumber || index + 1}: </span>
                    {attempt.score !== undefined && attempt.total !== undefined ? (
                      <span>{Math.round((attempt.score / attempt.total) * 100)}%</span>
                    ) : (
                      <span>Completed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper function to render assignment status
  const renderAssignmentStatus = (assignment) => {
    const statusClass = assignment.isCompleted ? 'completed' : 'incomplete';
    const statusText = assignment.isCompleted ? '✓ Completed' : '○ Incomplete';
    
    return (
      <div key={assignment.id} className={`assignment-item ${statusClass}`}>
        <div className="assignment-header">
          <h4>{assignment.name}</h4>
          <span className={`status-badge ${statusClass}`}>
            {statusText}
          </span>
        </div>
        
        <p className="assignment-description">
          {assignment.type === 'lesson' && 'Interactive lesson with multimedia content'}
          {assignment.type === 'worksheet' && 'Practice exercises and activities'}
          {assignment.type === 'quiz' && 'Assessment to test understanding'}
        </p>

        {/* {assignment.type === 'lesson' && assignment.isCompleted && (
          <div className="student-responses">
            <h5>Student Responses to Big Picture Questions:</h5>
            <p className="note">Student response data from MongoDB would be displayed here</p>
          </div>
        )} */}

      {responseLoading && (
                <div className="loading-responses">Loading responses...</div>
              )}

              {!responseLoading && assignment.isCompleted && (
                <>
                  {assignment.type === 'lesson' && renderStudentResponses(assignment)}
                  {assignment.type === 'worksheet' && renderWorksheetResponses(assignment)}
                  {assignment.type === 'quiz' && renderQuizResponses(assignment)}
                </>
              )}
        
        {assignment.isCompleted && assignment.completedData && (
          <div className="completion-details">
            <p className="completion-date">
              Completed: {new Date(assignment.completedData.completed_at).toLocaleDateString()}
            </p>
            {assignment.completedData.score && (
              <p className="completion-score">Score: {assignment.completedData.score}%</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Helper function to render tab content
  const renderTabContent = () => {
    if (loading) {
      return <div className="loading">Loading assignments...</div>;
    }

    if (!progressData) {
      return <div className="no-data">No progress data available</div>;
    }

    const tabAssignments = getAssignmentsForTab();
    const tabKey = toggle.toLowerCase();
    const breakdown = progressData.breakdown || {};
    const tabBreakdown = breakdown[tabKey] || {};
    
    if (tabAssignments.length === 0) {
      return (
        <div className="no-assignments">
          <p>No {toggle.toLowerCase()} assignments available for this course.</p>
        </div>
      );
    }

    const completedCount = tabBreakdown.completed || tabAssignments.filter(a => a.isCompleted).length;
    const totalCount = tabBreakdown.total || tabAssignments.length;

    return (
      <div className="assignments-container">
        <div className="assignments-summary">
          <h3>{toggle} Assignments</h3>
          <p className="summary-text">
            {completedCount} of {totalCount} assignments completed 
            ({Math.round((completedCount / totalCount) * 100)}%)
          </p>
        </div>
        
        <div className="assignments-list">
          {tabAssignments.map(renderAssignmentStatus)}
        </div>
      </div>
    );
  };

  const renderLessonBoxes = () => {
    if (!progressData || !progressData.available_assignments) return null;
    
    const lessons = progressData.available_assignments.lessons || [];
    
    return (
      <div className="lesson-boxes">
        {lessons.map(lessonNumber => (
          <div 
            key={lessonNumber}
            className={`lesson-box ${selectedLesson == lessonNumber ? 'selected' : ''}`}
            onClick={() => handleLessonClick(parseInt(lessonNumber))}
          >
            <h4>Lesson {lessonNumber}</h4>
            <div className="lesson-progress-indicator"></div>
          </div>
        ))}
      </div>
    );
  };


return (
  <div className="progress-content">
    <div className="progress-header"> {/* Changed from popup-header to progress-header */}
      <strong>
      <h2>Student Responses</h2>
      </strong>
      <p className="overall-progress">Overall Progress: {progress}%</p>
      <div className="progress-bar-display"> {/* Changed from popup-progress-bar to progress-bar-display */}
        <div className="progress-fill" style={{ width: `${progress}%` }}></div> {/* Changed from popup-progress to progress-fill */}
      </div>
    </div>

    {renderLessonBoxes()}

    {/* Toggle Button */}
    <div className="toggle-container">
      <div className="toggle">
        <button
          className={toggle === "Lesson" ? "active" : ""}
          onClick={() => handleToggleChange("Lesson")}
        >
          Lesson
        </button>
        <button
          className={toggle === "Worksheet" ? "active" : ""}
          onClick={() => handleToggleChange("Worksheet")}
        >
          Worksheet
        </button>
        <button
          className={toggle === "Quiz" ? "active" : ""}
          onClick={() => handleToggleChange("Quiz")}
        >
          Quiz
        </button>
        <div className={`toggle-indicator ${toggle}`} />
      </div>
    </div>

    {/* Tab Content */}
    <div className="tab-content">
      {renderTabContent()}
    </div>
  </div>
);
}
export default Popup;
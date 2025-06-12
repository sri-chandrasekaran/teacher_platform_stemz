import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
import pandas as pd
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

input_file = 'sample_student_scores.json'
with open(input_file, 'r') as f:
    sample_data = json.load(f)

def predict_future_scores(quiz_scores, num_predictions=5):
    X, y = [], []
    for i in range(len(quiz_scores) - 5):
        X.append(quiz_scores[i:i + 5])
        y.append(quiz_scores[i + 5])
    X, y = np.array(X), np.array(y)

    model = LinearRegression()
    model.fit(X, y)

    last_quizzes = np.array(quiz_scores[-5:]).reshape(1, -1)
    future_scores = []
    for _ in range(num_predictions):
        next_score = model.predict(last_quizzes)[0]
        future_scores.append(next_score)
        last_quizzes = np.roll(last_quizzes, -1)
        last_quizzes[0, -1] = next_score
    return future_scores

student_name = 'Student 1'  
quiz_scores = sample_data[student_name]['quiz_scores']

if len(quiz_scores) == 15:
    future_scores = predict_future_scores(quiz_scores)
    combined_scores = quiz_scores + future_scores  

    plt.figure(figsize=(10, 6))
    plt.plot(range(1, len(combined_scores) + 1), combined_scores, marker='o', label=student_name)

    plt.axvline(x=len(quiz_scores), color='gray', linestyle='--', label='Prediction Start')

    plt.title(f'Historical and Predicted Quiz Scores for {student_name}')
    plt.ylabel('Quiz Scores')
    plt.xlabel('Quiz Number')
    plt.axhline(y=70, color='r', linestyle='--', label='Passing Score (70)')
    plt.legend(loc='upper right')
    plt.grid()
    plt.tight_layout()
    plt.show()
else:
    print(f"{student_name} does not have exactly 15 quiz scores in the data.")

predictions = {}
for student, data in sample_data.items():
    quiz_scores = data['quiz_scores']
    if len(quiz_scores) == 15:
        future_scores = predict_future_scores(quiz_scores)
        predictions[student] = {
            "actual_scores": quiz_scores,
            "predicted_scores": future_scores
        }

plt.figure(figsize=(12, 8))
for student, scores in predictions.items():
    combined_scores = scores['actual_scores'] + scores['predicted_scores']
    plt.plot(range(1, len(combined_scores) + 1), combined_scores, marker='o', label=student)
    plt.axvline(x=len(scores['actual_scores']), color='gray', linestyle='--')

plt.title('Historical and Predicted Quiz Scores for Each Student')
plt.axhline(y=70, color='r', linestyle='--', label='Passing Score (70)')
plt.xlabel('Quiz Number')
plt.ylabel('Quiz Scores')
plt.legend(loc='upper right')
plt.grid()
plt.tight_layout()
plt.show()

average_scores, average_time, average_engagement, student_names = [], [], [], []
for student, data in sample_data.items():
    average_scores.append(np.mean(data['quiz_scores']))
    average_time.append(np.mean(data['time_spent']))
    average_engagement.append(np.mean(data['engagement_scores']))
    student_names.append(student)

df = pd.DataFrame({
    'Student': student_names,
    'Avg Score': average_scores,
    'Avg Time': average_time,
    'Avg Engagement': average_engagement
})

plt.figure(figsize=(12, 6))
plt.subplot(1, 3, 1)
sns.lineplot(x='Student', y='Avg Score', data=df, marker='o')
plt.xticks(rotation=90)
plt.title('Average Quiz Scores by Student')

plt.subplot(1, 3, 2)
sns.lineplot(x='Student', y='Avg Time', data=df, marker='o')
plt.xticks(rotation=90)
plt.title('Average Time Spent by Student (minutes)')

plt.subplot(1, 3, 3)
sns.lineplot(x='Student', y='Avg Engagement', data=df, marker='o')
plt.xticks(rotation=90)
plt.title('Average Engagement Scores by Student')
plt.tight_layout()
plt.show()

features, labels = [], []
for student, data in sample_data.items():
    avg_score = np.mean(data['quiz_scores'])
    avg_engagement = np.mean(data['engagement_scores'])
    features.append([avg_score, avg_engagement])
    labels.append(1 if avg_score < 70 else 0)

X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)

if len(np.unique(y_train)) < 2:
    print("Only one class present in training data; unable to train logistic regression model.")
    df['Predicted At-Risk Probability'] = 1 if y_train[0] == 1 else 0  # Set all to the single class
else:
    log_model = LogisticRegression()
    log_model.fit(X_train, y_train)
    y_pred = log_model.predict(X_test)
    print(classification_report(y_test, y_pred))

    predicted_probabilities = log_model.predict_proba(features)[:, 1]
    df['Predicted At-Risk Probability'] = predicted_probabilities

for student in df['Student']:
    student_data = df[df['Student'] == student]
    plt.figure(figsize=(6, 4))
    sns.lineplot(x='Student', y='Predicted At-Risk Probability', data=student_data, marker='o', color='red')
    plt.axhline(0.7, linestyle='--', color='gray', label='Threshold (0.7)')
    plt.title(f'Predicted At-Risk Probability for {student}')
    plt.ylim(0, 1)
    plt.legend()
    plt.show()

peer_comparisons = []
for student, data in sample_data.items():
    for peer, peer_data in sample_data.items():
        if student != peer:
            comparison = {
                'student': student,
                'peer': peer,
                'score_difference': np.mean(data['quiz_scores']) - np.mean(peer_data['quiz_scores']),
                'engagement_difference': np.mean(data['engagement_scores']) - np.mean(peer_data['engagement_scores'])
            }
            peer_comparisons.append(comparison)

df_comparisons = pd.DataFrame(peer_comparisons)

fig = go.Figure()
for student in df_comparisons['student'].unique():
    student_comparisons = df_comparisons[df_comparisons['student'] == student]
    fig.add_trace(go.Scatter(
        x=student_comparisons['peer'],
        y=student_comparisons['score_difference'],
        mode='markers+lines',
        name=student,
        text=student_comparisons['engagement_difference'],
        hoverinfo='text'
    ))

fig.update_layout(
    title='Score Differences Between Students',
    xaxis_title='Peer Students',
    yaxis_title='Score Difference',
    legend_title='Students'
)
fig.show()

import json
from datetime import datetime
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from collections import defaultdict
from sklearn.cluster import KMeans
import numpy as np

with open('synthetic_student_data.json', 'r') as json_file:
    students_data = json.load(json_file)

completion_rates = {}
student_scores = {}
engagement_metrics = {
    "total_engagement_time": 0,
    "total_interactions": 0,
    "meaningful_engagement": 0,
}

def calculate_engagement(interaction_logs):
    if not interaction_logs:
        return []
    
    interaction_logs.sort(key=lambda x: x['timestamp'])
    
    meaningful_times = []
    previous_time = None
    
    for log in interaction_logs:
        current_time = datetime.fromisoformat(log['timestamp'])
        
        if previous_time is not None:
            time_diff = (current_time - previous_time).total_seconds()
            if time_diff < 5:
                meaningful_times.append((previous_time, current_time))
        
        previous_time = current_time
    
    return meaningful_times

for student in students_data:
    student_id = student['student_id']
    
    if student_id not in student_scores:
        student_scores[student_id] = {"total_score": 0, "quiz_count": 0, "engagement_scores": []}

    for assignment in student["assignments"]:
        assignment_type = assignment["type"]

        if assignment_type not in completion_rates:
            completion_rates[assignment_type] = {"completed": 0, "total": 0}
        
        completion_rates[assignment_type]["total"] += 1
        if assignment["completed"]:
            completion_rates[assignment_type]["completed"] += 1
        
        if assignment_type == "quiz":
            student_scores[student_id]["total_score"] += assignment["average_score"]
            student_scores[student_id]["quiz_count"] += 1

        student_scores[student_id]["engagement_scores"].append(assignment["engagement_score"])
        
        engagement_metrics["total_engagement_time"] += assignment.get("completion_time", 0)
        engagement_metrics["total_interactions"] += len(assignment["interaction_logs"])
        
        meaningful_engagement_times = calculate_engagement(assignment.get("interaction_logs", []))
        engagement_metrics["meaningful_engagement"] += sum([(end - start).total_seconds() for start, end in meaningful_engagement_times])

for student_id, scores in student_scores.items():
    if scores["quiz_count"] > 0:
        average_score = scores["total_score"] / scores["quiz_count"]
        scores["average_score"] = average_score
    else:
        scores["average_score"] = 0

assignment_types = list(completion_rates.keys())
heatmap_data = []
student_labels = []

for student_id, scores in student_scores.items():
    student_labels.append(student_id)
    heatmap_data.append(scores["engagement_scores"])

heatmap_df = pd.DataFrame(heatmap_data, columns=assignment_types, index=student_labels)

fig_heatmap = go.Figure(data=go.Heatmap(
    z=heatmap_df.values,
    x=assignment_types,
    y=student_labels,
    colorscale='YlGn'
))
fig_heatmap.update_layout(
    title='Engagement Scores Heatmap',
    xaxis_title='Assignment Type',
    yaxis_title='Student',
)
fig_heatmap.show()

average_quiz_scores = []
student_labels = []

for student_id, scores in student_scores.items():
    if scores["quiz_count"] > 0:
        average_score = scores["total_score"] / scores["quiz_count"]
        average_quiz_scores.append(average_score)
        student_labels.append(student_id)

average_quiz_score = sum(average_quiz_scores) / len(average_quiz_scores) if average_quiz_scores else 0

fig_avg_quiz = go.Figure()
fig_avg_quiz.add_trace(go.Scatter(
    x=student_labels,
    y=average_quiz_scores,
    mode='lines+markers',
    name='Individual Average Scores',
    line=dict(dash='dash', color='green')
))
fig_avg_quiz.add_trace(go.Scatter(
    x=student_labels,
    y=[average_quiz_score] * len(student_labels),
    mode='lines',
    name=f'Average Score: {average_quiz_score:.2f}',
    line=dict(color='red')
))
fig_avg_quiz.update_layout(
    title='Average Quiz Scores',
    xaxis_title='Student',
    yaxis_title='Average Score',
    showlegend=True
)
fig_avg_quiz.show()


# Time series analysis of meaningful engagement interactions
interaction_times = defaultdict(int)

for student in students_data:
    for assignment in student["assignments"]:
        meaningful_engagement_times = calculate_engagement(assignment.get("interaction_logs", []))
        for start, end in meaningful_engagement_times:
            interaction_times[start] += (end - start).total_seconds()

sorted_times = sorted(interaction_times.items())
time_keys, interaction_counts = zip(*sorted_times)

fig_time_series = go.Figure()
fig_time_series.add_trace(go.Scatter(
    x=time_keys,
    y=interaction_counts,
    mode='lines+markers',
    name='Total Meaningful Engagement Time (seconds)',
    line=dict(color='blue')
))
fig_time_series.update_layout(
    title='Time Series Analysis of Meaningful Engagement Interactions',
    xaxis_title='Time',
    yaxis_title='Total Meaningful Engagement Time (seconds)',
)
fig_time_series.show()

# Plot for meaningful vs non-meaningful interactions
meaningful_interactions = defaultdict(int)
non_meaningful_interactions = defaultdict(int)

for student in students_data:
    for assignment in student["assignments"]:
        interaction_logs = assignment.get("interaction_logs", [])
        previous_time = None
        
        for log in interaction_logs:
            current_time = datetime.fromisoformat(log['timestamp'])
            
            if previous_time is not None:
                time_diff = (current_time - previous_time).total_seconds()
                time_key = current_time.replace(minute=0, second=0, microsecond=0)
                if time_diff < 5:
                    meaningful_interactions[time_key] += 1
                else:
                    non_meaningful_interactions[time_key] += 1
            
            previous_time = current_time

all_interaction_times = defaultdict(lambda: [0, 0]) 
for time_key in set(meaningful_interactions.keys()).union(set(non_meaningful_interactions.keys())):
    all_interaction_times[time_key][0] = meaningful_interactions[time_key]
    all_interaction_times[time_key][1] = non_meaningful_interactions[time_key]

sorted_interaction_times = sorted(all_interaction_times.items())
time_keys, interaction_values = zip(*sorted_interaction_times)
meaningful_counts, non_meaningful_counts = zip(*interaction_values)

fig_interaction_comparison = go.Figure()
fig_interaction_comparison.add_trace(go.Scatter(
    x=time_keys,
    y=meaningful_counts,
    mode='lines+markers',
    name='Meaningful Interactions',
    line=dict(color='green')
))
fig_interaction_comparison.add_trace(go.Scatter(
    x=time_keys,
    y=non_meaningful_counts,
    mode='lines+markers',
    name='Non-Meaningful Interactions',
    line=dict(color='orange')
))
fig_interaction_comparison.update_layout(
    title='Meaningful vs Non-Meaningful Interactions Over Time',
    xaxis_title='Time',
    yaxis_title='Number of Interactions',
)
fig_interaction_comparison.show()

# Completion Rate by Assignment Type
completion_percentages = [
    (data["completed"] / data["total"]) * 100 if data["total"] > 0 else 0
    for data in completion_rates.values()
]

fig_completion_rate = go.Figure()
fig_completion_rate.add_trace(go.Bar(
    x=list(completion_rates.keys()),
    y=completion_percentages,
    marker_color='teal'
))
fig_completion_rate.update_layout(
    title='Completion Rate by Assignment Type',
    xaxis_title='Assignment Type',
    yaxis_title='Completion Percentage',
)
fig_completion_rate.show()

# Comparing Average Scores Against Engagement Metrics
engagement_scores = [scores["average_score"] for scores in student_scores.values()]
mean_engagement_scores = [np.mean(scores["engagement_scores"]) for scores in student_scores.values()]
student_names = list(student_scores.keys())

hover_texts = [
    f"Student: {student_names[i]}<br>Avg Quiz Score: {engagement_scores[i]:.2f}<br>Engagement Score: {mean_engagement_scores[i]:.2f}"
    for i in range(len(student_names))
]

fig_comparison = go.Figure()
fig_comparison.add_trace(go.Scatter(
    x=engagement_scores,
    y=mean_engagement_scores,
    mode='markers',
    marker=dict(size=10, color='blue', opacity=0.5),
    hovertext=hover_texts,
    hoverinfo='text'
))

fig_comparison.update_layout(
    title='Average Quiz Scores vs. Engagement Metrics',
    xaxis_title='Average Quiz Scores',
    yaxis_title='Engagement Scores',
)

fig_comparison.show()


# K-means clustering to segment students based on engagement patterns
engagement_data = np.array([np.mean(scores["engagement_scores"]) for scores in student_scores.values()]).reshape(-1, 1)

kmeans = KMeans(n_clusters=3, random_state=0).fit(engagement_data)
labels = kmeans.labels_

for i, student_id in enumerate(student_scores.keys()):
    student_scores[student_id]["cluster"] = labels[i]

hover_texts_kmeans = [
    f"Student: {student_names[i]}<br>Avg Engagement Score: {np.mean(student_scores[student_id]['engagement_scores']):.2f}<br>Cluster: {labels[i]}"
    for i, student_id in enumerate(student_scores.keys())
]

fig_kmeans = go.Figure()
fig_kmeans.add_trace(go.Scatter(
    x=list(student_scores.keys()),
    y=[np.mean(scores["engagement_scores"]) for scores in student_scores.values()],
    mode='markers',
    marker=dict(size=10, color=labels, colorscale='Viridis', opacity=0.6),
    text=hover_texts_kmeans,
    hoverinfo='text'
))

fig_kmeans.update_layout(
    title='Student Engagement Clustering using K-Means',
    xaxis_title='Student ID',
    yaxis_title='Average Engagement Score',
)

fig_kmeans.show()
import random
import pandas as pd
import numpy as np

# 1. Generate Student Data with Classroom Assignment
def generate_students(num_students=100):
    classrooms = ['Classroom_A', 'Classroom_B', 'Classroom_C', 'Classroom_D']
    students = []
    for _ in range(num_students):
        student = {
            "student_id": f"student_{random.randint(1, 1000)}",
            "grade_level": random.choice(['K', '1', '2', '3', '4', '5']),
            "classroom": random.choice(classrooms)  # Assign one of the four classrooms
        }
        students.append(student)
    return pd.DataFrame(students)

# 2. Generate Assignments
def generate_assignments(num_assignments=50):
    assignments = []
    for _ in range(num_assignments):
        assignment = {
            "assignment_id": f"assignment_{random.randint(1, 1000)}",
            "type": random.choice(['quiz', 'worksheet', 'slideshow']),
            "difficulty_level": random.randint(1, 5),
            "required_time_min": random.randint(5, 45)
        }
        assignments.append(assignment)
    return pd.DataFrame(assignments)

# 3. Generate Engagement Data
def generate_engagement(students_df, assignments_df):
    engagements = []
    for _, student in students_df.iterrows():
        for _, assignment in assignments_df.iterrows():
            engagement = {
                "student_id": student["student_id"],
                "classroom": student["classroom"],  # Include classroom for class vs. class analysis
                "assignment_id": assignment["assignment_id"],
                "time_spent_min": max(1, int(np.random.normal(assignment["required_time_min"], 5))),
                "meaningful_interactions": random.choice([True, False]),
                "attempt_count": random.randint(1, 3),
                "completion_in_one_sitting": random.choice([True, False]),
                "help_requests": random.randint(0, 3),
                "clicks": random.randint(1, 20),
                "idle_time_min": random.randint(0, 10)
            }
            engagements.append(engagement)
    return pd.DataFrame(engagements)

# 4. Generate Historical and Predictive Data
def generate_scores(students_df, assignments_df):
    scores = []
    for _, student in students_df.iterrows():
        for _, assignment in assignments_df.iterrows():
            score = {
                "student_id": student["student_id"],
                "classroom": student["classroom"],  # Include classroom to correlate scores by class
                "assignment_id": assignment["assignment_id"],
                "historical_score": max(1, random.randint(1, 100)),
                "predicted_success_rate": round(random.uniform(0.5, 1.0), 2),
                "mastery_level": random.choice(['Beginner', 'Intermediate', 'Advanced'])
            }
            scores.append(score)
    return pd.DataFrame(scores)

# Function to save DataFrame to JSON file
def save_to_json(df, filename):
    # Convert the DataFrame to a list of dictionaries and save as JSON
    df.to_json(f"{filename}.json", orient="records", indent=4)

# Generate the Data
students_df = generate_students()
assignments_df = generate_assignments()
engagements_df = generate_engagement(students_df, assignments_df)
scores_df = generate_scores(students_df, assignments_df)

# Save each DataFrame to a JSON file
save_to_json(students_df, "students_data")
save_to_json(assignments_df, "assignments_data")
save_to_json(engagements_df, "engagement_data")
save_to_json(scores_df, "scores_data")
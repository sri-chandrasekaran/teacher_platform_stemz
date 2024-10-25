import random
import json

# Parameters for sample data
num_students = 5
num_quizzes = 15
output_file = 'sample_student_scores.json'

def generate_sample_student_data(num_students, num_quizzes):
    student_data = {}

    for student_id in range(1, num_students + 1):
        student_name = f"Student {student_id}"
        quiz_scores = [random.randint(0, 100) for _ in range(num_quizzes)]  
        time_spent = [random.randint(15, 180) for _ in range(num_quizzes)]  
        engagement_scores = [random.randint(1, 10) for _ in range(num_quizzes)] 

        student_data[student_name] = {
            "quiz_scores": quiz_scores,
            "time_spent": time_spent,
            "engagement_scores": engagement_scores
        }

    return student_data

sample_data = generate_sample_student_data(num_students, num_quizzes)
with open(output_file, 'w') as f:
    json.dump(sample_data, f, indent=4)

print(f"Sample student data saved to {output_file}")

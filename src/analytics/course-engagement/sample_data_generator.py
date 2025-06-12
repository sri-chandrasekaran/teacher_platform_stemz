import random
import json
from datetime import datetime, timedelta

def generate_synthetic_data(num_students, num_assignments):
    students_data = []

    for student_id in range(1, num_students + 1):
        student_info = {
            "student_id": f"S{student_id:03}",
            "assignments": []
        }
        
        for assignment_id in range(1, num_assignments + 1):
            assignment_type = random.choice(["worksheet", "slideshow", "quiz"])
            if assignment_type == "quiz":
                completion_time = random.randint(10, 180)
                completed = True
                one_sitting = random.choice([True, False])
                engagement_score = random.randint(0, 10)
                average_score = random.randint(0, 100) 
            else:
                completion_time = random.randint(15, 180)
                completed = random.choice([True, False]) 
                one_sitting = completed and random.choice([True, False])  
                engagement_score = random.randint(0, 10)  
                average_score = random.randint(0, 20)  

            interaction_logs = []
            total_engagement_time = 0

            num_interactions = random.randint(3, 10)
            for _ in range(num_interactions):
                action_time = random.randint(1, 5)
                total_engagement_time += action_time
                interaction_logs.append({
                    "timestamp": (datetime.now() - timedelta(minutes=random.randint(0, 60))).isoformat(),
                    "action": random.choice(["start", "button_click", "answer_question", "finish"]),
                    "time_spent": action_time
                })

            assignment_data = {
                "assignment_id": f"A{assignment_id}",
                "type": assignment_type,
                "completion_time": completion_time,
                "completed": completed,
                "one_sitting": one_sitting,
                "engagement_score": engagement_score,
                "average_score": average_score,
                "interaction_logs": interaction_logs,
                "total_engagement_time": total_engagement_time
            }
            student_info["assignments"].append(assignment_data)

        students_data.append(student_info)

    return students_data

num_students = 25.
num_assignments = 3  

synthetic_data = generate_synthetic_data(num_students, num_assignments)

print(json.dumps(synthetic_data, indent=2))

with open('synthetic_student_data.json', 'w') as json_file:
    json.dump(synthetic_data, json_file, indent=2)

print("Synthetic data generated and saved to 'synthetic_student_data.json'.")

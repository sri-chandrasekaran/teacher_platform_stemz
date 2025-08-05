import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import cross_val_score
import matplotlib.pyplot as plt

# 1. Example training data (replace with your real data)
X_train = np.array([
    [85, 78],
    [90, 82],
    [70, 65],
    [60, 58],
    [88, 85],
    [75, 70],
    [92, 95],
    [50, 55],
    [80, 82],
    [65, 60]
])

y_train = np.array([
    [82, 80, 78, 79, 81, 80, 83, 84],
    [88, 86, 87, 89, 90, 88, 87, 89],
    [68, 67, 65, 66, 68, 69, 67, 70],
    [62, 60, 58, 59, 61, 60, 59, 60],
    [90, 89, 88, 87, 90, 89, 88, 90],
    [72, 70, 68, 69, 71, 70, 71, 73],
    [95, 94, 96, 95, 97, 96, 95, 97],
    [55, 52, 53, 50, 55, 54, 53, 52],
    [81, 82, 83, 80, 82, 81, 83, 84],
    [67, 65, 66, 64, 66, 65, 64, 67]
])

# 2. Train a Gradient Boosting model
base_model = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
model = MultiOutputRegressor(base_model)
model.fit(X_train, y_train)

# Optional: Cross-validation check
scores = cross_val_score(model, X_train, y_train, cv=5, scoring='neg_mean_squared_error')
print(f"Cross-Validation MSE (average): {-np.mean(scores):.2f}")

# 3. Prediction function
def predict_future_performance(student_scores_so_far, model, threshold=65):
    student_array = np.array(student_scores_so_far).reshape(1, -1)
    predicted_scores = model.predict(student_array).flatten()
    predicted_scores = np.clip(predicted_scores, 0, 100)  # Ensure within 0-100 range
    average_future_score = np.mean(predicted_scores)
    warning = average_future_score < threshold
    return {
        "predicted_scores": predicted_scores.tolist(),
        "average_future_score": average_future_score,
        "warning": warning
    }

# 4. Example usage
student_scores_so_far = [21, 39]
prediction_result = predict_future_performance(student_scores_so_far, model)

print("Predicted future scores:", prediction_result["predicted_scores"])
print("Predicted average score:", prediction_result["average_future_score"])
if prediction_result["warning"]:
    print("Warning: Student may struggle in future courses.")
else:
    print("Student is likely to do fine in future courses.")

actual_scores = student_scores_so_far  # Use the actual scores (first two quizzes)
predicted_scores = prediction_result["predicted_scores"]

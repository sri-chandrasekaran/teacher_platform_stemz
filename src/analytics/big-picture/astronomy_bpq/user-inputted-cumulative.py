import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, StackingRegressor
from catboost import CatBoostRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split
from imblearn.over_sampling import SMOTE
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer
import json
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import seaborn as sns
import pandas as pd


# def plot_3d_scatter(x, y, z, x_label, y_label, z_label, title="3D Scatter Plot"):
#     fig = plt.figure(figsize=(10, 7))
#     ax = fig.add_subplot(111, projection='3d')
    
#     ax.scatter(x, y, z, c=z, cmap='viridis', marker='o')
    
#     ax.set_xlabel(x_label)
#     ax.set_ylabel(y_label)
#     ax.set_zlabel(z_label)
#     ax.set_title(title)
    
#     plt.show()

with open('4_5lesson1.json') as f:
    data = json.load(f)

analyzer = SentimentIntensityAnalyzer()
vectorizer = TfidfVectorizer()

X_features = []
y_Creativity, y_Critical_Thinking, y_Observation, y_Curiosity, y_Problem_Solving = [], [], [], [], []

for question in data['questions']:
    for response in question['responses']:
        response_text = response['response']
        response_length = len(response_text)
        
        X_features.append([response_length])
        sentiment = analyzer.polarity_scores(response_text)
        sentiment_score = sentiment['compound']
        X_features[-1].append(sentiment_score)
        
        scores = response.get('scores', {})
        y_Creativity.append(scores.get('Creativity', 0))
        y_Critical_Thinking.append(scores.get('Critical Thinking', 0))
        y_Observation.append(scores.get('Observation', 0))
        y_Curiosity.append(scores.get('Curiosity', 0))
        y_Problem_Solving.append(scores.get('Problem Solving', 0))

X_features = np.array(X_features)

tfidf_matrix = vectorizer.fit_transform([response['response'] for question in data['questions'] for response in question['responses']])
X_features = np.concatenate((X_features, tfidf_matrix.toarray()), axis=1)

smote = SMOTE(sampling_strategy='auto', k_neighbors=3)

X_resampled_Creativity, y_resampled_Creativity = smote.fit_resample(X_features, y_Creativity)
X_resampled_Critical_Thinking, y_resampled_Critical_Thinking = smote.fit_resample(X_features, y_Critical_Thinking)
X_resampled_Observation, y_resampled_Observation = smote.fit_resample(X_features, y_Observation)
X_resampled_Curiosity, y_resampled_Curiosity = smote.fit_resample(X_features, y_Curiosity)
X_resampled_Problem_Solving, y_resampled_Problem_Solving = smote.fit_resample(X_features, y_Problem_Solving)

X_train_Creativity, X_test_Creativity, y_train_Creativity, y_test_Creativity = train_test_split(X_resampled_Creativity, y_resampled_Creativity, test_size=0.2, random_state=42)
X_train_Critical_Thinking, X_test_Critical_Thinking, y_train_Critical_Thinking, y_test_Critical_Thinking = train_test_split(X_resampled_Critical_Thinking, y_resampled_Critical_Thinking, test_size=0.2, random_state=42)
X_train_Observation, X_test_Observation, y_train_Observation, y_test_Observation = train_test_split(X_resampled_Observation, y_resampled_Observation, test_size=0.2, random_state=42)
X_train_Curiosity, X_test_Curiosity, y_train_Curiosity, y_test_Curiosity = train_test_split(X_resampled_Curiosity, y_resampled_Curiosity, test_size=0.2, random_state=42)
X_train_Problem_Solving, X_test_Problem_Solving, y_train_Problem_Solving, y_test_Problem_Solving = train_test_split(X_resampled_Problem_Solving, y_resampled_Problem_Solving, test_size=0.2, random_state=42)


base_models = [
    ('rf', RandomForestRegressor(n_estimators=100)),
    ('gb', GradientBoostingRegressor(n_estimators=100)),
    ('cb', CatBoostRegressor(verbose=0))
]

stacked_model_creativity = StackingRegressor(
    estimators=base_models,
    final_estimator=Ridge()
)
stacked_model_creativity.fit(X_train_Creativity, y_train_Creativity)

stacked_model_critical_thinking = StackingRegressor(
    estimators=base_models,
    final_estimator=Ridge()
)
stacked_model_critical_thinking.fit(X_train_Critical_Thinking, y_train_Critical_Thinking)

stacked_model_observation = StackingRegressor(
    estimators=base_models,
    final_estimator=Ridge()
)
stacked_model_observation.fit(X_train_Observation, y_train_Observation)

stacked_model_curiosity = StackingRegressor(
    estimators=base_models,
    final_estimator=Ridge()
)
stacked_model_curiosity.fit(X_train_Curiosity, y_train_Curiosity)

stacked_model_problem_solving = StackingRegressor(
    estimators=base_models,
    final_estimator=Ridge()
)
stacked_model_problem_solving.fit(X_train_Problem_Solving, y_train_Problem_Solving)

y_pred_Creativity = stacked_model_creativity.predict(X_test_Creativity)
y_pred_Critical_Thinking = stacked_model_critical_thinking.predict(X_test_Critical_Thinking)
y_pred_Observation = stacked_model_observation.predict(X_test_Observation)
y_pred_Curiosity = stacked_model_curiosity.predict(X_test_Curiosity)
y_pred_Problem_Solving = stacked_model_problem_solving.predict(X_test_Problem_Solving)

mse_Creativity = mean_squared_error(y_test_Creativity, y_pred_Creativity)
mse_Critical_Thinking = mean_squared_error(y_test_Critical_Thinking, y_pred_Critical_Thinking)
mse_Observation = mean_squared_error(y_test_Observation, y_pred_Observation)
mse_Curiosity = mean_squared_error(y_test_Curiosity, y_pred_Curiosity)
mse_Problem_Solving = mean_squared_error(y_test_Problem_Solving, y_pred_Problem_Solving)

print(f"MSE Creativity: {mse_Creativity:.4f}")
print(f"MSE Critical Thinking: {mse_Critical_Thinking:.4f}")
print(f"MSE Observation: {mse_Observation:.4f}")
print(f"MSE Curiosity: {mse_Curiosity:.4f}")
print(f"MSE Problem Solving: {mse_Problem_Solving:.4f}")

# to compare at most 3 metrics 
# min_length = min(len(y_pred_Creativity), len(y_pred_Critical_Thinking), len(y_pred_Curiosity))
# y_pred_Creativity = y_pred_Creativity[:min_length]
# y_pred_Critical_Thinking = y_pred_Critical_Thinking[:min_length]
# y_pred_Curiosity = y_pred_Curiosity[:min_length]

# plot_3d_scatter(
#     y_pred_Creativity, y_pred_Critical_Thinking, y_pred_Curiosity,
#     x_label="Predicted Creativity Score",
#     y_label="Predicted Critical Thinking Score",
#     z_label="Predicted Curiosity Score",
#     title="3D Scatter Plot of Predicted Scores"
# )

# to compare all 5 metrics
# min_length = min(
#     len(y_pred_Creativity),
#     len(y_pred_Critical_Thinking),
#     len(y_pred_Observation),
#     len(y_pred_Curiosity),
#     len(y_pred_Problem_Solving)
# )

# y_pred_Creativity = y_pred_Creativity[:min_length]
# y_pred_Critical_Thinking = y_pred_Critical_Thinking[:min_length]
# y_pred_Observation = y_pred_Observation[:min_length]
# y_pred_Curiosity = y_pred_Curiosity[:min_length]
# y_pred_Problem_Solving = y_pred_Problem_Solving[:min_length]

# def parallel_coordinates_plot(predictions_dict):
#     data = pd.DataFrame(predictions_dict)
#     plt.figure(figsize=(12, 7))
#     sns.set(style="whitegrid")
#     sns.lineplot(data=data, dashes=False)
#     plt.title("Parallel Coordinates Plot of Predicted Scores")
#     plt.xlabel("Metrics")
#     plt.ylabel("Predicted Score")
#     plt.show()

# predictions_dict = {
#     "Creativity": y_pred_Creativity,
#     "Critical Thinking": y_pred_Critical_Thinking,
#     "Observation": y_pred_Observation,
#     "Curiosity": y_pred_Curiosity,
#     "Problem Solving": y_pred_Problem_Solving
# }
# parallel_coordinates_plot(predictions_dict)

def score_response(response):
    response_length = len(response)
    sentiment = analyzer.polarity_scores(response)
    sentiment_score = sentiment['compound']

    X_response = np.array([[response_length, sentiment_score]])
    tfidf_features = vectorizer.transform([response]).toarray()
    X_response = np.concatenate((X_response, tfidf_features), axis=1)

    creativity_score = stacked_model_creativity.predict(X_response)[0]
    critical_thinking_score = stacked_model_critical_thinking.predict(X_response)[0]
    observation_score = stacked_model_observation.predict(X_response)[0]
    curiosity_score = stacked_model_curiosity.predict(X_response)[0]
    problem_solving_score = stacked_model_problem_solving.predict(X_response)[0]

    scores = {
        "Creativity": creativity_score,
        "Critical Thinking": critical_thinking_score,
        "Observation": observation_score,
        "Curiosity": curiosity_score,
        "Problem Solving": problem_solving_score
    }

    return scores

def main():
    questions = [q['question'] for q in data['questions']]
    question = np.random.choice(questions)
    print("\nQuestion:")
    print(question)
    
    user_response = input("\nYour Answer: ")

    general_scores = score_response(user_response)
    
    print("\nGeneral Scores:")
    for metric, score in general_scores.items():
        print(f"{metric}: {score:.2f}")

if __name__ == "__main__":
    main()

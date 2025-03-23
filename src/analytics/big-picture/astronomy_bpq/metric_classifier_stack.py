import json
import numpy as np
import torch
import shap
from transformers import BertTokenizer, BertModel
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.linear_model import RidgeCV
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler

# Load BERT model and tokenizer
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
bert_model = BertModel.from_pretrained("bert-base-uncased")

def encode_with_bert(texts):
    """Encodes text responses into embeddings using BERT."""
    inputs = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
    with torch.no_grad():
        outputs = bert_model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).numpy()

def is_valid_response(response, question):
    keywords = set(question.lower().split())
    response_words = set(response.lower().split())
    
    if len(response.split()) < 2:
        return False, "Seems like your answer isn't related to the question, let's try that again."
    elif len(response_words.intersection(keywords)) == 0:
        return False, "It seems like your response doesn't address the question. Please try again."
    
    return True, None

# Load dataset
with open("l1_k_2_questions.json", "r") as f:
    data = json.load(f)

X, y = [], []

for entry in data.get("questions", []):
    for response in entry.get("responses", []):
        if "response" in response and all(
            key in response for key in ["Creativity", "Critical Thinking", "Observation", "Curiosity", "Problem Solving"]
        ):
            X.append(response["response"])
            y.append([
                response["Creativity"],
                response["Critical Thinking"],
                response["Observation"],
                response["Curiosity"],
                response["Problem Solving"]
            ])

if not X or not y:
    print("Error: No valid data found! Check JSON structure.")
    exit()

X_embeddings = encode_with_bert(X)
y = np.array(y)

scaler = StandardScaler()
X_embeddings = scaler.fit_transform(X_embeddings)

X_train, X_test, y_train, y_test = train_test_split(X_embeddings, y, test_size=0.2, random_state=42)

# Hyperparameter tuning for RandomForest
rf = MultiOutputRegressor(RandomForestRegressor(random_state=42))
rf_params = {
    "estimator__n_estimators": [200, 300, 500, 700],
    "estimator__max_depth": [10, 20, 30, None],
    "estimator__min_samples_split": [2, 5, 10]
}
rf_cv = RandomizedSearchCV(rf, rf_params, n_iter=10, cv=3, verbose=1, n_jobs=-1)
rf = rf_cv.fit(X_train, y_train).best_estimator_

# Hyperparameter tuning for GradientBoosting
gb = MultiOutputRegressor(GradientBoostingRegressor(random_state=42))
gb_params = {"estimator__n_estimators": [300, 500], "estimator__learning_rate": [0.03, 0.05], "estimator__max_depth": [3, 5, 7]}
gb_cv = RandomizedSearchCV(gb, gb_params, n_iter=5, cv=3, verbose=1, n_jobs=-1)
gb = gb_cv.fit(X_train, y_train).best_estimator_

# Hyperparameter tuning for MLP
mlp = MultiOutputRegressor(MLPRegressor(max_iter=1000, early_stopping=True, random_state=42, solver='adam'))
mlp_params = {"estimator__hidden_layer_sizes": [(128, 64), (256, 128)], "estimator__learning_rate_init": [0.001, 0.0005]}
mlp_cv = RandomizedSearchCV(mlp, mlp_params, n_iter=5, cv=3, verbose=1, n_jobs=-1)
mlp = mlp_cv.fit(X_train, y_train).best_estimator_

meta_model = RidgeCV()

for model in [rf, gb, mlp]:
    model.fit(X_train, y_train)

base_preds_train = np.column_stack([rf.predict(X_train), gb.predict(X_train), mlp.predict(X_train)])
meta_model.fit(base_preds_train, y_train)

base_preds_test = np.column_stack([rf.predict(X_test), gb.predict(X_test), mlp.predict(X_test)])
final_pred = meta_model.predict(base_preds_test)

mse = mean_squared_error(y_test, final_pred)
mae = mean_absolute_error(y_test, final_pred)
r2 = r2_score(y_test, final_pred)

print("\nModel Evaluation:")
print(f"Mean Squared Error (MSE): {mse:.4f}")
print(f"Mean Absolute Error (MAE): {mae:.4f}")
print(f"R² Score: {r2:.4f}")

# --------------------- USER INPUT PREDICTION ---------------------

# Random question selected
questions_list = [entry["question"] for entry in data.get("questions", []) if "question" in entry]
if not questions_list:
    print("Error: No questions found in dataset!")
    exit()

selected_question = np.random.choice(questions_list)
print("\nAnswer the following question:")
print(f"{selected_question}")

# user_response = input("\nEnter your response: ")

# # checking if there are meaningful words in the sentence
# def is_valid_response(response, question):
#     keywords = set(question.lower().split())
#     response_words = set(response.lower().split())
    
#     if len(response.split()) < 2 or len(response_words.intersection(keywords)) == 0:
#         return False
#     return True

# # checking if it's a one word or no word response
# if not user_response or len(user_response.split()) == 1:
#     print("\nInvalid response. Predicted Scores: 0 for all metrics.")
#     print(f"Creativity: 0")
#     print(f"Critical Thinking: 0")
#     print(f"Observation: 0")
#     print(f"Curiosity: 0")
#     print(f"Problem Solving: 0")
#     exit()

# user_embedding = encode_with_bert([user_response])
# user_embedding = scaler.transform(user_embedding)

# base_preds_user = np.column_stack([
#     rf.predict(user_embedding),
#     gb.predict(user_embedding),
#     mlp.predict(user_embedding)
# ])
# user_pred = meta_model.predict(base_preds_user)

# rounded_predictions = np.round(user_pred[0]).astype(int)

# # if any of the individual scores are less than 10 then we redo
# # feedback = []
# # for i, score in enumerate(rounded_predictions):
# #     if score < 10:
# #         feedback.append(f"Score for metric {['Creativity', 'Critical Thinking', 'Observation', 'Curiosity', 'Problem Solving'][i]} is below threshold. Try answering the question again.")

# print("\nPredicted Scores:")
# print(f"Creativity: {rounded_predictions[0]}")
# print(f"Critical Thinking: {rounded_predictions[1]}")
# print(f"Observation: {rounded_predictions[2]}")
# print(f"Curiosity: {rounded_predictions[3]}")
# print(f"Problem Solving: {rounded_predictions[4]}")

while True:
    user_response = input("\nEnter your response: ")

    # Check if the response is valid
    valid, feedback = is_valid_response(user_response, selected_question)

    if not valid:
        print("\nInvalid response.")
        print(feedback)  # This will print the specific feedback message.
        continue  # Let the user try again

    user_embedding = encode_with_bert([user_response])
    user_embedding = scaler.transform(user_embedding)

    base_preds_user = np.column_stack([
        rf.predict(user_embedding),
        gb.predict(user_embedding),
        mlp.predict(user_embedding)
    ])
    user_pred = meta_model.predict(base_preds_user)

    rounded_predictions = np.round(user_pred[0]).astype(int)

    print("\nPredicted Scores:")
    print(f"Creativity: {rounded_predictions[0]}")
    print(f"Critical Thinking: {rounded_predictions[1]}")
    print(f"Observation: {rounded_predictions[2]}")
    print(f"Curiosity: {rounded_predictions[3]}")
    print(f"Problem Solving: {rounded_predictions[4]}")
    break 
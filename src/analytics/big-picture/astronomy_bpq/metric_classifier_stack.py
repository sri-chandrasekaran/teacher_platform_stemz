# import json
# import numpy as np
# from sentence_transformers import SentenceTransformer
# from sklearn.model_selection import train_test_split
# from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor

# from sklearn.neural_network import MLPRegressor
# from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
# from sklearn.linear_model import Ridge
# from sklearn.multioutput import MultiOutputRegressor
# from sklearn.preprocessing import StandardScaler

# embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# with open("l1_k_2_questions.json", "r") as f:
#     data = json.load(f)

# X, y = [], []

# for entry in data.get("questions", []):
#     for response in entry.get("responses", []):
#         if "response" in response and all(
#             key in response for key in ["Creativity", "Critical Thinking", "Observation", "Curiosity", "Problem Solving"]
#         ):
#             X.append(response["response"])
#             y.append([
#                 response["Creativity"],
#                 response["Critical Thinking"],
#                 response["Observation"],
#                 response["Curiosity"],
#                 response["Problem Solving"]
#             ])

# if not X or not y:
#     print("Error: No valid data found! Check JSON structure.")
#     exit()

# X_embeddings = np.array(embedding_model.encode(X))
# X_embeddings = X_embeddings / np.linalg.norm(X_embeddings, axis=1, keepdims=True)  # Normalize embeddings
# y = np.array(y)

# scaler = StandardScaler()
# X_embeddings = scaler.fit_transform(X_embeddings)

# X_train, X_test, y_train, y_test = train_test_split(X_embeddings, y, test_size=0.2, random_state=42)

# rf = MultiOutputRegressor(RandomForestRegressor(n_estimators=300, max_depth=10, min_samples_split=5, random_state=42))
# gb = MultiOutputRegressor(GradientBoostingRegressor(n_estimators=300, max_depth=5, learning_rate=0.05, subsample=0.8, random_state=42))
# mlp = MultiOutputRegressor(MLPRegressor(hidden_layer_sizes=(256, 128), activation='relu', max_iter=1000, learning_rate_init=0.001, early_stopping=True, random_state=42))
# ridge = MultiOutputRegressor(Ridge(alpha=0.01))

# for model in [rf, gb, mlp, ridge]:
#     model.fit(X_train, y_train)

# rf_pred, gb_pred, mlp_pred, ridge_pred = [model.predict(X_test) for model in [rf, gb, mlp, ridge]]

# final_pred = (0.35 * rf_pred) + (0.3 * gb_pred) + (0.2 * mlp_pred) + (0.15 * ridge_pred)

# mse = mean_squared_error(y_test, final_pred)
# mae = mean_absolute_error(y_test, final_pred)
# r2 = r2_score(y_test, final_pred)

# print("\nModel Evaluation:")
# print(f"Mean Squared Error (MSE): {mse:.4f}")
# print(f"Mean Absolute Error (MAE): {mae:.4f}")
# print(f"R² Score: {r2:.4f}")

# residuals = y_test - final_pred
# print("\nResidual Analysis:")
# print(f"Mean Residual Error: {np.mean(residuals):.4f}")
# print(f"Standard Deviation of Residuals: {np.std(residuals):.4f}")

# user_response = input("\nEnter your response: ")
# user_embedding = np.array(embedding_model.encode([user_response]))
# user_embedding = user_embedding / np.linalg.norm(user_embedding, axis=1, keepdims=True)
# user_embedding = scaler.transform(user_embedding)

# rf_pred_user, gb_pred_user, mlp_pred_user, ridge_pred_user = [model.predict(user_embedding) for model in [rf, gb, mlp, ridge]]
# user_pred = (0.35 * rf_pred_user) + (0.3 * gb_pred_user) + (0.2 * mlp_pred_user) + (0.15 * ridge_pred_user)

# rounded_predictions = np.round(user_pred[0]).astype(int)

# print("\nPredicted Scores:")
# print(f"Creativity: {rounded_predictions[0]}")
# print(f"Critical Thinking: {rounded_predictions[1]}")
# print(f"Observation: {rounded_predictions[2]}")
# print(f"Curiosity: {rounded_predictions[3]}")
# print(f"Problem Solving: {rounded_predictions[4]}")

import json
import numpy as np
from transformers import BertTokenizer, BertModel
import torch
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.linear_model import Ridge
from sklearn.multioutput import MultiOutputRegressor
from sklearn.preprocessing import StandardScaler

# Load BERT model and tokenizer
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
bert_model = BertModel.from_pretrained("bert-base-uncased")

# Function to encode the response using BERT
def encode_with_bert(texts):
    inputs = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
    with torch.no_grad():
        outputs = bert_model(**inputs)
    # Using the output of the [CLS] token (first token in the sequence)
    return outputs.last_hidden_state[:, 0, :].numpy()

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

# Encode the responses using BERT
X_embeddings = encode_with_bert(X)
y = np.array(y)

scaler = StandardScaler()
X_embeddings = scaler.fit_transform(X_embeddings)

X_train, X_test, y_train, y_test = train_test_split(X_embeddings, y, test_size=0.2, random_state=42)

rf = MultiOutputRegressor(RandomForestRegressor(n_estimators=300, max_depth=10, min_samples_split=5, random_state=42))
gb = MultiOutputRegressor(GradientBoostingRegressor(n_estimators=300, max_depth=5, learning_rate=0.05, subsample=0.8, random_state=42))
mlp = MultiOutputRegressor(MLPRegressor(hidden_layer_sizes=(256, 128), activation='relu', max_iter=1000, learning_rate_init=0.001, early_stopping=True, random_state=42))
ridge = MultiOutputRegressor(Ridge(alpha=0.01))

# Train models
for model in [rf, gb, mlp, ridge]:
    model.fit(X_train, y_train)

rf_pred, gb_pred, mlp_pred, ridge_pred = [model.predict(X_test) for model in [rf, gb, mlp, ridge]]

final_pred = (0.35 * rf_pred) + (0.3 * gb_pred) + (0.2 * mlp_pred) + (0.15 * ridge_pred)

mse = mean_squared_error(y_test, final_pred)
mae = mean_absolute_error(y_test, final_pred)
r2 = r2_score(y_test, final_pred)

print("\nModel Evaluation:")
print(f"Mean Squared Error (MSE): {mse:.4f}")
print(f"Mean Absolute Error (MAE): {mae:.4f}")
print(f"R² Score: {r2:.4f}")

residuals = y_test - final_pred
print("\nResidual Analysis:")
print(f"Mean Residual Error: {np.mean(residuals):.4f}")
print(f"Standard Deviation of Residuals: {np.std(residuals):.4f}")

# For user input
user_response = input("\nEnter your response: ")
user_embedding = encode_with_bert([user_response])
user_embedding = scaler.transform(user_embedding)

rf_pred_user, gb_pred_user, mlp_pred_user, ridge_pred_user = [model.predict(user_embedding) for model in [rf, gb, mlp, ridge]]
user_pred = (0.35 * rf_pred_user) + (0.3 * gb_pred_user) + (0.2 * mlp_pred_user) + (0.15 * ridge_pred_user)

rounded_predictions = np.round(user_pred[0]).astype(int)

print("\nPredicted Scores:")
print(f"Creativity: {rounded_predictions[0]}")
print(f"Critical Thinking: {rounded_predictions[1]}")
print(f"Observation: {rounded_predictions[2]}")
print(f"Curiosity: {rounded_predictions[3]}")
print(f"Problem Solving: {rounded_predictions[4]}")

import json
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.linear_model import Ridge
from sklearn.multioutput import MultiOutputRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# Load Sentence Transformer model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

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

# Convert responses to embeddings
X_embeddings = np.array(embedding_model.encode(X))
X_embeddings = X_embeddings / np.linalg.norm(X_embeddings, axis=1, keepdims=True)  # Normalize embeddings
y = np.array(y)

# Standardize embeddings
scaler = StandardScaler()
X_embeddings = scaler.fit_transform(X_embeddings)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X_embeddings, y, test_size=0.2, random_state=42)

# GridSearchCV for RandomForest
param_grid_rf = {
    "estimator__n_estimators": [100, 200, 300],
    "estimator__max_depth": [5, 10, 15],
    "estimator__min_samples_split": [2, 5, 10],
}

grid_search_rf = GridSearchCV(
    MultiOutputRegressor(RandomForestRegressor(random_state=42)),
    param_grid_rf,
    scoring="neg_mean_squared_error",
    cv=3,
    n_jobs=-1,
    verbose=2
)



grid_search_rf.fit(X_train, y_train)
best_rf = grid_search_rf.best_estimator_
print("Best RF Parameters:", grid_search_rf.best_params_)

# GridSearchCV for GradientBoosting
param_grid_gb = {
    "estimator__n_estimators": [100, 200, 300],
    "estimator__max_depth": [3, 5, 7],
    "estimator__learning_rate": [0.01, 0.05, 0.1],
}

grid_search_gb = GridSearchCV(
    MultiOutputRegressor(GradientBoostingRegressor(random_state=42)),
    param_grid_gb,
    scoring="neg_mean_squared_error",
    cv=3,

    n_jobs=-1,
    verbose=2
)

grid_search_gb.fit(X_train, y_train)
best_gb = grid_search_gb.best_estimator_
print("Best GB Parameters:", grid_search_gb.best_params_)

# Define MLP and Ridge models
mlp = MultiOutputRegressor(MLPRegressor(hidden_layer_sizes=(256, 128), activation='relu', max_iter=1000, learning_rate_init=0.001, early_stopping=True, random_state=42))
ridge = MultiOutputRegressor(Ridge(alpha=0.1))

# Train models
mlp.fit(X_train, y_train)
ridge.fit(X_train, y_train)

# Predictions
rf_pred = best_rf.predict(X_test)
gb_pred = best_gb.predict(X_test)
mlp_pred = mlp.predict(X_test)
ridge_pred = ridge.predict(X_test)

# Weighted ensemble
final_pred = (0.35 * rf_pred) + (0.3 * gb_pred) + (0.2 * mlp_pred) + (0.15 * ridge_pred)

# Model evaluation
mse = mean_squared_error(y_test, final_pred)
mae = mean_absolute_error(y_test, final_pred)
r2 = r2_score(y_test, final_pred)

print("\nModel Evaluation:")
print(f"Mean Squared Error (MSE): {mse:.4f}")
print(f"Mean Absolute Error (MAE): {mae:.4f}")
print(f"R² Score: {r2:.4f}")

# Residual Analysis
residuals = y_test - final_pred
print("\nResidual Analysis:")
print(f"Mean Residual Error: {np.mean(residuals):.4f}")
print(f"Standard Deviation of Residuals: {np.std(residuals):.4f}")

# Predict for user input
user_response = input("\nEnter your response: ")
user_embedding = np.array(embedding_model.encode([user_response]))
user_embedding = user_embedding / np.linalg.norm(user_embedding, axis=1, keepdims=True)
user_embedding = scaler.transform(user_embedding)

rf_pred_user = best_rf.predict(user_embedding)
gb_pred_user = best_gb.predict(user_embedding)
mlp_pred_user = mlp.predict(user_embedding)
ridge_pred_user = ridge.predict(user_embedding)

user_pred = (0.35 * rf_pred_user) + (0.3 * gb_pred_user) + (0.2 * mlp_pred_user) + (0.15 * ridge_pred_user)
rounded_predictions = np.round(user_pred[0]).astype(int)

print("\nPredicted Scores:")
print(f"Creativity: {rounded_predictions[0]}")
print(f"Critical Thinking: {rounded_predictions[1]}")
print(f"Observation: {rounded_predictions[2]}")
print(f"Curiosity: {rounded_predictions[3]}")
print(f"Problem Solving: {rounded_predictions[4]}")

from flask import Flask, request, jsonify
import torch
from transformers import BertTokenizer, BertModel
from flask_cors import CORS
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.linear_model import RidgeCV
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.multioutput import MultiOutputRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import os
import json


app = Flask(__name__)
# CORS(app, origins=["http://localhost:3001"])
CORS(app, origins=["*"])

# Paths for saved models
rf_path = "rf_model.pkl"
gb_path = "gb_model.pkl"
mlp_path = "mlp_model.pkl"
meta_path = "meta_model.pkl"
scaler_path = "scaler.pkl"

# Load BERT model and tokenizer
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
bert_model = BertModel.from_pretrained('bert-base-uncased').to(device)
bert_tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

def encode_with_bert(texts):
    bert_model.eval()
    embeddings = []
    with torch.no_grad():
        for text in texts:
            inputs = bert_tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
            inputs = {k: v.to(device) for k, v in inputs.items()}
            outputs = bert_model(**inputs)
            cls_embedding = outputs.last_hidden_state[:, 0, :].squeeze().cpu().numpy()
            embeddings.append(cls_embedding)
    return np.array(embeddings)

# Load or Train Models
if all(os.path.exists(path) for path in [rf_path, gb_path, mlp_path, meta_path, scaler_path]):
    print("Loading saved models...")
    rf = joblib.load(rf_path)
    gb = joblib.load(gb_path)
    mlp = joblib.load(mlp_path)
    meta_model = joblib.load(meta_path)
    scaler = joblib.load(scaler_path)
else:
    print("Training models from scratch...")

    # Load your dataset
    with open("tester.json", "r") as f:
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
        print("Error: No valid data found in dataset!")
        exit()

    X_embeddings = encode_with_bert(X)
    y = np.array(y)

    scaler = StandardScaler()
    X_embeddings = scaler.fit_transform(X_embeddings)
    joblib.dump(scaler, scaler_path)

    X_train, X_test, y_train, y_test = train_test_split(X_embeddings, y, test_size=0.2, random_state=42)

    # Random Forest
    rf = MultiOutputRegressor(RandomForestRegressor(random_state=42))
    rf_params = {
        "estimator__n_estimators": [200, 300, 500, 700],
        "estimator__max_depth": [10, 20, 30, None],
        "estimator__min_samples_split": [2, 5, 10]
    }
    rf_cv = RandomizedSearchCV(rf, rf_params, n_iter=10, cv=3, verbose=1, n_jobs=-1)
    rf = rf_cv.fit(X_train, y_train).best_estimator_
    joblib.dump(rf, rf_path)

    # Gradient Boosting
    gb = MultiOutputRegressor(GradientBoostingRegressor(random_state=42))
    gb_params = {
        "estimator__n_estimators": [300, 500],
        "estimator__learning_rate": [0.03, 0.05],
        "estimator__max_depth": [3, 5, 7]
    }
    gb_cv = RandomizedSearchCV(gb, gb_params, n_iter=5, cv=3, verbose=1, n_jobs=-1)
    gb = gb_cv.fit(X_train, y_train).best_estimator_
    joblib.dump(gb, gb_path)

    # MLP Regressor
    mlp = MultiOutputRegressor(MLPRegressor(max_iter=1000, early_stopping=True, random_state=42, solver='adam'))
    mlp_params = {
        "estimator__hidden_layer_sizes": [(128, 64), (256, 128)],
        "estimator__learning_rate_init": [0.001, 0.0005]
    }
    mlp_cv = RandomizedSearchCV(mlp, mlp_params, n_iter=5, cv=3, verbose=1, n_jobs=-1)
    mlp = mlp_cv.fit(X_train, y_train).best_estimator_
    joblib.dump(mlp, mlp_path)

    # Meta-model RidgeCV
    meta_model = RidgeCV()

    for model in [rf, gb, mlp]:
        model.fit(X_train, y_train)

    base_preds_train = np.column_stack([
        rf.predict(X_train),
        gb.predict(X_train),
        mlp.predict(X_train)
    ])

    meta_model.fit(base_preds_train, y_train)
    joblib.dump(meta_model, meta_path)


    # Training data for future performance prediction
X_train_fp = np.array([
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

y_train_fp = np.array([
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

# Train future performance model
base_model_fp = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
future_perf_model = MultiOutputRegressor(base_model_fp)
future_perf_model.fit(X_train_fp, y_train_fp)

# Prediction logic
def predict_future_performance(student_scores_so_far, model=future_perf_model, threshold=65):
    student_array = np.array(student_scores_so_far).reshape(1, -1)
    predicted_scores = model.predict(student_array).flatten()
    predicted_scores = np.clip(predicted_scores, 0, 100)
    average_future_score = np.mean(predicted_scores)
    warning = bool(average_future_score < threshold)
    return {
        "predicted_scores": predicted_scores.tolist(),
        "average_future_score": average_future_score,
        "warning": warning
    }


# Prediction Endpoint
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    
    # Check if we're getting a string or an array of responses
    if isinstance(data, dict) and 'responses' in data:
        responses = data.get('responses', [])
    else:
        # Handle case where input might be direct text
        responses = [data] if isinstance(data, str) else data
    
    if not responses:
        return jsonify({"error": "No responses provided."}), 400
    
    # Ensure responses is a list
    if isinstance(responses, str):
        responses = [responses]
    
    # Process each response as a complete entity
    X_input = encode_with_bert(responses)
    X_input = scaler.transform(X_input)

    base_preds = np.column_stack([
        rf.predict(X_input),
        gb.predict(X_input),
        mlp.predict(X_input)
    ])

    final_preds = meta_model.predict(base_preds)

    # Format output with snake_case keys to match frontend expectations and round values to integers
    output = []
    for i, response in enumerate(responses):
        pred = final_preds[i]

        output.append({
            "creativity": round(float(pred[0])),
            "critical_thinking": round(float(pred[1])),
            "observation": round(float(pred[2])),
            "curiosity": round(float(pred[3])),
            "problem_solving": round(float(pred[4]))
        })
    
    # If there's only one response, return just that result instead of a list
    if len(output) == 1:
        return jsonify(output[0])
    return jsonify(output)

@app.route('/predict-future-performance', methods=['POST'])
def future_performance():
    data = request.get_json()
    
    if not data or "scores" not in data:
        return jsonify({"error": "Missing 'scores' in request body."}), 400

    student_scores = data["scores"]
    
    if not isinstance(student_scores, list) or len(student_scores) != 2:
        return jsonify({"error": "Expected a list of two numbers representing past scores."}), 400

    result = predict_future_performance(student_scores)
    return jsonify(result)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', debug=False, port=port)
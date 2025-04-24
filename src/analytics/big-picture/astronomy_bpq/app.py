import json
import numpy as np
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import BertTokenizer, BertModel
from sklearn.preprocessing import StandardScaler
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.linear_model import RidgeCV

# Initialize Flask app
app = Flask(__name__)
# CORS(app)
# CORS(app, resources={r"/*": {"origins": "http://localhost:3001"}})
CORS(app, origins=["http://localhost:3001"])


tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
bert_model = BertModel.from_pretrained("bert-base-uncased")

def encode_with_bert(texts):
    """Encodes text responses into embeddings using BERT."""
    inputs = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
    with torch.no_grad():
        outputs = bert_model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).numpy()

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
    print("Error: No valid data found! Check JSON structure.")
    exit()

X_embeddings = encode_with_bert(X)
y = np.array(y)

scaler = StandardScaler()
X_embeddings = scaler.fit_transform(X_embeddings)

# Split data
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X_embeddings, y, test_size=0.2, random_state=42)

rf = MultiOutputRegressor(RandomForestRegressor(random_state=42))
rf.fit(X_train, y_train)

gb = MultiOutputRegressor(GradientBoostingRegressor(random_state=42))
gb.fit(X_train, y_train)

mlp = MultiOutputRegressor(MLPRegressor(max_iter=1000, early_stopping=True, random_state=42))
mlp.fit(X_train, y_train)

# Train meta model
meta_model = RidgeCV()
base_preds_train = np.column_stack([rf.predict(X_train), gb.predict(X_train), mlp.predict(X_train)])
meta_model.fit(base_preds_train, y_train)

@app.route("/predict", methods=["POST"])
def predict():
    # Get the user input from the request
    user_data = request.get_json()

    if "response" not in user_data:
        return jsonify({"error": "No response field in the input data"}), 400
    
    user_response = user_data.get('response', '')

    if not user_response:
        return jsonify({"error": "Empty response provided"}), 400

    print(f"User Response: {user_response}")

    # Encode the response using BERT
    user_embedding = encode_with_bert([user_response])
    print(f"User Embedding: {user_embedding}")

    user_embedding = scaler.transform(user_embedding)

    # Make predictions using the trained models
    base_preds_user = np.column_stack([
        rf.predict(user_embedding),
        gb.predict(user_embedding),
        mlp.predict(user_embedding)
    ])

    print(f"Base Predictions: {base_preds_user}")

    user_pred = meta_model.predict(base_preds_user)

    print(f"Meta Model Prediction: {user_pred}")

    # Round predictions
    # rounded_predictions = np.round(user_pred[0]).astype(int)
    rounded_predictions = [int(x) for x in np.round(user_pred[0])]


    # Return the predicted scores as a JSON response
    response = {
        "Creativity": rounded_predictions[0],
        "Critical Thinking": rounded_predictions[1],
        "Observation": rounded_predictions[2],
        "Curiosity": rounded_predictions[3],
        "Problem Solving": rounded_predictions[4]
    }

    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True, port=5000)

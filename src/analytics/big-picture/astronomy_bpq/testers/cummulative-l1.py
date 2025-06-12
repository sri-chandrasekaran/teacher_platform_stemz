
import json
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neural_network import MLPRegressor
from catboost import CatBoostRegressor
from sklearn.metrics import mean_squared_error
from imblearn.over_sampling import SMOTE
import shap

# Load the data
with open('lesson1.json') as f:
    data = json.load(f)

X_features = []
y_Creativity, y_Critical_Thinking, y_Observation, y_Curiosity, y_Problem_Solving = [], [], [], [], []

for question in data['questions']:
    for response in question['responses']:
        X_features.append([len(response['response'])])
        
        scores = response.get('scores', {})
        
        y_Creativity.append(scores.get('Creativity', 0))
        y_Critical_Thinking.append(scores.get('Critical Thinking', 0))
        y_Observation.append(scores.get('Observation', 0))
        y_Curiosity.append(scores.get('Curiosity', 0))
        y_Problem_Solving.append(scores.get('Problem Solving', 0))

X_features = np.array(X_features)

smote = SMOTE(sampling_strategy='auto', k_neighbors=3)

X_resampled_Creativity, y_resampled_Creativity = smote.fit_resample(X_features, y_Creativity)
X_resampled_Critical_Thinking, y_resampled_Critical_Thinking = smote.fit_resample(X_features, y_Critical_Thinking)
X_resampled_Observation, y_resampled_Observation = smote.fit_resample(X_features, y_Observation)
X_resampled_Curiosity, y_resampled_Curiosity = smote.fit_resample(X_features, y_Curiosity)
X_resampled_Problem_Solving, y_resampled_Problem_Solving = smote.fit_resample(X_features, y_Problem_Solving)

metrics = {
    'Creativity': (X_resampled_Creativity, y_resampled_Creativity),
    'Critical Thinking': (X_resampled_Critical_Thinking, y_resampled_Critical_Thinking),
    'Observation': (X_resampled_Observation, y_resampled_Observation),
    'Curiosity': (X_resampled_Curiosity, y_resampled_Curiosity),
    'Problem Solving': (X_resampled_Problem_Solving, y_resampled_Problem_Solving)
}

models = {
    'rf': RandomForestRegressor(n_estimators=100),
    'gb': GradientBoostingRegressor(n_estimators=100),
    'catboost': CatBoostRegressor(verbose=0),
    # 'mlp': MLPRegressor(hidden_layer_sizes=(100,), max_iter=1000)
}

def train_and_predict(X, y, model_name, metric_name):
    model = models[model_name]
    model.fit(X, y)
    predictions = model.predict(X)
    mse = mean_squared_error(y, predictions)
    print(f"{model_name} MSE for {metric_name}: {mse}")
    return predictions, mse

mse_results = {}
predictions_results = {}

for metric_name, (X_resampled, y_resampled) in metrics.items():
    print(f"\n=== Processing Metric: {metric_name} ===")
    
    cumulative_predictions = np.zeros(len(X_resampled))
    mse_list = []
    
    for model_name in models:
        print(f"\nTraining {model_name} model for {metric_name} metric...")
        
        predictions, mse = train_and_predict(X_resampled, y_resampled, model_name, metric_name)
        cumulative_predictions += predictions 
        mse_list.append(mse)
    
    weighted_predictions = cumulative_predictions / len(models)
    
    cumulative_mse = mean_squared_error(y_resampled, weighted_predictions)
    print(f"Cumulative MSE for {metric_name}: {cumulative_mse}")
    
    mse_results[metric_name] = {
        'cumulative_mse': cumulative_mse,
        'individual_mse': mse_list
    }
    predictions_results[metric_name] = weighted_predictions

print("\nCumulative MSE Results for All Metrics:")
for metric, result in mse_results.items():
    print(f"{metric}: {result['cumulative_mse']}")

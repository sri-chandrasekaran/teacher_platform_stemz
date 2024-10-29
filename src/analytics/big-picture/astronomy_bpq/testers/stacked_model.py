import json
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import StackingRegressor, RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

# Load the data
with open('lesson1.json') as f:
    data = json.load(f)

# Prepare the dataset
responses = data['questions'][0]['responses']

# Uncomment to print responses and check their structure
# print(responses)

# Extract scores for each metric with a fallback to 0 for missing keys
y_Creativity = [r.get('Creativity', 0) for r in responses]
y_Critical_Thinking = [r.get('Critical Thinking', 0) for r in responses]
y_Observation = [r.get('Observation', 0) for r in responses]
y_Curiosity = [r.get('Curiosity', 0) for r in responses]
y_Problem_Solving = [r.get('Problem Solving', 0) for r in responses]

# Create features (example: length of response)
X_features = np.array([[len(resp['response'])] for resp in responses])  # You can add more features here

# Split the data into training and testing sets for each metric
X_train, X_test, y_train_Creativity, y_test_Creativity = train_test_split(X_features, y_Creativity, test_size=0.2, random_state=42)
X_train, X_test, y_train_Critical_Thinking, y_test_Critical_Thinking = train_test_split(X_features, y_Critical_Thinking, test_size=0.2, random_state=42)
X_train, X_test, y_train_Observation, y_test_Observation = train_test_split(X_features, y_Observation, test_size=0.2, random_state=42)
X_train, X_test, y_train_Curiosity, y_test_Curiosity = train_test_split(X_features, y_Curiosity, test_size=0.2, random_state=42)
X_train, X_test, y_train_Problem_Solving, y_test_Problem_Solving = train_test_split(X_features, y_Problem_Solving, test_size=0.2, random_state=42)

# Initialize base models
base_models = [
    ('rf', RandomForestRegressor(n_estimators=100)),
    ('gb', GradientBoostingRegressor(n_estimators=100))
]

# Function to train and predict using stacking
def train_and_predict(metric_name, X_train, y_train, X_test, y_test):
    stacking_model = StackingRegressor(estimators=base_models, final_estimator=LinearRegression())
    stacking_model.fit(X_train, y_train)
    predictions = stacking_model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    print(f'MSE {metric_name} (Stacking): {mse}')

# Train and evaluate models for each metric
train_and_predict('Creativity', X_train, y_train_Creativity, X_test, y_test_Creativity)
train_and_predict('Critical Thinking', X_train, y_train_Critical_Thinking, X_test, y_test_Critical_Thinking)
train_and_predict('Observation', X_train, y_train_Observation, X_test, y_test_Observation)
train_and_predict('Curiosity', X_train, y_train_Curiosity, X_test, y_test_Curiosity)
train_and_predict('Problem Solving', X_train, y_train_Problem_Solving, X_test, y_test_Problem_Solving)

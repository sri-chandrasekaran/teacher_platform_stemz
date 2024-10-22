# import json
# import pandas as pd
# from sklearn.model_selection import train_test_split
# from sklearn.ensemble import RandomForestRegressor
# from sklearn.metrics import mean_squared_error
# import joblib

# # Load data from JSON file
# with open('q1.json', 'r') as f:
#     data = json.load(f)

# # Initialize lists to store the processed data
# responses_list = []
# Creativity_scores = []
# Critical Thinking_scores = []
# Observation_scores = []
# Curiosity_scores = []
# problem_solving_scores = []

# # Process each response
# for question in data['questions']:
#     for response in question['responses']:
#         responses_list.append(response['response'])  # Get the response text
#         Creativity_scores.append(response.get('Creativity', None))  # Use .get() to avoid KeyError
#         Critical Thinking_scores.append(response.get('Critical Thinking', None))
#         Observation_scores.append(response.get('Observation', None))
#         Curiosity_scores.append(response.get('Curiosity', None))
#         problem_solving_scores.append(response.get('Problem Solving', None))

# # Create a DataFrame from the collected data
# df = pd.DataFrame({
#     'Response': responses_list,
#     'Creativity': Creativity_scores,
#     'Critical Thinking': Critical Thinking_scores,
#     'Observation': Observation_scores,
#     'Curiosity': Curiosity_scores,
#     'Problem Solving': problem_solving_scores
# })

# # Drop rows with NaN values
# df.dropna(inplace=True)

# # Define features and target variables
# X = df['Response']
# y = df[['Creativity', 'Critical Thinking', 'Observation', 'Curiosity', 'Problem Solving']]

# # Convert responses to numerical features using one-hot encoding or TF-IDF
# # For simplicity, let's use a basic approach here
# X_encoded = pd.get_dummies(X)

# # Split data into training and testing sets
# X_train, X_test, y_train, y_test = train_test_split(X_encoded, y, test_size=0.2, random_state=42)

# # Initialize and train the Random Forest model for each metric
# model_Creativity = RandomForestRegressor()
# model_Creativity.fit(X_train, y_train['Creativity'])

# model_Critical Thinking = RandomForestRegressor()
# model_Critical Thinking.fit(X_train, y_train['Critical Thinking'])

# model_Observation = RandomForestRegressor()
# model_Observation.fit(X_train, y_train['Observation'])

# model_Curiosity = RandomForestRegressor()
# model_Curiosity.fit(X_train, y_train['Curiosity'])

# model_problem_solving = RandomForestRegressor()
# model_problem_solving.fit(X_train, y_train['Problem Solving'])

# # Make predictions
# predictions_Creativity = model_Creativity.predict(X_test)
# predictions_Critical Thinking = model_Critical Thinking.predict(X_test)
# predictions_Observation = model_Observation.predict(X_test)
# predictions_Curiosity = model_Curiosity.predict(X_test)
# predictions_problem_solving = model_problem_solving.predict(X_test)

# # Evaluate the models
# mse_Creativity = mean_squared_error(y_test['Creativity'], predictions_Creativity)
# mse_Critical Thinking = mean_squared_error(y_test['Critical Thinking'], predictions_Critical Thinking)
# mse_Observation = mean_squared_error(y_test['Observation'], predictions_Observation)
# mse_Curiosity = mean_squared_error(y_test['Curiosity'], predictions_Curiosity)
# mse_problem_solving = mean_squared_error(y_test['Problem Solving'], predictions_problem_solving)

# print(f'MSECreativity: {mse_Creativity}')
# print(f'MSE Critical Thinking: {mse_Critical Thinking}')
# print(f'MSE Observation: {mse_Observation}')
# print(f'MSE Curiosity: {mse_Curiosity}')
# print(f'MSE Problem Solving: {mse_problem_solving}')

# # Save the trained models
# joblib.dump(model_Creativity, 'model_Creativity.pkl')
# joblib.dump(model_Critical Thinking, 'model_Critical Thinking.pkl')
# joblib.dump(model_Observation, 'model_Observation.pkl')
# joblib.dump(model_Curiosity, 'model_Curiosity.pkl')
# joblib.dump(model_problem_solving, 'model_problem_solving.pkl')

import json
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split

# Load the data
with open('lesson1.json') as f:
    data = json.load(f)

# Function to safely get scores or set a default value (e.g., 0)
def get_score(response, metric):
    return response.get(metric, 0)  # Default to 0 if key doesn't exist

# Extract features and labels
responses = [r['response'] for r in data['questions'][0]['responses']]
Creativity_scores = [get_score(r, 'Creativity') for r in data['questions'][0]['responses']]
Critical_Thinking_scores = [get_score(r, 'Critical Thinking') for r in data['questions'][0]['responses']]
Observation_scores = [get_score(r, 'Observation') for r in data['questions'][0]['responses']]
Curiosity_scores = [get_score(r, 'Curiosity') for r in data['questions'][0]['responses']]
problem_solving_scores = [get_score(r, 'Problem Solving') for r in data['questions'][0]['responses']]

# Convert responses to features using TF-IDF
from sklearn.feature_extraction.text import TfidfVectorizer
vectorizer = TfidfVectorizer(max_features=100)  # Limiting to top 100 features for simplicity
X = vectorizer.fit_transform(responses).toarray()

# Function to train and evaluate model for each target score
def train_and_evaluate_model(y, score_name):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Define the model and the parameters for tuning
    model = RandomForestRegressor(random_state=42)
    param_grid = {
        'n_estimators': [50, 100, 200],        
        'max_depth': [10, 20, 30, None],      
        'min_samples_leaf': [1, 2, 4]         
    }

    # Use GridSearchCV to find the best parameters
    grid_search = GridSearchCV(estimator=model, param_grid=param_grid, cv=5, n_jobs=-1, verbose=2)
    grid_search.fit(X_train, y_train)

    # Get the best model
    best_model = grid_search.best_estimator_

    # Make predictions and evaluate
    y_pred = best_model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    print(f'Best Params for {score_name}:', grid_search.best_params_)
    print(f'MSE {score_name}:', mse)

# Run for each score
train_and_evaluate_model(Creativity_scores, "Creativity")
train_and_evaluate_model(Critical_Thinking_scores, "Critical Thinking")
train_and_evaluate_model(Observation_scores, "Observation")
train_and_evaluate_model(Curiosity_scores, "Curiosity")
train_and_evaluate_model(problem_solving_scores, "Problem Solving")

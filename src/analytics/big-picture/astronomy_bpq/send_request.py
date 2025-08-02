import requests

# URL of the Flask app
url = "http://127.0.0.1:5000/predict"

# Data to send in the request
data = {
    "response": "Stars help us understand the nature of the universe and its origin."
}

# Send the POST request
response = requests.post(url, json=data)

# Print the response (predictions)
# print(response.json())

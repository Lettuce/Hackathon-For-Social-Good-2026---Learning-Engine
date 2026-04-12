import requests
import json

with open('test.json', 'r') as file:
    data = json.load(file)

# response = requests.post('http://localhost:5500/api/createuser', json=data)
response = requests.post('http://localhost:5500/api/submitanswers', json=data)

print(response.status_code)
print(response.text)
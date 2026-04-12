import requests
import json

with open('test.json', 'r') as file:
    data = json.load(file)

def postAPI(endpoint: str):
    return requests.post('http://localhost:5500/api/' + endpoint, json=data)


# response = requests.post('http://localhost:5500/api/createuser', json=data)
# response = requests.post('http://localhost:5500/api/submitanswers', json=data)
response = postAPI('answeredquestions')

print(response.status_code)
print(response.text)
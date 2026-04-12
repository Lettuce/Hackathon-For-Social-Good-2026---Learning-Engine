import requests
import json

with open('test.json', 'r') as file:
    data = json.load(file)

def postAPI(endpoint: str):
    return requests.post('http://localhost:5500/api/' + endpoint, json=data)


# response = postAPI('answeredquestions')
# response = postAPI('createuser')
response = postAPI('submitanswers')

print(response.status_code)
print(response.text)
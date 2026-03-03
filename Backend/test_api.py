import requests
import json

# Test the mark_complete endpoint
url = "http://127.0.0.1:8000/api/video/lessons/1/mark_complete/"

print("Testing mark_complete endpoint...")
print(f"URL: {url}\n")

try:
    response = requests.post(url, headers={
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
    })
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:500]}\n")
    
    print("Response Headers:")
    print(f"  Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'NOT SET')}")
    print(f"  Access-Control-Allow-Credentials: {response.headers.get('Access-Control-Allow-Credentials', 'NOT SET')}")
    print(f"  Content-Type: {response.headers.get('Content-Type', 'NOT SET')}")
    print(f"  Vary: {response.headers.get('Vary', 'NOT SET')}")
    
except Exception as e:
    print(f"Error: {e}")

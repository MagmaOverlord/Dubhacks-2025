import time
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import requests

app = Flask(__name__)
CORS(app)
FOOD_DATA_KEY = "ObAd8jFsex3BZhX7HtE4Ax4KApFezjSkymZdLSH9" #Replace with actual key


@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/api/getfood')
def get_food_info():
  print('DEBUG: Requested barcode data')

  #check in our database if we have the barcode logged


  #else, query the api
  query = request.args.get('barcode', 'N/A')
  page = '1'
  if query == 'N/A':
    query = request.args.get('search', 'N/A')
    page = request.args.get('page', '1')

  try:
    response = requests.get(f'https://api.nal.usda.gov/fdc/v1/foods/search?query={ query }&pageSize=50&pageNumber={ page }&api_key={ FOOD_DATA_KEY }')
    # Raises an HTTPError if the HTTP request returned an unsuccessful status code
    response.raise_for_status()
    data = response.json()
  except requests.exceptions.HTTPError as http_err:
    print(f'DEBUG: HTTP error: {http_err}')
    return jsonify({'error': f'HTTP error occurred: {http_err}'}), 500
  except Exception as err:
    print(f'DEBUG: Other error: {err}')
    return jsonify({'error': f'Other error occurred: {err}'}), 500

  print(f'DEBUG: Sending response {data}')
  return data

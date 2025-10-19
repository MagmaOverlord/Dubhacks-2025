from flask import Flask, jsonify, request
import boto3, json

import time
from flask import Flask, jsonify, request
import requests
import boto3, json

app = Flask(__name__)
FOOD_DATA_KEY = "DEMO_KEY" #Replace with actual key


@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/api/getfood')
def get_food_info():
  print('DEBUG: Requested barcode data')
  query = request.args.get('barcode', 'N/A')
  if query == 'N/A':
    query = request.args.get('search', 'N/A')
    page = request.args.get('page', '1')

  try:
    response = requests.get(f'https://api.nal.usda.gov/fdc/v1/foods/search?query={ query }&pageSize=50&pageNumber={ page }&api_key={ FOOD_DATA_KEY }')
    # Raises an HTTPError if the HTTP request returned an unsuccessful status code
    response.raise_for_status()
    data = response.json()
  except requests.exceptions.HTTPError as http_err:
    return jsonify({'error': f'HTTP error occurred: {http_err}'}), 500
  except Exception as err:
    return jsonify({'error': f'Other error occurred: {err}'}), 500

  print(f'DEBUG: Sending response {data}')
  return data

s3 = boto3.client('s3')
BUCKET_NAME = 'userfridge'

def get_user_key(user_id):
    return f"{user_id}.json"

def load_data_from_s3(user_id):
    key = get_user_key(user_id)
    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=key)
        return json.loads(response['Body'].read())
    except s3.exceptions.NoSuchKey:
        return {"items": []}

def save_data_to_s3(user_id, data):
    key = get_user_key(user_id)
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=json.dumps(data),
        ContentType='application/json'
    )

# ------------------- ROUTES -------------------

@app.route('/init', methods=['POST'])
def init_user():
    """Initialize a user with a provided userID and optional list of items."""
    body = request.json or {}
    user_id = body.get("user_id")
    items = body.get("items", [])

    if not user_id:
        return jsonify({"message": "user_id is required"}), 400

    data = {"user_id": user_id, "items": []}

    for i, item in enumerate(items, start=1):
        # Validate essential fields
        if "name" in item and "expiration_date" in item:
            data["items"].append({
                "id": i,
                "name": item.get("name"),
                "expiration_date": item.get("expiration_date"),
                "nutritionfact": item.get("nutritionfact", ""),
                "quantities": item.get("quantities", 0),
                "serving_count": item.get("serving_count", 0),
                "serving_size": item.get("serving_size", "")
            })

    save_data_to_s3(user_id, data)
    return jsonify({"message": "User initialized", "user_id": user_id, "data": data}), 201


@app.route('/items/<string:user_id>', methods=['GET'])
def get_items(user_id):
    """Retrieve all items for a user."""
    data = load_data_from_s3(user_id)
    return jsonify(data)


@app.route('/items/<string:user_id>/<int:item_id>', methods=['GET'])
def get_item(user_id, item_id):
    """Retrieve a single item for a user by ID."""
    data = load_data_from_s3(user_id)
    item = next((item for item in data['items'] if item['id'] == item_id), None)
    if item:
        return jsonify(item)
    return jsonify({"message": "Item not found"}), 404


@app.route('/items/<string:user_id>', methods=['POST'])
def add_item(user_id):
    """Add an item to the user's fridge."""
    new_item = request.json
    data = load_data_from_s3(user_id)

    if new_item and 'name' in new_item and 'expiration_date' in new_item:
        new_item['id'] = len(data['items']) + 1
        new_item['nutritionfact'] = new_item.get("nutritionfact", "")
        new_item['quantities'] = new_item.get("quantities", 0)
        new_item['serving_count'] = new_item.get("serving_count", 0)
        new_item['serving_size'] = new_item.get("serving_size", "")

        data['items'].append(new_item)
        save_data_to_s3(user_id, data)
        return jsonify(new_item), 201
    return jsonify({"message": "Invalid item data"}), 400


if __name__ == '__main__':
    app.run(debug=True)

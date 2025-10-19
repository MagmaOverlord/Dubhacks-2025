# 🧊 Fridge API Documentation

**Base URL:**  


All endpoints are JSON-based (`Content-Type: application/json`).

---

## 🧍 User Management

### **POST /init**
Initialize a new user’s fridge.

**Request Body:**
```json
{
  "user_id": "QKHWunS12TSWzLG9YIFAm9HBEN12",
  "items": [
    {
      "name": "Milk",
      "expiration_date": "2025-10-25",
      "nutritionfact": "High in calcium",
      "quantities": 1,
      "serving_count": 4,
      "serving_size": "1 cup"
    },
    {
      "name": "Eggs",
      "expiration_date": "2025-10-30",
      "nutritionfact": "Rich in protein",
      "quantities": 12,
      "serving_count": 6,
      "serving_size": "2 eggs"
    }
  ]
}
```
Response:
```json
{
  "message": "User initialized",
  "user_id": "QKHWunS12TSWzLG9YIFAm9HBEN12",
  "data": {
    "user_id": "QKHWunS12TSWzLG9YIFAm9HBEN12",
    "items": [
      {
        "id": 1,
        "name": "Milk",
        "expiration_date": "2025-10-25",
        "nutritionfact": "High in calcium",
        "quantities": 1,
        "serving_count": 4,
        "serving_size": "1 cup"
      },
      {
        "id": 2,
        "name": "Eggs",
        "expiration_date": "2025-10-30",
        "nutritionfact": "Rich in protein",
        "quantities": 12,
        "serving_count": 6,
        "serving_size": "2 eggs"
      }
    ]
  }
}
```
Notes:

 - If the user already exists, this will overwrite their fridge.
 - Each user’s data is saved in S3 as <user_id>.json.

🍎 Item Management
GET /items/{user_id}

Retrieve all items in a user’s fridge.

Example:
````
GET /items/QKHWunS12TSWzLG9YIFAm9HBEN12

````
Response:
````
{
  "user_id": "QKHWunS12TSWzLG9YIFAm9HBEN12",
  "items": [
    {
      "id": 1,
      "name": "Milk",
      "expiration_date": "2025-10-25",
      "nutritionfact": "High in calcium",
      "quantities": 1,
      "serving_count": 4,
      "serving_size": "1 cup"
    },
    {
      "id": 2,
      "name": "Eggs",
      "expiration_date": "2025-10-30",
      "nutritionfact": "Rich in protein",
      "quantities": 12,
      "serving_count": 6,
      "serving_size": "2 eggs"
    }
  ]
}
````
GET /items/{user_id}/{item_id}

Retrieve a single item by its ID.

Example:
````
GET /items/QKHWunS12TSWzLG9YIFAm9HBEN12/2
````
Response:
````
{
  "id": 2,
  "name": "Eggs",
  "expiration_date": "2025-10-30",
  "nutritionfact": "Rich in protein",
  "quantities": 12,
  "serving_count": 6,
  "serving_size": "2 eggs"
}
````
Error Response:
````
{ "message": "Item not found" }
````
POST /items/{user_id}

Add a new item to the user’s fridge.

Example:
````
POST /items/QKHWunS12TSWzLG9YIFAm9HBEN12
````
Request Body:
````
{
  "name": "Orange Juice",
  "expiration_date": "2025-11-10",
  "nutritionfact": "Vitamin C",
  "quantities": 2,
  "serving_count": 8,
  "serving_size": "250ml glass"
}
````
Response:
````
{
  "id": 3,
  "name": "Orange Juice",
  "expiration_date": "2025-11-10",
  "nutritionfact": "Vitamin C",
  "quantities": 2,
  "serving_count": 8,
  "serving_size": "250ml glass"
}
````
⚙️ Data Structure (Stored in S3)

Each user’s fridge data is saved as a JSON file:
````
user_id.json
````
Example content:
````
{
  "user_id": "QKHWunS12TSWzLG9YIFAm9HBEN12",
  "items": [
    {
      "id": 1,
      "name": "Milk",
      "expiration_date": "2025-10-25",
      "nutritionfact": "High in calcium",
      "quantities": 1,
      "serving_count": 4,
      "serving_size": "1 cup"
    }
  ]
}
````




# NovaSync API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "contact": "1234567890",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "message": "User registered successfully"
}
```

**Errors:**
- `400` - Missing fields or username already exists

---

### Login
**POST** `/auth/login`

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "johndoe",
  "name": "John Doe"
}
```

**Errors:**
- `400` - Invalid credentials

---

### Get Profile
**GET** `/auth/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "name": "John Doe",
  "bio": "Software developer",
  "avatar": "😊"
}
```

---

### Update Profile
**PUT** `/auth/profile`

Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "bio": "Full-stack developer",
  "avatar": "🚀"
}
```

**Response (200):**
```json
{
  "message": "Profile updated",
  "user": {
    "name": "John Doe",
    "bio": "Full-stack developer",
    "avatar": "🚀"
  }
}
```

---

## Group Endpoints

### Get My Groups
**GET** `/groups/my`

Get all groups the authenticated user is a member of.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Trip to Goa",
    "description": "Beach vacation expenses",
    "createdBy": "507f191e810c19729de860ea",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Create Group
**POST** `/groups/create`

Create a new group.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Trip to Goa",
  "description": "Beach vacation expenses"
}
```

**Response (200):**
```json
{
  "group": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Trip to Goa",
    "description": "Beach vacation expenses",
    "createdBy": "507f191e810c19729de860ea"
  }
}
```

---

### Get Group Details
**GET** `/groups/:id`

Get detailed information about a specific group.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "group": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Trip to Goa",
    "description": "Beach vacation expenses",
    "createdBy": "507f191e810c19729de860ea"
  },
  "members": [
    {
      "id": "507f191e810c19729de860ea",
      "name": "John Doe",
      "username": "johndoe"
    }
  ]
}
```

---

### Add Member to Group
**POST** `/groups/add-member`

Add a member to a group.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "groupId": "507f1f77bcf86cd799439011",
  "username": "janedoe"
}
```

**Response (200):**
```json
{
  "message": "Member added"
}
```

**Errors:**
- `404` - User not found
- `400` - User already in group

---

### Remove Member from Group
**DELETE** `/groups/:groupId/members/:userId`

Remove a member from a group (creator only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Member removed"
}
```

**Errors:**
- `403` - Only group creator can remove members
- `400` - Cannot remove yourself (use leave endpoint)

---

### Leave Group
**POST** `/groups/:groupId/leave`

Leave a group you're a member of.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "You left the group"
}
```

---

## Expense Endpoints

### Add Expense
**POST** `/expenses/add`

Create a new expense in a group.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (Equal Split - Default):**
```json
{
  "description": "Dinner at restaurant",
  "amount": 1200,
  "groupId": "507f1f77bcf86cd799439011",
  "category": "Food",
  "isRecurring": false
}
```

**Request Body (Exact Amounts):**
```json
{
  "description": "Dinner at restaurant",
  "amount": 1200,
  "groupId": "507f1f77bcf86cd799439011",
  "splitType": "EXACT",
  "splits": [
    {
      "userId": "507f191e810c19729de860ea",
      "amount": 500
    },
    {
      "userId": "507f191e810c19729de860eb",
      "amount": 400
    },
    {
      "userId": "507f191e810c19729de860ec",
      "amount": 300
    }
  ],
  "isRecurring": true
}
```

**Request Body (Percentage Split):**
```json
{
  "description": "Lunch",
  "amount": 1000,
  "groupId": "507f1f77bcf86cd799439011",
  "splitType": "PERCENT",
  "splits": [
    {
      "userId": "507f191e810c19729de860ea",
      "percentage": 50
    },
    {
      "userId": "507f191e810c19729de860eb",
      "percentage": 50
    }
  ]
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "description": "Dinner at restaurant",
  "amount": 1200,
  "paidBy": "507f191e810c19729de860ea",
  "groupId": "507f1f77bcf86cd799439011",
  "category": "Food",
  "splitType": "EQUAL",
  "splits": [
    {
      "userId": "507f191e810c19729de860ea",
      "amount": 400
    }
  ],
  "isRecurring": false,
  "date": "2024-01-15T18:30:00.000Z"
}
```

**Errors:**
- `400` - Splits required for EXACT type
- `400` - Split amounts must equal total amount

---

### Get Group Expenses
**GET** `/expenses/group/:groupId`

Get all expenses for a specific group.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "description": "Dinner at restaurant",
    "amount": 1200,
    "paidBy": {
      "_id": "507f191e810c19729de860ea",
      "name": "John Doe",
      "username": "johndoe"
    "date": "2024-01-15T18:30:00.000Z"
  }
]
```

## Comments (Chat)

### Add Comment
**POST** `/comments/add`

Send a message to the group chat.

**Request Body:**
```json
{
  "groupId": "507f1f77bcf86cd799439011",
  "text": "Hey everyone, I paid for dinner!"
}
```

**Response (200):**
```json
{
  "_id": "609c123...",
  "groupId": "507f1f77bcf86cd799439011",
  "userId": {
    "_id": "507f191...",
    "name": "John Doe",
    "username": "johndoe"
  },
  "text": "Hey everyone, I paid for dinner!",
  "date": "2024-01-15T19:00:00.000Z"
}
```

### Get Group Comments
**GET** `/comments/:groupId`

Get chat history for a group.

**Response (200):**
```json
[
  {
    "_id": "609c123...",
    "text": "Hey everyone!",
    "userId": { "name": "John Doe", "username": "johndoe" }
  }
]
```
    "groupId": "507f1f77bcf86cd799439011",
    "date": "2024-01-15T18:30:00.000Z",
    "splits": [...]
  }
]
```

---

### Get Group Balances
**GET** `/expenses/group/:groupId/balances`

Get settlement plan for a group.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "balances": {
    "507f191e810c19729de860ea": 400.00,
    "507f191e810c19729de860eb": -200.00,
    "507f191e810c19729de860ec": -200.00
  },
  "plan": [
    {
      "from": "Jane Doe",
      "to": "John Doe",
      "amount": 200
    },
    {
      "from": "Bob Smith",
      "to": "John Doe",
      "amount": 200
    }
  ]
}
```

---

### Delete Expense
**DELETE** `/expenses/:expenseId`

Delete an expense (payer only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Expense deleted"
}
```

**Errors:**
- `403` - Only the payer can delete this expense
- `404` - Expense not found

---

## Error Responses

All endpoints may return the following error format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

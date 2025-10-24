# API Documentation

This document provides comprehensive API documentation for the MCQ Competition Portal backend services.

## Base URL

- **Development**: `http://localhost:5001`
- **Production**: `https://your-project-id.cloudfunctions.net`

## Authentication

All API endpoints require authentication using Firebase ID tokens. Include the token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "data": any,
  "error": string,
  "message": string
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Endpoints

### Authentication

#### POST /api/auth/login
Login user and create session.

**Request Body:**
```json
{
  "idToken": "firebase-id-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "user-id",
      "username": "username",
      "role": "admin|student",
      "email": "user@example.com"
    },
    "sessionId": "session-id"
  },
  "message": "Login successful"
}
```

#### POST /api/auth/logout
Logout user and invalidate session.

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### GET /api/auth/me
Get current user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "user-id",
    "username": "username",
    "role": "admin|student",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLoginAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /api/auth/refresh
Refresh session activity.

**Response:**
```json
{
  "success": true,
  "message": "Session refreshed"
}
```

### Contests

#### GET /api/contests
Get all contests (filtered by user role).

**Query Parameters:**
- `status` (optional): Filter by contest status
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "contest-id",
      "title": "Math Quiz",
      "description": "Basic mathematics quiz",
      "duration": 3600,
      "status": "running",
      "startTime": "2024-01-01T10:00:00Z",
      "endTime": "2024-01-01T11:00:00Z",
      "createdAt": "2024-01-01T09:00:00Z",
      "createdBy": "admin-id",
      "totalQuestions": 10,
      "maxScore": 100
    }
  ]
}
```

#### GET /api/contests/:id
Get specific contest details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "contest-id",
    "title": "Math Quiz",
    "description": "Basic mathematics quiz",
    "duration": 3600,
    "status": "running",
    "startTime": "2024-01-01T10:00:00Z",
    "endTime": "2024-01-01T11:00:00Z",
    "createdAt": "2024-01-01T09:00:00Z",
    "createdBy": "admin-id",
    "totalQuestions": 10,
    "maxScore": 100
  }
}
```

#### POST /api/contests
Create new contest (Admin only).

**Request Body:**
```json
{
  "title": "Math Quiz",
  "description": "Basic mathematics quiz",
  "duration": 3600,
  "questions": [
    {
      "text": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": 1,
      "points": 10
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contestId": "new-contest-id"
  },
  "message": "Contest created successfully"
}
```

#### POST /api/contests/:id/start
Start contest (Admin only).

**Response:**
```json
{
  "success": true,
  "message": "Contest started successfully"
}
```

#### POST /api/contests/:id/stop
Stop contest (Admin only).

**Response:**
```json
{
  "success": true,
  "message": "Contest stopped successfully"
}
```

#### GET /api/contests/:id/questions
Get contest questions (Students only during running contest).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "question-id",
      "order": 1,
      "text": "What is 2 + 2?",
      "imageUrl": "https://example.com/image.jpg",
      "options": ["3", "4", "5", "6"]
    }
  ]
}
```

#### POST /api/contests/:id/answers
Submit answer (Students only).

**Request Body:**
```json
{
  "questionId": "question-id",
  "answer": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Answer saved successfully"
}
```

#### POST /api/contests/:id/submit
Submit contest (Students only).

**Response:**
```json
{
  "success": true,
  "message": "Contest submitted successfully"
}
```

#### GET /api/contests/:id/results
Get contest results (Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "rank": 1,
        "userId": "user-id",
        "username": "student1",
        "score": 90,
        "totalQuestions": 10,
        "percentage": 90,
        "timeTaken": 1800,
        "submittedAt": "2024-01-01T10:30:00Z"
      }
    ],
    "stats": {
      "totalParticipants": 25,
      "averageScore": 75.5,
      "highestScore": 100,
      "lowestScore": 45,
      "completionRate": 100
    }
  }
}
```

### Student Management (Admin Only)

#### GET /api/admin/students
Get all students.

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Number of results to skip (default: 0)
- `search` (optional): Search by username

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "uid": "user-id",
      "username": "student1",
      "role": "student",
      "email": "student1@example.com",
      "createdAt": "2024-01-01T00:00:00Z",
      "isActive": true
    }
  ]
}
```

#### POST /api/admin/students
Create new student account.

**Request Body:**
```json
{
  "username": "newstudent",
  "password": "securepassword",
  "email": "newstudent@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "new-user-id",
    "username": "newstudent",
    "email": "newstudent@example.com"
  },
  "message": "Student account created successfully"
}
```

#### PUT /api/admin/students/:uid
Update student account.

**Request Body:**
```json
{
  "username": "updatedusername",
  "email": "updated@example.com",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student account updated successfully"
}
```

#### DELETE /api/admin/students/:uid
Delete student account.

**Response:**
```json
{
  "success": true,
  "message": "Student account deleted successfully"
}
```

#### POST /api/admin/students/:uid/reset-password
Reset student password.

**Request Body:**
```json
{
  "newPassword": "newsecurepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

#### GET /api/admin/dashboard
Get admin dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalContests": 15,
    "activeContests": 2,
    "totalStudents": 150,
    "activeSessions": 25,
    "recentContests": [
      {
        "id": "contest-id",
        "title": "Recent Quiz",
        "status": "running",
        "createdAt": "2024-01-01T09:00:00Z"
      }
    ]
  }
}
```

### Student Endpoints

#### GET /api/students/contests
Get available contests for student.

**Query Parameters:**
- `status` (optional): Filter by status (default: 'running')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "contest-id",
      "title": "Math Quiz",
      "status": "running",
      "startTime": "2024-01-01T10:00:00Z",
      "endTime": "2024-01-01T11:00:00Z",
      "duration": 3600
    }
  ]
}
```

#### GET /api/students/contests/:id/status
Get contest status and participation info.

**Response:**
```json
{
  "success": true,
  "data": {
    "contest": {
      "id": "contest-id",
      "title": "Math Quiz",
      "status": "running",
      "startTime": "2024-01-01T10:00:00Z",
      "endTime": "2024-01-01T11:00:00Z",
      "duration": 3600
    },
    "participation": {
      "hasStarted": true,
      "isSubmitted": false,
      "rejoinStatus": null
    }
  }
}
```

#### GET /api/students/contests/:id/progress
Get student's progress in contest.

**Response:**
```json
{
  "success": true,
  "data": {
    "answers": {
      "question-1": 1,
      "question-2": 3
    },
    "lastSaved": "2024-01-01T10:15:00Z",
    "isSubmitted": false,
    "timeSpent": 900
  }
}
```

#### GET /api/students/results
Get student's contest results.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "contestId": "contest-id",
      "username": "student1",
      "score": 85,
      "totalQuestions": 10,
      "percentage": 85,
      "rank": 5,
      "timeTaken": 1800,
      "submittedAt": "2024-01-01T10:30:00Z"
    }
  ]
}
```

#### GET /api/students/profile
Get student profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "user-id",
    "username": "student1",
    "email": "student1@example.com",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLoginAt": "2024-01-01T09:00:00Z"
  }
}
```

### Rejoin Requests

#### POST /api/rejoin/request
Request to rejoin contest (Students only).

**Request Body:**
```json
{
  "contestId": "contest-id",
  "reason": "Window minimized accidentally"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rejoin request submitted successfully"
}
```

#### GET /api/rejoin/requests
Get all rejoin requests (Admin only).

**Query Parameters:**
- `contestId` (optional): Filter by contest
- `status` (optional): Filter by status (default: 'pending')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "request-id",
      "userId": "user-id",
      "contestId": "contest-id",
      "status": "pending",
      "requestedAt": "2024-01-01T10:05:00Z",
      "reason": "Window minimized accidentally",
      "username": "student1",
      "userEmail": "student1@example.com"
    }
  ]
}
```

#### POST /api/rejoin/approve
Approve or reject rejoin request (Admin only).

**Request Body:**
```json
{
  "contestId": "contest-id",
  "userId": "user-id",
  "action": "approve|reject",
  "reason": "Approved by admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rejoin request approved successfully"
}
```

#### GET /api/rejoin/status/:contestId
Get rejoin status for student in specific contest.

**Response:**
```json
{
  "success": true,
  "data": {
    "hasRequest": true,
    "status": "pending",
    "requestedAt": "2024-01-01T10:05:00Z",
    "approvedAt": null,
    "reason": "Window minimized accidentally"
  }
}
```

## WebSocket Events (Real-time)

### Contest Events

#### contest:started
Emitted when a contest is started by admin.

```json
{
  "type": "contest:started",
  "data": {
    "contestId": "contest-id",
    "startTime": "2024-01-01T10:00:00Z",
    "endTime": "2024-01-01T11:00:00Z"
  }
}
```

#### contest:ended
Emitted when a contest ends.

```json
{
  "type": "contest:ended",
  "data": {
    "contestId": "contest-id",
    "endTime": "2024-01-01T11:00:00Z"
  }
}
```

#### answer:saved
Emitted when a student saves an answer.

```json
{
  "type": "answer:saved",
  "data": {
    "contestId": "contest-id",
    "questionId": "question-id",
    "userId": "user-id",
    "answer": 1
  }
}
```

#### rejoin:requested
Emitted when a student requests to rejoin.

```json
{
  "type": "rejoin:requested",
  "data": {
    "contestId": "contest-id",
    "userId": "user-id",
    "reason": "Window minimized"
  }
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 10 requests per 15 minutes per IP
- **Answer submission**: 60 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Error Handling

### Validation Errors

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "username": "Username is required",
    "password": "Password must be at least 8 characters"
  }
}
```

### Authentication Errors

```json
{
  "success": false,
  "error": "Invalid token"
}
```

### Permission Errors

```json
{
  "success": false,
  "error": "Admin access required"
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const idToken = await userCredential.user.getIdToken();

// API call
const response = await fetch('/api/contests', {
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Python

```python
import requests
import firebase_admin
from firebase_admin import auth, credentials

# Initialize Firebase Admin
cred = credentials.Certificate('service-account-key.json')
firebase_admin.initialize_app(cred)

# Create custom token
custom_token = auth.create_custom_token('user-id')

# API call
headers = {
    'Authorization': f'Bearer {custom_token}',
    'Content-Type': 'application/json'
}

response = requests.get('/api/contests', headers=headers)
data = response.json()
```

## Testing

### Postman Collection

Import the provided Postman collection for API testing:

1. Set environment variables:
   - `base_url`: API base URL
   - `firebase_token`: Firebase ID token

2. Run the collection to test all endpoints

### cURL Examples

```bash
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"idToken": "your-firebase-token"}'

# Get contests
curl -X GET http://localhost:5001/api/contests \
  -H "Authorization: Bearer your-firebase-token"

# Create contest (Admin only)
curl -X POST http://localhost:5001/api/contests \
  -H "Authorization: Bearer your-firebase-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Quiz",
    "duration": 3600,
    "questions": [
      {
        "text": "What is 2+2?",
        "options": ["3", "4", "5", "6"],
        "correctAnswer": 1,
        "points": 10
      }
    ]
  }'
```

## Changelog

### v1.0.0
- Initial API release
- Authentication and authorization
- Contest management
- Student management
- Real-time updates
- Security measures

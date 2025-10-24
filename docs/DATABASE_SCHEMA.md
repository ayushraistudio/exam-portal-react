# Database Schema

## Firestore Collections Structure

### Users Collection (`/users/{uid}`)
```typescript
interface User {
  uid: string;                    // Firebase Auth UID
  username: string;               // Unique username
  role: 'admin' | 'student';     // User role
  email?: string;                 // Optional email
  createdAt: Timestamp;          // Account creation time
  lastLoginAt?: Timestamp;       // Last login time
  sessionId?: string;            // Current session ID for single session enforcement
  isActive: boolean;             // Account status
}
```

### Contests Collection (`/contests/{contestId}`)
```typescript
interface Contest {
  id: string;                    // Contest ID
  title: string;                 // Contest title
  description?: string;          // Contest description
  duration: number;              // Duration in seconds (3600 or 7200)
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
  startTime?: Timestamp;         // Actual start time
  endTime?: Timestamp;           // Calculated end time
  createdAt: Timestamp;          // Contest creation time
  createdBy: string;             // Admin UID who created
  totalQuestions: number;        // Number of questions
  maxScore: number;              // Maximum possible score
}
```

### Questions Collection (`/contests/{contestId}/questions/{questionId}`)
```typescript
interface Question {
  id: string;                    // Question ID
  contestId: string;             // Parent contest ID
  order: number;                 // Question order (1-based)
  text: string;                  // Question text
  imageUrl?: string;             // Optional image URL (signed, short-lived)
  options: string[];             // Array of answer options
  correctAnswer: number;         // Index of correct answer (0-based)
  points: number;                // Points for this question
  createdAt: Timestamp;          // Question creation time
}
```

### Answers Collection (`/contests/{contestId}/answers/{userId}`)
```typescript
interface Answer {
  userId: string;                // Student UID
  contestId: string;             // Contest ID
  answers: Record<string, number>; // {questionId: selectedOptionIndex}
  lastSaved: Timestamp;          // Last auto-save time
  submittedAt?: Timestamp;       // Final submission time
  isSubmitted: boolean;          // Submission status
  timeSpent: number;             // Total time spent in seconds
}
```

### Rejoin Requests Collection (`/contests/{contestId}/rejoinRequests/{userId}`)
```typescript
interface RejoinRequest {
  userId: string;                // Student UID
  contestId: string;             // Contest ID
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Timestamp;        // Request timestamp
  approvedBy?: string;           // Admin UID who approved/rejected
  approvedAt?: Timestamp;        // Approval timestamp
  reason?: string;               // Optional reason for rejection
}
```

### Results Collection (`/contests/{contestId}/results/{userId}`)
```typescript
interface Result {
  userId: string;                // Student UID
  contestId: string;             // Contest ID
  username: string;              // Student username
  score: number;                 // Total score achieved
  totalQuestions: number;        // Total questions
  percentage: number;            // Score percentage
  rank?: number;                 // Rank in contest
  timeTaken: number;             // Time taken in seconds
  submittedAt: Timestamp;        // Submission time
  answers: Record<string, {      // Detailed answer breakdown
    questionId: string;
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    points: number;
  }>;
}
```

### Sessions Collection (`/sessions/{sessionId}`)
```typescript
interface Session {
  sessionId: string;             // Unique session ID
  userId: string;                // User UID
  role: 'admin' | 'student';     // User role
  createdAt: Timestamp;          // Session creation time
  lastActivity: Timestamp;       // Last activity time
  isActive: boolean;             // Session status
  ipAddress?: string;            // Client IP
  userAgent?: string;            // Client user agent
}
```

## Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Contests collection
    match /contests/{contestId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Questions subcollection
      match /questions/{questionId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && 
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      }
      
      // Answers subcollection
      match /answers/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        allow read: if request.auth != null && 
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      }
      
      // Rejoin requests subcollection
      match /rejoinRequests/{userId} {
        allow create: if request.auth != null && request.auth.uid == userId;
        allow read, update: if request.auth != null && 
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      }
      
      // Results subcollection
      match /results/{userId} {
        allow read: if request.auth != null && 
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
        allow read: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Sessions collection
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Indexes

### Composite Indexes
```json
{
  "indexes": [
    {
      "collectionGroup": "contests",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "startTime",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "questions",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        {
          "fieldPath": "contestId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "order",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "results",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        {
          "fieldPath": "contestId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "score",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## Data Flow

1. **Admin creates contest** → Writes to `/contests/{contestId}`
2. **Admin adds questions** → Writes to `/contests/{contestId}/questions/{questionId}`
3. **Admin starts contest** → Updates contest status and startTime
4. **Students answer questions** → Writes to `/contests/{contestId}/answers/{userId}`
5. **Auto-submit triggers** → Reads answers, calculates scores, writes to `/contests/{contestId}/results/{userId}`
6. **Rejoin requests** → Writes to `/contests/{contestId}/rejoinRequests/{userId}`

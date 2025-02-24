# MindMergeForum

TO DETETE - this is for Dev'a overview

User Authentication & Management:
Registration:
    Firebase Auth creates user with email/password
    User gets unique Firebase UID
    Additional user data (handle, name, etc.) stored in Realtime DB: users/{handle}
    Structure includes: handle, uid, email, name, phone, role, createdOn
Login:
    Firebase Auth handles email/password verification
    Returns user object with UID
    App fetches additional user data from users/{handle}

User Management:
    Users can be searched by handle or email
    Roles can be updated: users/{handle}/role
    User data stored by handle for easy lookup
    Post Operations:

Creating Posts:
    Stored in posts/{postId}
Structure includes:
    title, content, userId
    likes: 0 (initial count)
    comments: [] (empty array)
    createdOn, lastActivityDate
    upvotes/downvotes objects
Deleting Posts:
    Removes entire post node: posts/{postId}
    Handled atomically to prevent partial deletions

Voting System:
    Structure:
    posts/{postId}/
    upvotes/{userId}: true
    downvotes/{userId}: true
    Logic:
    Uses transactions to prevent race conditions
    Clicking same vote removes it
    Switching vote removes old and adds new
    Updates lastActivityDate
    
Data Flow Graph:
    Firebase Auth ─────┐
                    │
                    ▼
    Realtime Database ◄────────────────┐
        │                              │
        ├── /users/{handle}            │
        │   └── {uid,email,role,...}   │
        │                              │
        ├── /posts/{postId}            │
        │   ├── {title,content,...}    │
        │   ├── upvotes/{userId}       │
        │   ├── downvotes/{userId}     │
        │   └── comments/              │
        │       └── {userId,text,...}  │
        │                              │
        └── Real-time Updates ─────────┘
Key Features:
    Real-time synchronization using Firebase listeners
    Atomic transactions for concurrent operations
    Hierarchical data structure for efficient queries
    Role-based access control
    Timestamp tracking for all activities
This architecture ensures:
    Data consistency through atomic operations
    Real-time updates across all clients
    Efficient data access patterns
    Scalable user and post management
    Secure authentication and authorization
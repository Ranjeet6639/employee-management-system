# Employee Management System (MERN Stack)

A full-stack Employee Management System built with MongoDB, Express, React, and Node.js. Supports user authentication via JWT and full CRUD management of employee records, with search, sorting, and pagination.

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios, Context API for state management, plain CSS
- **Backend:** Node.js, Express.js, Mongoose
- **Database:** MongoDB (Atlas)
- **Auth:** JSON Web Tokens (JWT), bcrypt for password hashing

## Features

- User registration and login with JWT-based authentication
- Protected routes on both frontend (route guards) and backend (middleware)
- Add, view, update, and delete employee records
- Search employees by name
- Sort by name, department, designation, or joining date
- Paginated employee list
- Client-side and server-side form validation
- Loading and error states throughout

## Project Structure

```
employee-management-system/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/     # Navbar, Layout, ProtectedRoute, ConfirmModal
│       ├── context/        # AuthContext (global auth state)
│       ├── pages/          # Login, Register, EmployeeList, EmployeeForm
│       ├── services/       # Axios instance + API service functions
│       └── utils/          # Form validators
├── server/                 # Express backend
│   ├── config/             # MongoDB connection
│   ├── controllers/        # Auth and Employee route handlers
│   ├── middleware/         # JWT auth guard, error handler, async wrapper
│   ├── models/              # Mongoose schemas (User, Employee)
│   ├── routes/              # Express routers
│   └── utils/                # JWT token generator
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm
- A MongoDB connection string (free tier on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) works fine)

### 1. Clone the repository

```bash
git clone https://github.com/Ranjeet6639/employee-management-system.git
cd employee-management-system
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file inside `server/` (copy from `.env.example`):

```bash
cp .env.example .env
```

Fill in your own values (see [Environment Variables](#environment-variables) below), then start the server:

```bash
npm run dev
```

The API will run on `http://localhost:5000` by default.

### 3. Frontend setup

In a separate terminal:

```bash
cd client
npm install
```

Create a `.env` file inside `client/` (copy from `.env.example`):

```bash
cp .env.example .env
```

Then start the React app:

```bash
npm run dev
```

The app will run on `http://localhost:5173` by default.

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the Express server runs on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/employee_management?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key used to sign JWTs — use a long random string | `<random 64-character hex string>` |
| `JWT_EXPIRES_IN` | JWT token expiry duration | `7d` |
| `CLIENT_URL` | URL of the frontend, used for CORS | `http://localhost:5173` |

Generate a secure random `JWT_SECRET` with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Client (`client/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API | `http://localhost:5000/api` |

## API Documentation

All endpoints are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user. Body: `{ name, email, password }` |
| POST | `/api/auth/login` | Public | Log in. Body: `{ email, password }`. Returns a JWT. |
| GET | `/api/auth/profile` | Private | Get the logged-in user's profile |

**Example response (register/login):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "token": "eyJhbGciOi..."
  }
}
```

### Employees

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/employees` | Private | List employees. Supports query params below. |
| GET | `/api/employees/:id` | Private | Get a single employee by ID |
| POST | `/api/employees` | Private | Create a new employee |
| PUT | `/api/employees/:id` | Private | Update an employee |
| DELETE | `/api/employees/:id` | Private | Delete an employee |

**Query parameters for `GET /api/employees`:**

| Param | Description | Default |
|---|---|---|
| `search` | Case-insensitive partial match on full name | — |
| `department` | Exact match filter on department | — |
| `sortBy` | One of `fullName`, `department`, `designation`, `joiningDate`, `createdAt` | `createdAt` |
| `order` | `asc` or `desc` | `desc` |
| `page` | Page number | `1` |
| `limit` | Results per page (max 100) | `10` |

**Employee object shape (request body for POST/PUT):**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "mobileNumber": "+919876543210",
  "department": "Engineering",
  "designation": "Software Engineer",
  "joiningDate": "2026-01-15"
}
```

**Example response:**
```json
{
  "success": true,
  "data": [ /* array of employee objects */ ],
  "pagination": {
    "total": 24,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### Error response shape

All errors follow this shape:
```json
{
  "success": false,
  "message": "Description of what went wrong"
}
```

## Authentication Flow

1. User registers or logs in → backend returns a signed JWT (7-day expiry by default)
2. Frontend stores the token in `localStorage`
3. Every subsequent API request attaches `Authorization: Bearer <token>` via an Axios interceptor
4. Backend middleware verifies the token's signature and re-fetches the user from the database before allowing access
5. If the token is missing, invalid, or expired, the backend returns `401` and the frontend automatically logs the user out and redirects to `/login`

## Problem Solving Approach

A few notable decisions and issues worked through while building this:

- **State management:** Chose React's Context API over Redux Toolkit for auth state. With a single entity type (Employee) and one global concern (auth), Redux's boilerplate wasn't justified — Context keeps the code simpler without sacrificing functionality.
- **Search safety:** The initial search implementation passed user input directly into a MongoDB `$regex` query. Special characters like `(` or `*` are valid regex syntax but not valid search terms, and would throw an error rather than return results. Fixed by escaping regex metacharacters before building the query, so search always treats input as a literal string.
- **Partial update correctness:** The update endpoint originally used `??` (nullish coalescing) to apply only the fields sent in a request. This missed one edge case: an empty string (`""`) is not `null`/`undefined`, so a stray empty field could silently blank out existing data if the API was called directly (e.g. via Postman) rather than through the validated frontend form. Fixed by explicitly checking for non-empty values before applying an update.
- **Token lifecycle:** JWTs are verified by signature *and* by re-fetching the user from the database on every protected request, rather than trusting the decoded payload alone — this way, the protected routes stay correct even if a user is deleted after a token was issued.
- **Pagination + search interaction:** Changing the search term or sort order resets pagination back to page 1, preventing the user from landing on an empty page if a new filter returns fewer results than their previous page number.

## Deployment

> _To be filled in once deployed._

- **Frontend:** _live URL here_
- **Backend API:** https://employee-management-system-ykvd.onrender.com/api/health

## License

This project was built as part of a MERN Stack internship assignment.

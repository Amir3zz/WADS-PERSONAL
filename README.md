# Final Project – Web Application Development and Security

Course Code: COMP6703001  
Course Name: Web Application Development and Security  
Institution: BINUS University International  

## 1. Project Information

**Project Title:** Boardside (a Kanban-Based Study Planner)  
**Project Domain:** Study Planner & Productivity Tracker  
**Class:** L4CC  

**Repository:** https://github.com/Amir3zz/WADS-PERSONAL  

**Group Members**

| Name | Student ID | Role | GitHub Username |
|---|---:|---|---|
| Raphael Harloverin Gunarso | 2902641824 | — | Amir3zz |
| Kevin Jonathan Saerang | 2802536423 | — | Aimkill02 |

---

## 2. Project Overview

### 2.1 Problem Statement

Students often manage assignments, exams, and study sessions in separate tools or in a very manual way. That creates three common problems:

- deadlines are easy to miss,
- study time is not tracked consistently,
- and it is difficult to know what should be worked on first.

This project solves that problem by combining a Kanban-style study planner, a due-date calendar, a reminder center, and a study timer into one application. It is also designed to meet the course requirement for meaningful AI, security, testing, and production-ready deployment.

### 2.2 Target Users

- **Primary users:** high-school and university students who need to organize coursework, assignments, and exam prep.
- **Secondary users:** adult learners or professionals preparing for certifications.
- **Tertiary users:** instructors or tutors who want to review progress and study plans.

### 2.3 Solution Overview

Boardside is a study planner built around boards, columns, and cards. The application includes:

- **Task and deadline management** with boards, columns, cards, due dates, and reorder support.
- **Native calendar view** that shows cards on their due-date month.
- **Study timer** for tracking focused study sessions.
- **Reminder center** that lists overdue tasks and tasks due soon.
- **Workload analysis AI** that summarizes task load and recommends what to do first.
- **Card study-plan AI** that generates subtasks, priority, and a student-friendly suggestion.
- **Authentication and session handling** using Firebase plus secure server-side session cookies.
- **Testing coverage** for frontend, backend/API, integration, and security behavior.

### 2.4 Why This Solution Fits the Course

This project matches the assignment requirements because it is:

- a real full-stack Next.js application,
- connected to a PostgreSQL database through Prisma,
- documented with Swagger/OpenAPI,
- protected by authentication and ownership checks,
- tested with Jest,
- and supported by Docker and GitHub Actions.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui |
| Backend | Next.js API routes / Node.js |
| API | REST API returning JSON |
| Database | PostgreSQL with Prisma |
| Authentication | Firebase Authentication + secure session cookie |
| AI | OpenAI API with local fallback logic |
| Containerization | Docker, docker-compose |
| Testing | Jest, Testing Library |
| Documentation | Swagger UI at `/docs` |
| Version Control | GitHub |

---

## 4. System Architecture

### 4.1 Architecture Diagram

```text
Browser
  |
  v
Next.js Frontend
  - Dashboard
  - Board pages
  - Calendar page
  - Study timer page
  - Notifications page
  - Swagger docs page
  |
  v
Next.js API Routes / Backend
  - Authentication verification
  - Validation and sanitization
  - Ownership checks
  - AI orchestration
  - REST endpoints
  |
  v
Prisma ORM
  |
  v
PostgreSQL Database

External Services:
  - Firebase Authentication
  - OpenAI API (when enabled)
```

### 4.2 Architecture Explanation

The application uses a modular full-stack Next.js architecture.

**Frontend layer**
- Renders the dashboard, boards, calendar, notifications, study timer, profile, and docs pages.
- Sends requests to the backend API for create, update, delete, reorder, and analysis operations.
- Does not access the database directly.

**Backend layer**
- Exposes REST API routes in `app/api/*`.
- Verifies the user session on protected routes.
- Applies input validation and ownership checks before changing data.
- Runs AI generation through the server, never from the browser.

**Database layer**
- Stores users, boards, columns, cards, labels, card labels, study sessions, and simple todos.
- Is accessed only through Prisma in server-side code.

**Security boundary**
- Authentication is handled by Firebase and a secure HTTP-only cookie.
- Authorization is enforced on the server by checking session ownership.
- Input is trimmed and validated before it reaches the database.

---

## 5. Features

### 5.1 Core Study Planner Features

- User registration and login
- Board creation, update, deletion, and reordering
- Column creation, update, deletion, and reordering
- Card creation, update, deletion, and reordering
- Card due dates and completion tracking
- Dashboard progress summaries
- Calendar view by month
- Reminder center for overdue and upcoming tasks
- Study timer with saved study sessions
- Account deletion
- Profile page
- API documentation page

### 5.2 AI Features

The project includes two meaningful AI features:

1. **Card Study Plan Generator**
   - Creates subtasks for a task/card.
   - Suggests priority based on urgency.
   - Gives a short student-friendly recommendation.

2. **Workload Analysis**
   - Analyzes task load across boards and cards.
   - Detects risk level: LOW, MEDIUM, or HIGH.
   - Recommends what to focus on first.

### 5.3 Security Features

- Firebase-based authentication
- Secure session cookie
- Server-side session verification
- Ownership checks on boards, columns, and cards
- Input validation on API routes
- Output sanitization through JSON responses and controlled rendering
- ORM-based database access through Prisma
- Secure environment-variable usage for secret keys

### 5.4 Testing Features

- Frontend component tests
- Backend/API route tests
- Integration tests
- Security tests
- AI behavior documentation and test cases

---

## 6. Database Design

### 6.1 Database Choice

The application uses **PostgreSQL** with **Prisma**.

### 6.2 Schema Summary

Current models in the database schema:

- `User`
- `Todo`
- `Board`
- `Column`
- `Card`
- `Label`
- `CardLabel`
- `StudySession`

### 6.3 Relationship Summary

- One **User** has many **Boards**, **Todos**, and **StudySessions**
- One **Board** has many **Columns**
- One **Column** has many **Cards**
- One **Board** has many **Labels**
- One **Card** can have many **Labels** through `CardLabel`

### 6.4 Why Prisma + PostgreSQL

- Prisma keeps data access type-safe and centralized.
- PostgreSQL is reliable for relational data such as boards, columns, cards, and study sessions.
- All database access happens on the backend, not directly from the frontend.

---

## 7. API Design

Swagger/OpenAPI documentation is available at:

- `/docs`
- `/api/docs`

### 7.1 Main Endpoints

> Note: the implementation mainly uses `GET`, `POST`, `PATCH`, and `DELETE`.  
> `PATCH` is used for partial updates and reorder operations.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/firebase` | Verify Firebase ID token and create/update the local user | Yes |
| POST | `/api/logout` | Clear the session cookie | Yes |
| DELETE | `/api/delete-account` | Delete the current account | Yes |
| GET | `/api/boards` | Get all boards for the signed-in user | Yes |
| POST | `/api/boards` | Create a board | Yes |
| PATCH | `/api/boards/reorder` | Reorder boards | Yes |
| GET | `/api/boards/[boardId]` | Get one board with columns/cards | Yes |
| PATCH | `/api/boards/[boardId]` | Update board fields | Yes |
| DELETE | `/api/boards/[boardId]` | Delete a board | Yes |
| POST | `/api/boards/[boardId]/columns` | Create a column | Yes |
| PATCH | `/api/boards/[boardId]/columns/reorder` | Reorder columns | Yes |
| GET | `/api/columns/[columnId]` | Get a column with cards | Yes |
| PATCH | `/api/columns/[columnId]` | Update a column | Yes |
| DELETE | `/api/columns/[columnId]` | Delete a column | Yes |
| POST | `/api/columns/[columnId]/cards` | Create a card | Yes |
| GET | `/api/cards/[cardId]` | Get a card | Yes |
| PATCH | `/api/cards/[cardId]` | Update a card | Yes |
| DELETE | `/api/cards/[cardId]` | Delete a card | Yes |
| PATCH | `/api/cards/reorder` | Reorder cards across columns | Yes |
| POST | `/api/ai/workload` | Generate workload analysis | Yes |
| GET | `/api/study-sessions` | Get recent study sessions | Yes |
| POST | `/api/study-sessions` | Create a study session | Yes |
| PUT | `/api/study-sessions/[sessionId]` | Update a study session | Yes |
| DELETE | `/api/study-sessions/[sessionId]` | Delete a study session | Yes |

### 7.2 Example Request/Response

**Create a board**
```json
POST /api/boards
{
  "title": "Exam Preparation",
  "description": "Study for finals",
  "icon": "📘",
  "color": "#3b82f6"
}
```

**Response**
```json
{
  "id": "clx123...",
  "title": "Exam Preparation",
  "description": "Study for finals",
  "icon": "📘",
  "color": "#3b82f6",
  "position": 0,
  "createdAt": "2026-06-15T10:00:00.000Z",
  "updatedAt": "2026-06-15T10:00:00.000Z",
  "userId": "clxuser..."
}
```

---

## 8. AI Features

### 8.1 AI Feature List

| AI Feature | Purpose | AI Type |
|---|---|---|
| Card Study Plan Generator | Breaks a card into subtasks and suggests urgency | Recommendation / planning |
| Workload Analysis | Summarizes total workload and identifies risk | Classification / recommendation |

### 8.2 AI Integration Flow

#### A. Card Study Plan Generator
1. User edits a card title, description, or due date.
2. Backend prepares a sanitized prompt.
3. `generateCardAI()` is called.
4. If OpenAI is available, the model returns JSON with:
   - `subtasks`
   - `priority`
   - `suggestion`
5. If OpenAI is not available, malformed, or empty, the app falls back to a local simulated planner.
6. The card is saved with AI-generated subtasks, priority, and suggestion.

#### B. Workload Analysis
1. Backend collects all boards and cards for the signed-in user.
2. It counts open, completed, overdue, and due-soon tasks.
3. `generateWorkloadAI()` is called.
4. If OpenAI is available, the model returns JSON with:
   - `riskLevel`
   - `summary`
   - `recommendation`
   - `focusTasks`
5. If OpenAI is not available or returns invalid output, the app falls back to a local simulated workload analyzer.

### 8.3 AI Behavior and Limitations

- The AI features are useful, but they are not magical.
- The backend clamps and validates AI output before storing it.
- If OpenAI fails, the app still works by using the local fallback logic.
- AI results should be treated as recommendations, not truth.

---

## 9. Security Implementation

### 9.1 Authentication

- The app uses Firebase Authentication for sign-in.
- After login, the backend stores a secure HTTP-only `session` cookie.
- Server-side code validates the token before allowing access to protected data.

### 9.2 Authorization

Current authorization is ownership-based:
- a user can only access their own boards, columns, cards, and study sessions.
- protected routes use `withAuth()` and user-scoped database queries.

### 9.3 Input Validation

- API routes trim string inputs.
- Length limits are applied to board titles, descriptions, card titles, notes, and session fields.
- Date fields are parsed and rejected if invalid.
- Boolean and integer fields are validated before database writes.

### 9.4 Injection Protection

- Database access goes through Prisma, not raw SQL.
- That reduces SQL injection risk.
- Route handlers never accept unsanitized SQL strings.

### 9.5 XSS Protection

- User input is rendered through React components.
- Strings are trimmed and displayed as text, not as HTML.
- No direct HTML injection is used for task content.

### 9.6 CSRF Protection

- The session cookie uses `httpOnly` and `SameSite=Lax`.
- State-changing operations are protected by authenticated backend routes.
- A dedicated CSRF-token middleware is not part of the current implementation.

### 9.7 Secure Secret Handling

Sensitive values are read from environment variables, including:
- Firebase admin credentials
- Firebase client config
- OpenAI API key
- database URL
- production URLs

Secrets are not committed into the repository.

---

## 10. Testing Documentation

### 10.1 Frontend Testing

| Test Case | Scenario | Expected Result | Status |
|---|---|---|---|
| FE-01 | Login form validation | Invalid input is rejected and the form shows a validation message | Pass |
| FE-02 | Login / dashboard UI behavior | Buttons, navigation, and page state behave correctly | Pass |

### 10.2 Backend & API Testing

| Test Case | Endpoint | Input | Expected Output | Status |
|---|---|---|---|---|
| API-01 | `POST /api/boards` | Valid board title and description | Board is created and JSON response is returned | Pass |
| API-02 | `PATCH /api/boards/reorder` | Valid ordered board IDs | Boards are reordered and JSON response is returned | Pass |
| API-03 | `POST /api/study-sessions` | Valid study session data | Study session is created and JSON response is returned | Pass |

### 10.3 Security Testing

| Test Case | Attack Type | Expected Behavior | Result |
|---|---|---|---|
| SEC-01 | XSS | Input is sanitized and script content is not executed | Pass |
| SEC-02 | Injection | Malicious input is blocked or safely rejected | Pass |
| SEC-03 | Unauthorized access | Protected routes return unauthorized response | Pass |

### 10.4 AI Functionality Testing

AI Feature: **AI Generated Study Plan**

| Test Case | Input | Expected Output | Actual Result | Status |
|------------|--------|----------------|---------------|--------|
| AI-04 | Valid study goal and available study time | Returns a structured study plan | Study plan generated successfully | Pass |
| AI-05 | Empty study goal | Returns validation error or fallback response | Validation message displayed | Pass |
| AI-06 | Prompt injection attempt | Unsafe instructions are ignored and valid output is returned | Input handled safely | Pass |

Failure Handling:
- If the AI provider cannot be reached, the application displays a study-plan generation failure message.
- If a timeout occurs, the request is cancelled and the user is informed to try again later.
- Invalid AI responses are discarded and replaced with a safe fallback response.

AI Feature: **Workload analysis**

| Test Case | Input | Expected Output | Actual Result | Status |
|---|---|---|---|---|
| AI-01 | Valid board and card data | Returns workload summary and recommendation | Returns workload summary and recommendation | Pass |
| AI-02 | Invalid or empty workload data | Returns safe fallback or clear error | Returns safe fallback or clear error | Pass |
| AI-03 | Prompt injection / nonsensical input | Input is handled safely and does not break the system | Input is handled safely and does not break the system | Pass |

Failure Handling:
- If the AI service is unavailable, the system returns a safe fallback message.
- If the AI response is malformed or times out, the system handles the failure gracefully and does not crash. 

### 10.5 Integration Testing

| Test Case | Scenario | Expected Result | Status |
|---|---|---|---|
| INT-01 | Create a board and load it in the dashboard | New board appears in the dashboard after database save | Pass |
| INT-02 | Reorder boards and refresh the page | Updated order persists after API and database update | Pass |
| INT-03 | Save a study session and reload the study timer page | Saved session appears in the session history | Pass |

---

### 10.6 Test Commands

```bash
npm test
npm run lint
npm run build
```

---

## 11. Deployment & Production Setup

### 11.1 Docker Setup

The project includes:
- `Dockerfile`
- `docker-compose.yml`

### 11.2 Environment Variables

Important environment variables used by the project include:

- `DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `USE_LOCAL_AI`

### 11.3 Live Application URL

https://boardside-sigma.vercel.app

### 11.4 Local Setup

1. Clone the repository.
2. Install dependencies.
3. Set up environment variables.
4. Generate Prisma client.
5. Run migrations.
6. Start the app.

Example:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 11.5 Docker Run

```bash
docker compose up --build
```

---

## 12. GitHub Contribution Summary

### Kevin Jonathan Saerang
- Made the original GitHub repo
- Did Project Progress 1, 2, 3 and a bit of 4


### Raphael Harloverin Gunarso
- Everything else

---

## 13. AI Usage Disclosure

AI tools used: ChatGPT, Codex

AI tools were used to assist with:
- code suggestions and refactoring,
- debugging test failures,
- drafting API documentation structure,
- writing and organizing test scenarios,
- and preparing this README/report structure.

Which parts were assited:
- I genuinely do not remember which are and which are not. It was used all throughout the project for troubleshooting and other such things.

All generated code and text was reviewed and edited before submission. 

---

## 14. Known Limitations & Future Improvements

### Current Limitations
- Calendar integration is native month-based task visualization, not Google Calendar sync.
- Notifications are in-app reminders based on due dates, not push/email notifications.
- Role-based instructor/admin access is not fully separated in the current schema.
- AI features fall back to local heuristic logic when OpenAI is unavailable.

### Future Improvements
- Add true calendar synchronization.
- Add browser push or email reminders.
- Add explicit role-based admin/instructor permissions.
- Add more AI test coverage in automated tests.
- Add richer analytics and study streak tracking.

---

## 15. Final Declaration

We declare that:
- this project is our own work,
- AI usage is disclosed honestly,
- and all group members understand the system.

Signed by Group Members:
- ______________________
- ______________________

---

## 16. Setup

### Prerequisites
- Node.js 22+
- npm
- PostgreSQL
- Firebase project credentials
- OpenAI API key if you want live AI instead of local fallback

### Local Development Steps

```bash
git clone https://github.com/Amir3zz/WADS-PERSONAL
cd WADS-PERSONAL
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Test Steps

```bash
npm test
npm run lint
npm run build
```

---

## 17. Deployment Instructions

### Docker Deployment

1. Prepare the `.env.docker` file.
2. Confirm all required environment variables are filled.
3. Build and run the containers.

```bash
docker compose up --build
```

### Production Deployment Notes

- Use a managed PostgreSQL instance.
- Configure environment variables in your hosting platform.
- Keep Firebase and OpenAI secrets private.
- Enable HTTPS on the deployment platform.
- Update the Live Application URL section above after deployment.
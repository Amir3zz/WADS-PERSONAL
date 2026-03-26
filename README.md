Final Project – Web Application Development and Security  
Course Code: COMP6703001  
Course Name: Web Application Development and Security  
Institution: BINUS University International

**1\. Project Information**  
Project Title: Boardside (a Kanban-Based Study Planner)  
Project Domain: Study Planner & Productivity Tracker  
Class: L4CC  
Repository: https://github.com/AimKill02/WADS-Final-Project  
Group Members:

| Name | Student ID | Role | GitHub Username |
| :---- | :---- | :---- | :---- |
| Raphael Harloverin Gunarso | 2902641824 | \- | Amir3zz |
| Kevin Jonathan Saerang | 2802536423 | \- | Aimkill02 |
| Bagaskara leo  | 2802553165 | \- | bagaskara888 |

**2\. Project Overview**

**2.1 Problem Statement**

*  **What problem does this application solve?**  
  * Many students struggle to organize study tasks, balance deadlines, and create realistic study schedules, which leads to missed deadlines, inefficient study sessions, and burnout.

  * Existing planners are either too generic (not study-focused) or too manual (require lots of user input), so students don’t get actionable, personalized guidance.

  * Instructors and graders expect meaningful AI/security features; a simple CRUD app won’t meet those expectations.

* **Who are the target users?**  
  * Primary: High-school and university students who need to manage coursework, assignments, exam prep, and study sessions.

  * Secondary: Adult learners and professionals preparing for certifications who need structured study plans.

  * Tertiary: Instructors and tutors who want to view student progress, share schedules, or recommend study plans.

**2.2 Solution Overview**

* **Main features**  
  * **Task & deadline management:** Create, edit, categorize, and prioritize study tasks with estimated durations.

  * **Calendar integration:** Native calendar view and optional sync with Google Calendar.

  * **Study session timers:** Timers and manual session logging.

  * **Progress dashboard:** Weekly study hours, completion rates, streaks, and subject breakdowns.

  * **Notifications & reminders:** Email/push reminders for upcoming sessions and deadlines.

  * **Analytics & charts:** Visualizations of time spent per subject, completion velocity, and productivity trends.

  * **User accounts & roles:** Secure authentication (JWT/OAuth), personal profiles, read-only instructor view.

* **Why this solution is appropriate**  
  * **Low implementation overhead, high perceived value:** Core functionality is mostly just CRUD \+ calendar UI, which is quick to implement but useful.

  * **Room for meaningful AI:** Can add focused AI features without building large,overcomplicated systems.

  * **Easy to secure and grade:** Security requirements (JWT, input validation, rate-limiting) are straightforward to implement and document.

  * **Scalable UX payoff:** Small polish (calendar, charts, UX around timers) makes the app feel smooth while still keeping the backend simple.

* **Where AI is used**  
  * **Smart Task Prioritization:** A hybrid approach (rule-based and heuristic-driven prioritization mechanism informed by user activity) that evaluates task urgency, deadlines, estimated effort, and recent user activity to recommend which tasks should be addressed first. The plan at the end of the project is to make it able to auto-move the task across the board with little to no user input

  * **Schedule Optimizer:** use a heuristic-based approach to recommend users study session based on task deadlines, effort and user availability, this also be used for track and estimate the suitable date and time range for the production tracker and analysis

**3\. Technology Stack**

| Layer | Technology |
| :---- | :---- |
| Frontend | Next.js (React) |
| Backend | Next.js (Node.js) |
| API | Firebase, OpenAI & Google Calendar API (optional) |
| Database | PostgreSQL |
| Authentication | Firebase |
| Container | Docker |
| Deployment | Vercel \+ managed PostgreSQL |
| Version Control | GitHub \+ Git Flow |

**4\. System Architecture**

**4.1 Architecture Diagram**  
USER (Browser)  
  |  
  v  
Frontend (Next.js)  
\- Kanban Board (core)  
\- Drag & Drop  
\- Card Progress

Board Modes  
\- Productivity Mode  
\- Study Mode

Global UI  
\- Top Bar (Timer, Notifications, Account)  
\- Side Menu (Analytics, Calendar)  
  |  
  v  
Backend (Next.js API / Node.js)  
\- REST API (JSON)  
\- JWT Verification  
\- Role-based Access

Kanban Core Logic  
\- Boards / Lists / Cards  
\- Workflow Transitions  
\- Activity Logging

Mode-specific Rules  
\- Productivity (WIP, throughput)  
\- Study (sessions, subjects)

AI Assistance (Rule-based)  
\- Smart Task Prioritization  
\- Auto-move / Suggestions  
\- Productivity & Study Summary  
  |  
  v  
PostgreSQL (Prisma)  
\- users (profile)  
\- boards (type)  
\- lists  
\- cards  
\- activity\_logs  
\- study\_sessions  
  |  
  v  
Firebase Authentication  
\- Login / Register  
\- OAuth  
\- JWT Issuing  
  |  
  v  
Docker \+ Deployment  
\- Dockerfile  
\- Env Variables  
\- HTTPS (Vercel)  
  |  
  v  
GitHub  
\- Feature Branches  
\- Pull Requests  
\- Commit History

**4.2 Architecture Explanation**  
This system is designed by using a modular monolith architecture that will be build on Next.js with the concern between the presentation, business logic, data access, AI and the security enforcement

**Frontend**  
On the frontend, it will be responsible for user interaction and visualization. It will be implemented using the Next.js (React) that will provides:

* Kanban boards (boards, list, cards)  
* Drag-and-drop interaction  
* Analytics dashboards and calendar views  
* Study session timer and notifications

Where it will be responsible for:

* Render UI components  
* Capture user input  
* Call backend REST APIs  
* Manage client-side authentication state

For the security, No direct access to databases, business logic and secret key stored on client.

**Backend**  
The backend layer is implemented using Next.js API routes and exposes a RESTful API. This layer will handles:

* Kanban workflow logic  
* Task prioritization rules  
* Schedule optimization logic  
* AI API integration  
* Application-specific validation

It also Responsibilities for:

* Enforce business rules  
* Process authenticated requests  
* Coordinate AI assistance  
* Control access to data

On the Security Enforcement…

* JWT verification for every protected endpoint  
* Role-based authorization (e.g., student, instructor)  
* Input validation and sanitization  
* Rate limiting on sensitive endpoints (AI, scheduling)

This layer will be used as a main security boundary of the system.

**AI**  
AI functionality is implemented as a controlled service layer within the backend.  
It provides:

* Smart task prioritization  
* Schedule optimization  
* Productivity summaries

Responsibilities

* Accept sanitized input from backend  
* Call external AI APIs securely  
* Return structured, non-executable results

Security

* AI API keys stored in environment variables  
* Backend-only AI access  
* Prompt input sanitized to prevent abuse

AI does not bypass business logic or security checks.

**Database**  
application data is stored in PostgreSQL and accessed exclusively through the backend using an ORM.  
Responsibilities

* Persist Kanban data  
* Store study sessions and activity logs  
* Support productivity analytics

Security

* Database is never accessed directly from the frontend  
* Parameterized queries via ORM prevent SQL injection  
* Connection credentials stored securely in environment variables

**Authentication**  
User authentication is handled by Firebase Authentication, which manages:

* User login and registration  
* OAuth flows  
* JWT token issuance

Responsibilities

* Secure identity management  
* Token lifecycle management

Security

* Backend verifies all tokens before processing requests  
* Authentication logic is separated from application logic

**Deployment & Infrastructure**  
The application is containerized using Docker and deployed in a production environment.  
Responsibilities

* Environment isolation  
* Configuration management  
* Secure deployment

Security

* Secrets managed through environment variables  
* HTTPS enforced in production  
* No secrets committed to version control
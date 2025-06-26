# 🛠️ Backend - Scopio

This folder contains the **FastAPI** backend codebase for the Scopio course platform. It handles user APIs, database interactions, authentication, and business logic.

---

## 🧾 Folder & File Structure

backend/
└── app/
├── db/
│ └── connection.py
├── models/
│ └── user.py
├── routes/
│ └── user.py
├── schemas/
│ ├── user.py
│ └── init.py
└── main.py


---

### 📂 `app/`  
Main application folder for all backend logic.

---

#### 📂 `db/`
**Handles database connection.**

- **`connection.py`**  
  Sets up and manages the connection to your PostgreSQL database (via SQLAlchemy or psycopg2).

---

#### 📂 `models/`
**Contains database models (ORM classes).**

- **`user.py`**  
  Defines the `User` table structure (fields like `id`, `name`, `email`, etc.) using SQLAlchemy.

---

#### 📂 `routes/`
**Holds all API endpoint logic.**

- **`user.py`**  
  Defines routes like:
  - `GET /users`
  - `POST /register`
  - `POST /login`
  - Routes call service logic, use models/schemas.

---

#### 📂 `schemas/`
**Contains Pydantic models (for request/response validation).**

- **`user.py`**  
  Defines schemas like `UserCreate`, `UserResponse`, etc., to validate and serialize data.

- **`__init__.py`**  
  Makes `schemas` a proper Python package.

---

#### 🧾 `main.py`
**Entry point of the FastAPI app.**

- Creates app instance
- Includes routers from `routes/`
- Sets up middlewares, CORS, etc.

---

## 🧪 How to Run

```bash
cd backend
uvicorn app.main:app --reload

# Inventory & Order Management System

A simplified full-stack inventory system for managing products, customers, orders, and stock tracking.

## Features

- FastAPI backend with PostgreSQL persistence
- React frontend for products, customers, and order placement
- Unique product SKU validation
- Unique customer email validation
- Inventory validation before order creation
- Automatic stock deduction after successful orders
- Docker and Docker Compose configuration
- Environment-variable based configuration

## Tech Stack

- Backend: Python, FastAPI, SQLAlchemy
- Frontend: React, Vite
- Database: PostgreSQL
- Runtime: Docker Compose

## Run With Docker

```bash
cp .env.example .env
docker compose up --build
```

Frontend: http://localhost:5173  
Backend API: http://localhost:8000  
API docs: http://localhost:8000/docs

## Run Locally

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Set `DATABASE_URL`, `FRONTEND_ORIGIN`, and `VITE_API_URL` in `.env` files as needed.

## API Endpoints

- `GET /health`
- `GET /products`
- `POST /products`
- `PUT /products/{product_id}`
- `DELETE /products/{product_id}`
- `GET /customers`
- `POST /customers`
- `PUT /customers/{customer_id}`
- `DELETE /customers/{customer_id}`
- `GET /orders`
- `POST /orders`

## Deployment Submission

- GitHub repository link: add after pushing the repository
- Docker image link: add after publishing the image
- Live frontend URL: add after deployment
- Live backend URL: add after deployment

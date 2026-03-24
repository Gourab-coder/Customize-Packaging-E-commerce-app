# Customize Packaging E-commerce App

Customize Packaging is a full-stack web application for a packaging-focused e-commerce workflow. It includes a React frontend for browsing products, customizing packaging estimates, placing orders, and managing authentication, plus an Express + MySQL backend for users, categories, products, and orders.

## Project Overview

This project is built for packaging businesses or brands that want to:

- showcase packaging products by category
- let customers register and log in
- allow customers to place packaging orders
- provide a packaging customization price estimator
- give admins a simple panel to manage categories and products

## Tech Stack

### Frontend

- React 19
- Vite
- React Router DOM
- React Icons
- CSS modules/files for page and component styling

### Backend

- Node.js
- Express 5
- MySQL
- `mysql2`
- JWT authentication
- `bcryptjs`
- `dotenv`
- `cors`

## Main Features

- User registration and login with JWT-based authentication
- Role-based access control for admin-only routes
- Product listing grouped by category
- Quick order creation from the products page
- Order history page for logged-in users
- Admin panel to create categories and products, and delete products
- Packaging customization calculator with instant pricing estimate
- Basic health and root backend endpoints for service checks

## Project Structure

```text
Customize-Packaging-E-commerce-app/
|-- client/
|   |-- public/
|   |-- src/
|   |   |-- assets/                  # Images and static frontend assets
|   |   |-- components/              # Reusable UI components
|   |   |   |-- custom_card/
|   |   |   |-- footer/
|   |   |   |-- layout/
|   |   |   |-- navbar/
|   |   |   |-- product_card/
|   |   |   `-- sign/
|   |   |-- context/
|   |   |   `-- AuthContext.jsx      # Client-side auth state
|   |   |-- lib/
|   |   |   `-- api.js               # API request helpers
|   |   |-- pages/
|   |   |   |-- about/
|   |   |   |-- admin/
|   |   |   |-- customize/
|   |   |   |-- home/
|   |   |   |-- orders/
|   |   |   `-- products/
|   |   |-- App.jsx                  # Frontend routing
|   |   `-- main.jsx                 # React app entry
|   |-- package.json
|   `-- vite.config.js
|-- server/
|   |-- app/
|   |   |-- config/
|   |   |   `-- db.js                # MySQL connection pool
|   |   |-- controllers/             # Route handlers
|   |   |-- middleware/
|   |   |   `-- authMiddleware.js    # JWT auth + role guard
|   |   |-- routes/                  # API route definitions
|   |   `-- utils/
|   |       `-- jwt.js               # Token generation helper
|   |-- database/
|   |   `-- schema.sql               # Database schema
|   |-- index.js                     # Express server entry
|   `-- package.json
|-- .gitignore
`-- README.md
```

## Application Flow

### Customer Flow

1. User registers or logs in.
2. User browses products by category.
3. User adds products to the quick order summary.
4. User places an order.
5. User can view order history in the `My Orders` page.

### Admin Flow

1. Admin logs in with an account having the `admin` role.
2. Admin opens the `Admin Panel`.
3. Admin creates categories.
4. Admin creates products and attaches image URLs.
5. Admin can delete existing products.

## Pages Included

- `/` - Home page
- `/products` - Product catalog and quick ordering
- `/customize` - Packaging customization price estimator
- `/about` - Project/about page
- `/orders` - Logged-in user order history
- `/admin` - Admin management panel

## Backend API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Categories

- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories` `admin only`
- `PUT /api/categories/:id` `admin only`
- `DELETE /api/categories/:id` `admin only`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` `admin only`
- `PUT /api/products/:id` `admin only`
- `DELETE /api/products/:id` `admin only`

### Orders

- `POST /api/orders`
- `GET /api/orders/my`
- `GET /api/orders` `admin only`
- `PATCH /api/orders/:id/status` `admin only`

### Utility Endpoints

- `GET /` - backend status message
- `GET /health` - health check

## Database Schema

The MySQL schema is available in [server/database/schema.sql](/d:/GOURAB%20DAS/CODE/WEB_DEV/Git/Customize-Packaging-E-commerce-app/server/database/schema.sql). It creates these main tables:

- `users`
- `categories`
- `products`
- `product_images`
- `orders`
- `order_items`

## Environment Variables

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=3000
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=packaging
DB_CONNECTION_LIMIT=10

JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

ALLOW_ADMIN_SIGNUP=false
```

### Variable Notes

- `PORT` sets the backend server port.
- `CLIENT_URL` is used for CORS. You can provide multiple origins separated by commas.
- `DB_*` variables configure the MySQL connection.
- `JWT_SECRET` signs and verifies authentication tokens.
- `JWT_EXPIRES_IN` controls token validity.
- `ALLOW_ADMIN_SIGNUP=true` allows registering users directly with the `admin` role.

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Customize-Packaging-E-commerce-app
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

### 4. Create the database

Run the SQL schema from [server/database/schema.sql](/d:/GOURAB%20DAS/CODE/WEB_DEV/Git/Customize-Packaging-E-commerce-app/server/database/schema.sql) in your MySQL server.

Example:

```sql
SOURCE path/to/server/database/schema.sql;
```

Or open the file and execute it manually in MySQL Workbench / phpMyAdmin / CLI.

### 5. Add backend environment variables

Create:

```text
server/.env
```

Use the example from the section above.

### 6. Start the backend server

```bash
cd server
npm start
```

The backend runs by default at:

```text
http://localhost:3000
```

### 7. Start the frontend

Open another terminal:

```bash
cd client
npm run dev
```

The frontend runs by default at:

```text
http://localhost:5173
```

## Frontend Configuration

The frontend uses `VITE_API_URL` to connect to the backend. If not provided, it falls back to:

```text
http://localhost:3000
```

If needed, create:

```text
client/.env
```

Example:

```env
VITE_API_URL=http://localhost:3000
```

## Authentication and Roles

- Authentication is token-based using JWT.
- The frontend stores auth data in local storage under `packaging_auth`.
- Protected backend routes require a `Bearer <token>` header.
- Admin-only actions are guarded by role checks in middleware.

## Important Notes

- The backend currently starts with `npm start`; a `dev` script with `nodemon` is not configured yet.
- The project includes order creation and admin product/category management, but there is no automated test suite yet.
- The frontend customization page currently calculates estimated pricing on the client side only.
- The consultation and quotation forms in the customization page currently collect input in the UI but do not submit data to the backend.
- Admin registration through the public register flow is disabled unless `ALLOW_ADMIN_SIGNUP=true`.
- The server uses MySQL even though `mongoose` exists in dependencies; MongoDB is not used in the current implementation.

## Available Scripts

### Client

From the `client` folder:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Server

From the `server` folder:

```bash
npm start
```

## Suggested Improvements

- Add `.env.example` files for both client and server
- Add a backend `dev` script using `nodemon`
- Add input validation with a validation library
- Add automated tests for API routes and frontend flows
- Add image upload support instead of manual image URLs
- Add order management UI for admins

## Troubleshooting

### CORS errors

Check that `CLIENT_URL` in `server/.env` matches your frontend origin.

### Database connection errors

Verify:

- MySQL is running
- database credentials are correct
- the `packaging` database exists
- the schema has been imported successfully

### Login or protected route issues

Check:

- `JWT_SECRET` is set
- the token is being sent in the `Authorization` header
- the logged-in user has the correct role for admin routes

## Author / Project Notes

This README is written as project documentation for onboarding, setup, and quick understanding of the codebase. You can expand it later with screenshots, deployment steps, API examples, or contribution guidelines if needed.

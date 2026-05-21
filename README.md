# Customize Packaging E-commerce App

Customize Packaging is a full-stack packaging e-commerce application built with React, Vite, Express, and PostgreSQL. It combines a storefront, a packaging estimator, consultation and quotation request flows, and an admin panel for managing products, orders, and customer requests.

## Highlights

- Product catalog with category-based browsing
- JWT-based authentication with admin/customer roles
- Order placement and customer order history
- Admin order management with status updates
- Packaging price estimator
- Consultation call request submission
- Quotation request submission
- Admin visibility into consultation and quotation requests
- Product image upload to Cloudinary
- Product image cleanup from Cloudinary on delete

## Tech Stack

### Frontend

- React 19
- Vite
- React Router DOM
- React Icons
- Plain CSS

### Backend

- Node.js
- Express 5
- PostgreSQL
- `pg`
- `bcryptjs`
- `jsonwebtoken`
- `dotenv`
- `cors`
- `multer`
- `cloudinary`

## Project Structure

```text
Customize-Packaging-E-commerce-app/
|-- client/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- context/
|   |   |-- lib/
|   |   |-- pages/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- package.json
|   `-- vite.config.js
|-- server/
|   |-- app/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- routes/
|   |   `-- utils/
|   |-- database/
|   |-- index.js
|   `-- package.json
|-- .gitignore
`-- README.md
```

## Main User Flows

### Customer Flow

1. Register or log in.
2. Browse products by category.
3. Place an order from the products page.
4. View order history in `My Orders`.
5. Use the customize page to:
   - estimate packaging cost
   - request a consultation call
   - request a quotation

### Admin Flow

1. Log in with an admin account.
2. Open the admin panel.
3. Create categories.
4. Create products with uploaded product images.
5. Delete products and associated Cloudinary images.
6. Review all customer orders.
7. Update order status to `pending`, `processing`, `shipped`, `delivered`, or `cancelled`.
8. Review consultation and quotation requests.

## Available Pages

- `/` - home page
- `/about` - about page
- `/products` - product catalog and ordering
- `/customize` - packaging estimator, consultation, and quotation requests
- `/orders` - logged-in customer order history
- `/admin` - admin dashboard

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Categories

- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories` admin only
- `PUT /api/categories/:id` admin only
- `DELETE /api/categories/:id` admin only

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` admin only
- `PUT /api/products/:id` admin only
- `DELETE /api/products/:id` admin only

### Orders

- `POST /api/orders`
- `GET /api/orders/my`
- `GET /api/orders` admin only
- `PATCH /api/orders/:id/status` admin only

### Consultation and Quotation Requests

- `POST /api/requests/consultations`
- `GET /api/requests/consultations` admin only
- `POST /api/requests/quotations`
- `GET /api/requests/quotations` admin only

### Utility

- `GET /`
- `GET /health`

## Database Tables

The SQL schema lives in [server/database/schema.sql](/d:/GOURAB%20DAS/CODE/WEB_DEV/Git/Customize-Packaging-E-commerce-app/server/database/schema.sql).

Main tables:

- `users`
- `categories`
- `products`
- `product_images`
- `orders`
- `order_items`
- `consultation_requests`
- `quotation_requests`

## Environment Variables

Create `server/.env`.

### Local PostgreSQL setup

```env
PORT=3000
CLIENT_URL=http://localhost:5173

PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=packaging
DB_CONNECTION_LIMIT=10
PGSSLMODE=disable

JWT_SECRET=change_this_to_a_long_secret
JWT_EXPIRES_IN=7d
ALLOW_ADMIN_SIGNUP=false

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### `DATABASE_URL` setup

You can also use a single PostgreSQL connection string:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/packaging
DB_CONNECTION_LIMIT=10
PGSSLMODE=disable
```

For managed PostgreSQL providers that require SSL, set:

```env
PGSSLMODE=require
```

### Frontend environment

Optionally create `client/.env`:

```env
VITE_API_URL=http://localhost:3000
```

## Setup

### 1. Clone the repo

```bash
git clone <your-repository-url>
cd Customize-Packaging-E-commerce-app
```

### 2. Install dependencies

```bash
cd client
npm install
cd ../server
npm install
```

### 3. Create the database

Create a PostgreSQL database named `packaging`, then run the SQL from [server/database/schema.sql](/d:/GOURAB%20DAS/CODE/WEB_DEV/Git/Customize-Packaging-E-commerce-app/server/database/schema.sql).

### 4. Configure environment variables

Create `server/.env` and optionally `client/.env`.

### 5. Start the backend

```bash
cd server
npm start
```

Default backend URL:

```text
http://localhost:3000
```

### 6. Start the frontend

```bash
cd client
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

## Admin Account Notes

- Public admin registration is disabled by default.
- To create an admin through the register API, temporarily set:

```env
ALLOW_ADMIN_SIGNUP=true
```

- Then call:

```text
POST /api/auth/register
```

with:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "Admin@123",
  "role": "admin"
}
```

- After creating the admin, set `ALLOW_ADMIN_SIGNUP=false` again.

## Cloudinary Notes

- Product images are uploaded through the backend, not directly from the frontend to Cloudinary.
- The backend stores both the image URL and Cloudinary `public_id`.
- When an admin deletes a product, the backend also deletes the related Cloudinary images when `public_id` is available.
- Existing URL-only image rows can still work, but only rows with a valid `public_id` can be fully cleaned up from Cloudinary.

## Scripts

### Client

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Server

```bash
npm start
```

## Troubleshooting

### Backend cannot connect to PostgreSQL

- confirm `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, and `PGDATABASE`, or `DATABASE_URL`
- if your provider requires TLS, set `PGSSLMODE=require`
- if you are running locally, make sure PostgreSQL is listening on port `5432`

### `Failed to create product`

Check:

- Cloudinary credentials in `server/.env`
- backend server logs
- PostgreSQL connection
- product category exists

### Admin requests or orders not loading

Check:

- the logged-in account has role `admin`
- the backend is running
- the frontend `VITE_API_URL` points to the correct backend

### CORS errors

Check that `CLIENT_URL` matches your frontend origin.

## Current Status

This project already supports:

- real order placement
- admin order status updates
- consultation request submission
- quotation request submission
- admin request review
- Cloudinary-based product images

Possible future improvements:

- edit product flow with image replacement cleanup
- admin analytics dashboard
- better validation and error messaging
- automated tests
- payment integration
- search, filters, and pagination

# Madar Market

A responsive, RTL e-commerce application with a Persian user interface. It includes a customer storefront, product search, shopping cart, simulated checkout, order tracking, user profiles, OTP authentication, and a responsive administration panel.

## Features

### Storefront

- Home page with sliders, banners, categories, and featured products
- Product search, filtering, and sorting
- Animated product detail sheets
- Cart quantity controls and persistent browser cart
- Simulated checkout and order creation
- Active, delivered, and cancelled order tabs
- Automatic order-status synchronization with the admin panel
- Phone-number authentication using one-time passwords
- Editable user profile with first and last name
- Responsive mobile-first interface

### Administration Panel

- Store overview and statistics
- Product and category management
- Banner and slider management
- Registered-user list with active/inactive session status
- Order management for all users
- Order filtering by customer and date
- Order status updates and deletion
- Responsive desktop and mobile layouts

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Backend | Bun, Elysia, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Authentication | OTP and session tokens |

## Project Structure

```text
ba_madar-codex/
├── client/                 # React frontend
│   ├── public/             # Images and fonts
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # Cart and order state
│       ├── lib/            # API and authentication utilities
│       └── pages/          # Storefront and admin pages
├── server/                 # Elysia API
│   ├── prisma/
│   │   ├── migrations/     # Database migrations
│   │   ├── seeds/          # Initial data seeders
│   │   └── schema.prisma   # Database schema
│   └── src/
│       ├── routes/         # API routes
│       ├── services/       # Business logic
│       └── db/             # Prisma connection
└── README.md
```

## Prerequisites

- A recent version of [Bun](https://bun.sh/)
- A recent version of Node.js and npm
- PostgreSQL

## Getting Started

### 1. Install dependencies

Install the server dependencies:

```bash
cd server
bun install
```

Install the client dependencies:

```bash
cd ../client
npm install
```

### 2. Configure the server environment

Copy the provided environment template inside the `server` directory:

```bash
cd server
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update the new `.env` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
NODE_ENV="development"
OTP_SECRET="replace-with-a-long-random-secret"

# Optional SMS provider
SMS_API_URL=""
SMS_API_KEY=""
```

When `SMS_API_URL` is not configured in development, the OTP is printed to the server output and may also be included in the development response. An SMS provider is required in production.

### 3. Prepare the database

Generate the Prisma client and apply all migrations:

```bash
cd server
npx prisma generate
npx prisma migrate deploy
```

Optionally seed categories, products, banners, and sliders:

```bash
bun run prisma/seed.ts
```

> Warning: the current seed process deletes and recreates existing products, categories, banners, and sliders. Do not run it against a production database.

### 4. Run the API server

```bash
cd server
bun run dev
```

The API runs at:

```text
http://localhost:3000
```

### 5. Run the frontend

Open another terminal:

```bash
cd client
npm run dev
```

The application is available at:

```text
http://localhost:5173
```

By default, the client connects to port `3000` on the same hostname used by the browser. To use another API URL, create `client/.env`:

```env
VITE_API_URL="http://localhost:3000"
```

## Available Commands

### Client

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

### Server

```bash
bun run dev                  # Start the API in watch mode
npx prisma generate          # Generate the Prisma client
npx prisma migrate deploy    # Apply database migrations
bun run prisma/seed.ts       # Seed initial store data
```

## Application Routes

| Route | Description |
| --- | --- |
| `/home` | Storefront home page |
| `/search` | Product search and filters |
| `/basket` | Shopping cart and checkout |
| `/orders` | Customer order history |
| `/profile` | Authenticated user profile |
| `/login` | Phone-number login |
| `/admin` | Administration panel |

## API Overview

The API is organized into the following groups:

- `/auth` — request and verify OTPs, read/update profiles, and log out
- `/orders` — create and retrieve orders for the authenticated customer
- `/products`, `/categories`, `/banners`, and `/sliders` — public store data
- `/admin` — dashboard data and management operations

Authenticated profile and order requests require the following header:

```http
Authorization: Bearer <session-token>
```

## Authentication

Customers authenticate with their phone number and a one-time password. Successful verification creates a database-backed session token. Logging out invalidates all sessions belonging to that user.

The admin panel currently uses the development access code `1111` on the client side.

## Production Build

Build the frontend:

```bash
cd client
npm run build
```

The generated frontend files are written to `client/dist`.

Build the server:

```bash
cd server
bun build src/index.ts --outdir dist --target bun
```

Run the compiled server:

```bash
bun run dist/index.js
```

## Security and Deployment Notes

- Replace `OTP_SECRET` with a long, randomly generated production secret.
- Never commit `.env` files or credentials.
- Restrict CORS to the actual production domains.
- The current client-side admin access code is intended only for development. Before production, move admin authentication to the server and enforce role-based authorization.
- Checkout is currently simulated. A production deployment requires a real payment gateway, verified callbacks, and server-side payment validation.
- Run the API and PostgreSQL behind HTTPS and secure network rules.
- Configure a production SMS provider before enabling production OTP authentication.

## License

No license has been specified for this project.

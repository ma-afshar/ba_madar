# Madar Market

A responsive, mobile-first Persian e-commerce application featuring product search, shopping cart management, OTP authentication, and a content management dashboard.

## Features

- Home page with hero sliders, promotional festivals, categories, featured products, and advertisement banners
- Instant product search by product or category name
- Category and discounted-product filters
- Sorting by price, discount, newest, and popularity
- Shopping cart with quantity controls and product removal
- Persistent cart data using browser storage
- Phone number authentication with one-time passwords
- Admin dashboard for products, categories, banners, sliders, and users
- RTL interface with the IRANYekan font
- Full-width responsive layout for different mobile screen sizes
- Local network support for testing the application on a phone

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS 4

### Backend

- Bun
- Elysia
- Prisma ORM
- PostgreSQL
- OTP and session-based authentication

## Project Structure

```text
ba_madar-codex/
├── client/                 # React frontend
│   ├── public/             # Images and fonts
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # Shopping cart state
│       ├── lib/            # API and authentication utilities
│       └── pages/          # Application pages
├── server/                 # Backend API
│   ├── prisma/             # Schema, migrations, and seed data
│   └── src/
│       ├── routes/         # API routes
│       ├── services/       # Business logic
│       └── db/             # Prisma database connection
└── README.md
```

## Prerequisites

Install the following before running the project:

- [Bun](https://bun.sh/)
- PostgreSQL
- Git (optional)

## Backend Setup

Open the server directory and install its dependencies:

```bash
cd server
bun install
```

Create the environment file from the provided example:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure the PostgreSQL connection in `server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/madar_market"
NODE_ENV="development"
OTP_SECRET="replace-with-a-long-random-secret"
```

Prepare Prisma and the database:

```bash
bunx prisma generate
bunx prisma migrate deploy
bun run prisma/seed.ts
```

> Warning: running the seed script deletes and recreates the existing products, categories, sliders, and banners.

Start the backend server:

```bash
bun run dev
```

The API will be available at:

```text
http://localhost:3000
```

## Frontend Setup

Open a separate terminal:

```bash
cd client
bun install
bun run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

## Running the Project on a Phone

The phone and laptop must be connected to the same Wi-Fi network or hotspot. Start both the frontend and backend, then open the laptop's local IP address on the phone:

```text
http://172.20.17.127:5173
```

The frontend automatically connects to the API using the same hostname and port `3000`:

```text
http://172.20.17.127:3000
```

If the frontend loads on the phone but API data does not appear:

1. Confirm that both devices are connected to the same network.
2. Allow Bun through Windows Firewall on `Private` networks.
3. Make sure ports `5173` and `3000` are not occupied by another application.
4. If the laptop IP changes, use the new address in the phone browser.

To find the current IP address on Windows:

```powershell
ipconfig
```

## Frontend Routes

| Route | Description |
|---|---|
| `/home` | Store home page |
| `/search` | Product search and filtering |
| `/basket` | Shopping cart |
| `/login` | Phone number login |
| `/login/verify` | OTP verification |
| `/admin` | Admin dashboard |

## Admin Dashboard

Open the following route to access the admin dashboard:

```text
http://localhost:5173/admin
```

Current admin access code:

```text
1111
```

Admin access remains active for the current browser session. Selecting **Log out of dashboard** clears the access state and redirects the user to the home page.

> Security warning: the `1111` code is currently checked on the frontend and is not secure for production. Before public deployment, add server-side admin authentication, role-based authorization, and protection for every `/admin/*` endpoint.

## Main API Endpoints

### Store Content

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/products` | Retrieve products |
| `GET` | `/categories` | Retrieve product categories |
| `GET` | `/sliders` | Retrieve hero sliders |
| `GET` | `/banners` | Retrieve advertisement banners |

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/request-otp` | Request a login code |
| `POST` | `/auth/verify-otp` | Verify a code and create a session |
| `GET` | `/auth/me` | Retrieve the current user |
| `POST` | `/auth/logout` | End the current session |

### Administration

Administration endpoints use the `/admin` prefix and provide create, update, and delete operations for products, categories, banners, and sliders.

## OTP and SMS Provider

In development, when `SMS_API_URL` is not configured, the OTP is printed in the backend terminal and is also included in the development response.

To connect an SMS provider, configure these environment variables:

```env
SMS_API_URL="https://your-sms-provider.example/send"
SMS_API_KEY="your-api-key"
```

The configured provider must accept the following request body:

```json
{
  "to": "09123456789",
  "code": "1234",
  "message": "Madar Market login code: 1234"
}
```

## Production Build

### Frontend

```bash
cd client
bun run build
```

The frontend output is generated in `client/dist`.

### Backend

```bash
cd server
bun build src/index.ts --outdir dist --target bun
```

## Deployment Checklist

Before deploying publicly:

- Replace `OTP_SECRET` with a long, random value.
- Protect the admin dashboard and its API routes with server-side authentication.
- Restrict CORS to the production domain.
- Serve the application over HTTPS.
- Never commit `.env` files or secrets to source control.
- Configure a production SMS provider.
- Set up regular PostgreSQL backups.

## Useful Commands

```bash
# Start the frontend
cd client && bun run dev

# Start the backend
cd server && bun run dev

# Build the frontend
cd client && bun run build

# Apply database migrations
cd server && bunx prisma migrate deploy

# Load the initial data
cd server && bun run prisma/seed.ts
```

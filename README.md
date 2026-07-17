# 📒 CashBook

A modern, full-stack cash management application for small businesses and freelancers. Track income, expenses, manage multiple cashbooks, and collaborate with your team — all in one place.

---

## ✨ Features

- **Multi-Business Support** — Manage multiple businesses under a single account
- **Cashbook Management** — Create and organise multiple cashbooks per business
- **Transaction Tracking** — Record cash-in / cash-out entries with date, party, category, remarks & payment mode
- **Party Management** — Maintain a contact book of customers and suppliers per cashbook
- **Team Collaboration** — Invite team members to collaborate on a business
- **Authentication** — Email OTP-based login (no passwords needed)
- **Business Settings** — Customise business profile, category, and icon
- **Responsive UI** — Works seamlessly on desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|------------|----------------------------------------------|
| Frontend | React 19, React Router 7, Vite 8 |
| Styling | Vanilla CSS |
| Icons | Lucide React |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL (Supabase) / SQLite (local dev) |
| Auth | JWT + Email OTP (Nodemailer) |
| Dev Tools | ESLint, Nodemon |

---

## 📁 Project Structure

```
cashbook/
├── public/                  # Static assets (favicon, icons)
├── src/                     # React frontend
│   ├── api.js               # API client helper
│   ├── App.jsx              # Root component & routing
│   ├── main.jsx             # Vite entry point
│   ├── index.css            # Global styles
│   ├── assets/              # Images & static assets
│   ├── components/          # UI components
│   │   ├── business/        # Business-related components
│   │   ├── cashbooks/       # Cashbook list, transactions, settings
│   │   ├── layout/          # Sidebar, header, layout shell
│   │   ├── payments/        # Payments dashboard
│   │   ├── settings/        # Business settings
│   │   ├── shared/          # Shared / common components
│   │   └── team/            # Team management
│   ├── context/             # React context providers
│   │   ├── AppContext.jsx    # App-wide state (business, cashbooks)
│   │   └── AuthContext.jsx   # Authentication state
│   └── pages/               # Full-page views
│       ├── LandingPage.jsx   # Public landing page
│       ├── LoginPage.jsx     # Email OTP login
│       ├── OnboardingPage.jsx# New-user onboarding
│       └── ProfilePage.jsx   # User profile
│
├── backend/                 # Express API server
│   ├── server.js            # Entry point
│   ├── db.js                # Database connection & helpers
│   ├── db/
│   │   └── schema.sql       # PostgreSQL schema
│   ├── routes/              # Express route handlers
│   │   ├── auth.js          # Login / OTP / verify
│   │   ├── businesses.js    # CRUD businesses
│   │   ├── cashbooks.js     # CRUD cashbooks
│   │   ├── transactions.js  # CRUD transactions
│   │   └── parties.js       # CRUD parties
│   ├── middleware/
│   │   └── authMiddleware.js # JWT verification
│   └── services/
│       └── emailService.js  # Nodemailer SMTP setup
│
├── vite.config.js           # Vite config (dev proxy → backend)
├── eslint.config.js         # ESLint configuration
├── package.json             # Frontend dependencies
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **PostgreSQL** database (or [Supabase](https://supabase.com) free tier)
- A **Gmail account** with an [App Password](https://support.google.com/accounts/answer/185833) for SMTP

### 1. Clone the repository

```bash
git clone https://github.com/your-username/cashbook.git
cd cashbook
```

### 2. Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your_super_secret_jwt_key

# PostgreSQL / Supabase
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres

# Gmail SMTP
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_SENDER=your-email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
```

Run the database schema (one-time):

```bash
# Using psql or the Supabase SQL editor, execute:
# backend/db/schema.sql
```

Start the backend:

```bash
npm run dev
```

The API server will start at **http://localhost:3001**.

### 3. Setup the frontend

```bash
# From the project root
npm install
npm run dev
```

The app will open at **http://localhost:5173**. API calls are automatically proxied to the backend via Vite's dev proxy.

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|-------------------------------------------------------|-------------------------------|
| POST | `/api/auth/send-otp` | Send OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP & get JWT |
| GET | `/api/businesses` | List user's businesses |
| POST | `/api/businesses` | Create a business |
| GET | `/api/businesses/:id/cashbooks` | List cashbooks |
| POST | `/api/businesses/:id/cashbooks` | Create a cashbook |
| GET | `/api/businesses/:id/cashbooks/:bookId/transactions` | List transactions |
| POST | `/api/businesses/:id/cashbooks/:bookId/transactions` | Add a transaction |
| GET | `/api/businesses/:id/cashbooks/:bookId/parties` | List parties |
| POST | `/api/businesses/:id/cashbooks/:bookId/parties` | Add a party |
| GET | `/api/health` | Health check |

---

## 📜 Scripts

### Frontend (root `package.json`)

| Script | Command | Description |
|---------|-----------------|-------------------------------|
| `dev` | `npm run dev` | Start Vite dev server |
| `build` | `npm run build` | Production build |
| `preview`| `npm run preview`| Preview production build |
| `lint` | `npm run lint` | Run ESLint |

### Backend (`backend/package.json`)

| Script | Command | Description |
|---------|-----------------|-------------------------------|
| `dev` | `npm run dev` | Start with Nodemon (auto-reload)|
| `start` | `npm start` | Start without Nodemon |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> Built with ❤️ using React + Express

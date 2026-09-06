# 🌾 FarmIQ — Smart Agriculture & Marketplace Platform

**FarmIQ** is a full‑stack, AI‑powered agricultural marketplace platform designed for Bangladesh. It connects farmers directly with buyers, eliminates middlemen, and provides real‑time crop disease detection, AI advisory, and seamless payment integration.

Built with a modern monorepo architecture, FarmIQ serves both web and mobile users with a Bangla‑first, mobile‑optimized experience.

---

## 🚀 Key Features

### 🌱 Marketplace
- **Product listing** – Farmers post crops with photos, price, quantity, and location.
- **Browse & search** – Filter by category, price range, and location.
- **Order management** – Track status (Pending → Confirmed → Shipped → Delivered).
- **Reviews & ratings** – Buyers rate sellers after delivery.
- **Seller dashboard** – Sales analytics, order history, earnings.

### 🤖 AI-Powered Tools
- **Crop disease detection** – Upload a photo; Gemini Vision identifies disease, severity, and treatment.
- **Bengali AI chatbot** – Ask farming questions in Bangla; Groq Llama 3 provides contextual advice.
- **Weather advisory** – Location‑based crop‑specific recommendations.
- **Market price prediction** – AI suggests optimal selling time based on historical data.
- **PDF report generation** – Download AI‑generated crop analysis summaries.

### 💬 Real‑Time Communication
- **Buyer‑seller chat** – Instant messaging via Socket.io.
- **Order updates** – Live status notifications.
- **Push notifications** – Alerts for price changes, disease warnings, and order events.

### 💳 Payments
- **SSLCommerz** – Cards, mobile banking, net banking.
- **bKash & Nagad** – Mobile wallet payments for rural farmers.

### 👤 Role‑Based Dashboards
- **Farmer** – Manage products, orders, farm profile, AI chat, disease detection.
- **Buyer** – Browse marketplace, place orders, chat with sellers.
- **Admin** – Manage users, listings, market prices, disputes, and analytics.

### 📱 Cross‑Platform
- **Web** – Next.js 16 (App Router) with a Bangla‑first, mobile‑responsive design.
- **Mobile** – React Native / Expo (planned) with camera scanning, GPS, and push notifications.

---

## 🛠️ Technology Stack

### Frontend (Web)
| Library / Tool          | Purpose                             |
|-------------------------|-------------------------------------|
| **Next.js 16**          | App Router, SSR, Server Actions     |
| **TypeScript**          | Type‑safe development               |
| **Tailwind CSS**        | Utility‑first styling               |
| **shadcn/ui**           | Accessible UI components            |
| **TanStack Query**      | Server‑state caching, sync          |
| **Zustand**             | Client‑state management             |
| **React Hook Form + Zod**| Form handling & validation          |
| **Socket.io Client**    | Real‑time chat & notifications      |
| **Sonner**              | Toast notifications                 |
| **lucide-react**        | Icon set                            |
| **next-themes**         | Dark mode (light/dark/system)       |
| **Recharts**            | Charts for analytics                |
| **Leaflet.js**          | Interactive farm maps               |

### Backend (API)
| Library / Tool          | Purpose                             |
|-------------------------|-------------------------------------|
| **NestJS**              | Modular, enterprise‑grade Node.js   |
| **Prisma ORM**          | Type‑safe database access           |
| **PostgreSQL**          | Primary relational database         |
| **JWT + Passport.js**   | Access/refresh token rotation       |
| **Socket.io**           | WebSocket gateway                   |
| **BullMQ + Redis**      | Background job queue                |
| **Swagger**             | Auto‑generated API docs             |
| **Cloudinary**          | Image upload & CDN                  |
| **SSLCommerz / bKash**  | Payment gateways                    |

### AI Service
| Library / Tool          | Purpose                             |
|-------------------------|-------------------------------------|
| **FastAPI**             | High‑performance async Python API   |
| **Google Gemini Vision**| Crop disease detection from images  |
| **Groq Llama 3**        | Bengali AI chatbot inference        |
| **Pillow**              | Image preprocessing                 |

### DevOps & Infrastructure
| Tool                    | Purpose                             |
|-------------------------|-------------------------------------|
| **Turborepo**           | Monorepo build system               |
| **Docker**              | Containerized local development     |
| **GitHub Actions**      | CI/CD (lint, test, build, deploy)   |
| **Vercel**              | Web frontend hosting                |
| **Koyeb**               | NestJS + FastAPI hosting            |
| **Supabase**            | PostgreSQL database                 |
| **Upstash**             | Serverless Redis                    |

---

## 📁 Project Structure (Monorepo)

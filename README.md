# School Management System

A comprehensive, production-ready School Management System built with React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Node.js, Express, Prisma ORM, and Supabase PostgreSQL.

## Architecture

- **Frontend (`client/`)**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod, Recharts, Lucide React.
- **Backend (`server/`)**: Node.js, Express, TypeScript, Prisma ORM, Zod, JWT, Socket.IO, BullMQ.
- **Database (`shared/` & Supabase)**: PostgreSQL hosted on Supabase with Row Level Security (RLS), Prisma migrations, Redis caching.

## Features

- Multi-tenant school management supporting primary, secondary, and multi-campus institutions.
- 14 user roles with granular permission-based access control (Super Admin down to Students and Parents).
- Student Information System (registration, attendance, medical, discipline).
- Academic Administration (curriculum, timetable, homework, examinations, report cards).
- Financial Management (fee structures, invoicing, payment tracking, M-Pesa integration).
- Library & Transport Management.
- Real-time communication & notifications.

## Getting Started

See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for detailed setup instructions.

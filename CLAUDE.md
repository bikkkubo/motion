# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project goal
- Minimal Motion-like scheduler (GCal sync + time-blocking)

# Stack
- Web: Next.js 14 / TS / React-Big-Calendar
- DB+Auth: Supabase (PostgreSQL RLS)
- Solver: FastAPI + OR-Tools

# Coding guidelines
- Use ES Modules, PEP 8, TailwindCSS

# Tasks
- 0️⃣ scaffold repo, 1️⃣ Supabase schema, 2️⃣ GCal OAuth, 3️⃣ diff-sync webhook,
  4️⃣ OR-Tools microservice, 5️⃣ wire UI

## Repository Status

This is a new repository being set up for a Motion-like scheduling application.

## Getting Started

Initial setup steps:
1. Scaffold Next.js 14 application with TypeScript
2. Set up Supabase project and configure database schema
3. Initialize FastAPI microservice for OR-Tools solver
4. Configure development environment

## Development Commands

Commands will be added here once the project structure is established.

## Architecture

Multi-service architecture:
- Frontend: Next.js web application with React-Big-Calendar
- Backend: Supabase for database and authentication
- Scheduler: FastAPI microservice with OR-Tools optimization
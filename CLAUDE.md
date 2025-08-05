# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a product showcase website with admin management system. Users can manage product categories (with 2-level hierarchy) and products through an admin panel, while the frontend displays products for public viewing.

## Development Commands

- **Start development server**: `pnpm run dev` (uses Turbopack for faster builds)
- **Build for production**: `pnpm run build`
- **Start production server**: `pnpm start`
- **Lint code**: `pnpm run lint`
- **Database commands**:
  - `pnpm prisma generate` - Generate Prisma client
  - `pnpm prisma db push` - Push schema changes to database
  - `pnpm prisma studio` - Open Prisma Studio
  - `pnpm prisma migrate dev` - Create and apply migrations
  - `pnpm run db:seed` - Initialize sample data
  - `pnpm run test:auth` - Test authentication system
- **Docker commands**:
  - `docker-compose up -d` - Start services in background
  - `docker-compose down` - Stop services
  - `docker-compose logs` - View logs

## Tech Stack

- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript 5
- **Package Manager**: pnpm 8.15.6
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + HTTP-only Cookies
- **Styling**: Tailwind CSS 4 with PostCSS
- **UI Components**: shadcn/ui for admin panel components
- **File Upload**: Local storage with Sharp for image processing
- **Container**: Docker + Docker Compose

## Project Structure

```
src/
├── app/
│   ├── (frontend)/          # Public frontend pages
│   │   ├── page.tsx         # Homepage
│   │   ├── products/        # Product listing and details
│   │   ├── categories/      # Category pages
│   │   └── pages/           # Static pages (about, contact)
│   ├── admin/               # Admin dashboard
│   │   ├── dashboard/       # Admin home
│   │   ├── products/        # Product management
│   │   ├── categories/      # Category management
│   │   └── users/           # User management
│   ├── api/                 # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── products/        # Product CRUD operations
│   │   ├── categories/      # Category CRUD operations
│   │   └── upload/          # File upload handling
│   └── globals.css
├── components/
│   ├── frontend/            # Public site components
│   ├── admin/               # Admin panel components (using shadcn/ui)
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── prisma.ts           # Database connection
│   ├── auth.ts             # Authentication config
│   └── utils.ts            # Utility functions
├── types/                   # TypeScript type definitions
└── uploads/                 # Local file storage
```

## Database Schema

### Key Models
- **User**: Admin users with role-based access (SUPER_ADMIN, ADMIN)
- **Category**: Two-level category hierarchy with sorting and status
- **Product**: Products with SEO fields, pricing, and specifications
- **ProductImage**: Multiple images per product with main image designation
- **Page**: Static pages content management

### Important Relations
- Categories have parent-child relationships for 2-level hierarchy
- Products belong to categories (cascading delete)
- Products have multiple images with sorting order
- Users have role-based permissions

## Key Features

### Admin Panel
- User management with role-based access
- Category management (2-level hierarchy, sorting, enable/disable)
- Product management (CRUD, multiple images, SEO fields)
- Static page management
- File upload with image processing

### Frontend
- Product showcase with category filtering
- Search and filter functionality
- Responsive design for mobile/desktop
- SEO-optimized pages
- Static pages (about, contact)

### Authentication
- Admin-only access to management panel
- JWT tokens stored in HTTP-only cookies
- Protected API routes and middleware
- Simple login/logout system

## Development Notes

- All images are stored locally in `/uploads` directory
- Image thumbnails are generated automatically
- Category deletion cascades to products
- SEO fields are optional but recommended
- Mobile-first responsive design approach

## UI Components

### shadcn/ui for Admin Panel
- All admin panel components use shadcn/ui components for consistency and accessibility
- Common components: Button, Input, Table, Dialog, Form, Card, Badge, Select, Textarea
- Components are located in `src/components/ui/` directory
- Use `pnpm dlx shadcn@latest add [component-name]` to add new components
- Admin-specific compositions are in `src/components/admin/` directory
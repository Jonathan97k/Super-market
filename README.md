# SuperMarket E-Commerce Platform

A production-ready, white-label supermarket e-commerce platform built with Next.js 15, TypeScript, Tailwind CSS, and Supabase. Designed for enterprise-grade deployment with comprehensive SEO, performance optimization, and multi-client branding capabilities.

## 🚀 Features

### Customer Experience
- **Product Catalog**: Browse and search products with advanced filtering
- **Shopping Cart**: Add to cart, manage quantities, and checkout
- **Categories**: Organized product categories with hierarchical structure
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **PWA Support**: Installable mobile app experience
- **Offline Support**: Basic functionality when offline

### Admin Dashboard
- **Product Management**: Create, edit, and manage products
- **Category Management**: Organize product categories
- **Order Management**: Track and manage customer orders
- **Promotion Management**: Create and manage discounts and promotions
- **Analytics Dashboard**: View sales analytics and insights
- **User Management**: Manage customer accounts
- **White-Label Settings**: Complete branding customization
- **Store Configuration**: Business hours, delivery settings, contact info

### Production Features
- **SEO Optimization**: Dynamic metadata, sitemaps, structured data
- **Performance Hardening**: Code splitting, lazy loading, caching
- **Security**: Headers, validation, rate limiting ready
- **Error Handling**: 404/500 pages, network fallback, maintenance mode
- **Loading Experience**: Skeletons, route transitions, global loader
- **White-Label Engine**: Dynamic theming and branding system

### Technical Features
- **Enterprise Architecture**: Scalable and maintainable codebase
- **TypeScript**: Full type safety throughout the application
- **State Management**: Zustand for efficient state management
- **API Integration**: Supabase for backend services
- **Route Groups**: Clean separation of admin and customer routes
- **Micro-interactions**: Premium UI animations and transitions

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Form Validation**: Zod
- **UI Components**: Radix UI + Custom components
- **Icons**: Lucide React

## 📁 Project Structure

```
app/
  (store)/           # Customer-facing routes
    page.tsx         # Homepage
    products/        # Product listing and details
    categories/      # Category browsing
    cart/           # Shopping cart
  (admin)/          # Admin dashboard routes
    login/          # Admin login
    dashboard/      # Main dashboard
    products/       # Product management
    categories/     # Category management
    promotions/     # Promotion management
    analytics/      # Analytics dashboard

components/
  layout/           # Layout components (navbar, footer, etc.)
  home/            # Homepage specific components
  products/        # Product-related components
  cart/           # Shopping cart components
  admin/          # Admin dashboard components
  ui/             # Reusable UI components

lib/               # Utility functions and configurations
store/             # Zustand state management
types/             # TypeScript type definitions
hooks/             # Custom React hooks
services/          # API service layers
styles/            # Global styles
public/            # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Configure your Supabase credentials in `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🚀 Production Deployment

### Quick Start
1. Follow the [DEPLOYMENT.md](./DEPLOYMENT.md) guide for step-by-step deployment
2. Use the [CLIENT_GUIDE.md](./CLIENT_GUIDE.md) for store management
3. Configure white-label branding in admin settings

### Deployment Checklist
- [ ] Set up Supabase project and run migrations
- [ ] Configure environment variables
- [ ] Deploy to Vercel or preferred platform
- [ ] Set up custom domain and SSL
- [ ] Configure SEO metadata and sitemaps
- [ ] Test all features and performance
- [ ] Set up monitoring and analytics

### Performance Targets
- **Lighthouse Score**: 95+ in all categories
- **Page Load**: < 2 seconds on 3G
- **First Contentful Paint**: < 1.5 seconds
- **Time to Interactive**: < 3 seconds

### White-Label Setup
Each client can fully customize:
- Store name, logo, and branding colors
- Contact information and social links
- Business hours and delivery settings
- Currency and pricing
- Custom CSS and themes

## 🏗️ Architecture

### Route Groups
- `(store)` - Customer-facing routes with public layout
- `(admin)` - Admin routes with authentication and admin layout

### State Management
- `cart-store.ts` - Shopping cart state
- `ui-store.ts` - UI state (modals, loading, etc.)
- `admin-store.ts` - Admin authentication and permissions

### Services Layer
- Clean separation of API calls in service classes
- Type-safe Supabase queries
- Error handling and data transformation

### Component Architecture
- Atomic design principles
- Reusable UI components
- Feature-specific component groups

## 🔧 Development

### Code Style
- TypeScript strict mode enabled
- ESLint and Prettier configured
- Consistent naming conventions
- Path aliases configured for clean imports

### Database Schema
The application uses Supabase with the following main tables:
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Customer orders
- `promotions` - Discount codes and promotions
- `users` - User accounts

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Digital Ocean

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

Built with ❤️ for modern e-commerce experiences

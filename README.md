# MORJAL Enterprises - Premium Electrical Safety E-Commerce Website

A complete, production-ready e-commerce website for MORJAL Enterprises, built with Next.js, TypeScript, Tailwind CSS, Prisma, and NextAuth.

## Features

- **Premium Design**: Professional industrial electrical safety brand identity
- **Product Management**: Full CRUD operations for products with image galleries
- **Shopping Cart**: Client-side cart with quantity management
- **Checkout**: Complete checkout with form validation
- **Payment Integration**: Razorpay for online payments (ready to configure)
- **COD Support**: Cash on Delivery option
- **Admin Panel**: Secure admin dashboard for managing products, banners, and orders
- **Authentication**: NextAuth-based admin authentication
- **Responsive Design**: Mobile-first, responsive across all devices
- **SEO Optimized**: Meta tags, structured data ready
- **Database**: SQLite with Prisma ORM (easily switchable to PostgreSQL)

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (Prisma ORM)
- **Authentication**: NextAuth.js
- **Payment**: Razorpay (integration ready)
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MORJAL3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add the following variables:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Razorpay (add your credentials)
   RAZORPAY_KEY_ID="your-razorpay-key-id"
   RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
   RAZORPAY_WEBHOOK_SECRET="your-razorpay-webhook-secret"
   
   # Shiprocket (add your credentials)
   SHIPROCKET_EMAIL="your-shiprocket-email"
   SHIPROCKET_PASSWORD="your-shiprocket-password"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Create the first admin account**
   
   Run the seed script to create an admin user:
   ```bash
   node scripts/seed-admin.js
   ```
   
   This will create an admin user with:
   - Email: admin@morjal.com
   - Password: admin123
   
   **Important**: Change the password after first login!

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
MORJAL3/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── admin/            # Admin panel pages
│   │   ├── products/         # Product pages
│   │   ├── cart/             # Shopping cart
│   │   ├── checkout/         # Checkout page
│   │   └── [policy-pages]/   # Static policy pages
│   ├── components/           # React components
│   │   ├── ui/               # UI components (Button, Card, etc.)
│   │   ├── header.tsx        # Site header
│   │   ├── footer.tsx        # Site footer
│   │   ├── hero-carousel.tsx # Homepage carousel
│   │   └── product-card.tsx  # Product card component
│   ├── lib/                  # Utility functions
│   │   ├── prisma.ts         # Prisma client
│   │   ├── auth.ts           # NextAuth configuration
│   │   └── utils.ts          # Helper functions
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── .env.example             # Environment variables template
├── package.json             # Dependencies
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind configuration
└── next.config.js          # Next.js configuration
```

## Admin Panel

Access the admin panel at `/admin/login`

Default credentials (after running seed script):
- Email: admin@morjal.com
- Password: admin123

### Admin Features

- **Dashboard**: Overview of orders, products, sales
- **Product Management**: Add, edit, delete products with images
- **Banner Management**: Manage homepage promotional banners
- **Order Management**: View and manage customer orders
- **Settings**: Configure website settings (contact info, social links, etc.)

## Database Schema

The application uses the following main models:

- **Admin**: Admin users for authentication
- **Product**: Product information with images
- **ProductImage**: Product image gallery
- **Banner**: Homepage promotional banners
- **Order**: Customer orders with items
- **OrderItem**: Individual items in an order
- **WebsiteSettings**: Configurable website settings
- **Page**: Editable content pages

## Payment Integration

### Razorpay Setup

1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get your API keys from the Razorpay dashboard
3. Add keys to your `.env` file:
   ```env
   RAZORPAY_KEY_ID="your_key_id"
   RAZORPAY_KEY_SECRET="your_key_secret"
   RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
   ```
4. Configure webhook in Razorpay dashboard to point to `/api/razorpay/webhook`

### Cash on Delivery (COD)

COD is enabled by default. To disable:
- Go to Admin Panel → Settings
- Toggle COD availability

## Shipping Integration

### Shiprocket Setup

1. Create a Shiprocket account
2. Get your API credentials
3. Add to `.env`:
   ```env
   SHIPROCKET_EMAIL="your_email"
   SHIPROCKET_PASSWORD="your_password"
   ```
4. Shipping integration is ready to be configured in the admin panel

## Image Upload

Currently, images are stored as URLs in the database. For production:

1. **Cloudinary Integration** (Recommended):
   - Sign up at cloudinary.com
   - Add Cloudinary credentials to `.env`
   - Update image upload API to use Cloudinary SDK

2. **AWS S3 Integration**:
   - Create S3 bucket
   - Add AWS credentials to `.env`
   - Configure AWS SDK for image uploads

3. **Local Storage** (Development only):
   - Images stored in `public/uploads`
   - Not recommended for production

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

For production database:
- Use PostgreSQL instead of SQLite
- Update `DATABASE_URL` in production
- Run `npx prisma migrate deploy`

### Environment Variables for Production

Required environment variables:
- `DATABASE_URL` (PostgreSQL connection string)
- `NEXTAUTH_SECRET` (generate a secure random string)
- `NEXTAUTH_URL` (your production domain)
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `SHIPROCKET_EMAIL`
- `SHIPROCKET_PASSWORD`

## Development

### Run development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Run linting
```bash
npm run lint
```

### Database operations
```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## SEO

The application includes:
- Dynamic meta tags for products
- Structured data ready for products
- Sitemap generation (add `sitemap.ts` in app directory)
- Robots.txt (add `robots.txt` in public directory)

## Security

- Server-side authentication with NextAuth
- Protected admin routes
- Input validation on all forms
- SQL injection protection via Prisma
- XSS protection via React
- CSRF protection via NextAuth
- Rate limiting recommended for production

## Testing

Before deploying to production:

1. Test all public pages
2. Test product CRUD operations
3. Test cart and checkout flow
4. Test admin authentication
5. Test payment integration (in test mode)
6. Test image uploads
7. Test mobile responsiveness
8. Test all admin panel features

## Support

For issues or questions:
- Email: info@morjalenterprises.com
- Phone: +91 XXXXX XXXXX

## License

Proprietary - MORJAL Enterprises

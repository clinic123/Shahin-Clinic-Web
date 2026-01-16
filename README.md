# Healthcare Management System

A modern, full-stack healthcare management system built with Next.js 16, featuring appointment scheduling, multi-role access control, and secure patient-doctor interactions.

## 🚀 Features

### Core Functionality

- **📅 Appointment Management** - Schedule, confirm, and manage patient appointments
- **👥 Multi-role System** - Admin, Doctor, and Patient roles with granular permissions
- **📧 Email Notifications** - Automated emails for appointments, confirmations, and status updates
- **🔐 Secure Authentication** - Better Auth with email/password and Google OAuth
- **🖼️ Profile Management** - User profiles with Cloudinary image uploads
- **📱 Responsive Design** - Mobile-first responsive interface

### User Roles & Permissions

| Role        | Permissions                                                |
| ----------- | ---------------------------------------------------------- |
| **Admin**   | Full system access, user management, appointment oversight |
| **Doctor**  | Manage appointments, view patient details, update status   |
| **Patient** | Book appointments, view medical history, manage profile    |

## 🛠 Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Reusable component library
- **Framer Motion** - Animations and transitions

### Backend

- **Better Auth** - Authentication & authorization
- **Prisma** - Database ORM with MongoDB
- **MongoDB** - NoSQL database
- **Node.js** - Runtime environment

### Third-party Services

- **Cloudinary** - Image and file management
- **Nodemailer** - Email service integration
- **Google OAuth** - Social authentication

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js v22.18.0+ installed
- MongoDB database (local or Atlas)
- Google OAuth credentials
- Cloudinary account
- Gmail account for SMTP

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority"

# Authentication
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Email
EMAIL_FROM=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_USERNAME=your_email@gmail.com
```

### 4. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Open Application

Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Available Scripts

| Command         | Description                                 |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Start development server with Turbopack     |
| `npm run build` | Generate Prisma client and build production |
| `npm run start` | Start production server                     |
| `npm run lint`  | Run ESLint for code quality                 |

## 📁 Project Structure

```
client/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── appointments/  # Appointment management
│   │   ├── upload/        # File upload endpoints
│   │   └── user/          # User management
│   ├── profile/           # User profile pages
│   ├── appointments/      # Appointment pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/UI components
│   └── forms/            # Form components
├── lib/                  # Utility libraries
│   ├── auth.ts          # Better Auth configuration
│   ├── auth-client.ts   # Client-side auth utilities
│   └── utils.ts         # Helper functions
├── prisma/              # Database schema and client
│   └── schema.prisma    # Prisma schema definition
└── hooks/               # Custom React hooks
```

## 🔐 Authentication Setup

### Better Auth Configuration

The system uses Better Auth for secure authentication:

```typescript
// lib/auth.ts
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mongodb" }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, token }) {
      // Email sending logic
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create credentials (OAuth 2.0 Client IDs)
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

## 📧 Email System

### Nodemailer Configuration

```typescript
// Email templates for various notifications
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};
```

### Gmail SMTP Setup

1. Enable 2-factor authentication on Gmail
2. Generate App Password
3. Use App Password in `SMTP_PASSWORD`

## 🖼 Image Upload System

### Cloudinary Integration

```typescript
// app/api/upload/route.ts
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

### Features

- ✅ Automatic image optimization
- ✅ Secure file validation (5MB max)
- ✅ WebP format conversion
- ✅ Responsive image delivery

## 📊 API Endpoints

### Authentication

| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| POST   | `/api/auth/signup`          | User registration      |
| POST   | `/api/auth/signin`          | User login             |
| POST   | `/api/auth/forgot-password` | Password reset request |
| POST   | `/api/auth/reset-password`  | Password reset         |

### Appointments

| Method | Endpoint                     | Description                   |
| ------ | ---------------------------- | ----------------------------- |
| GET    | `/api/appointments`          | Get appointments (role-based) |
| POST   | `/api/appointments`          | Create new appointment        |
| PUT    | `/api/appointments/confirm`  | Confirm appointment           |
| PUT    | `/api/appointments/complete` | Mark as completed             |
| PUT    | `/api/appointments/cancel`   | Cancel appointment            |

### Users

| Method | Endpoint            | Description          |
| ------ | ------------------- | -------------------- |
| GET    | `/api/user/profile` | Get user profile     |
| PUT    | `/api/user/profile` | Update user profile  |
| POST   | `/api/upload`       | Upload profile image |

## 🔒 Security Features

- **Role-based access control** (RBAC)
- **Input validation** and sanitization
- **Secure password** hashing
- **CSRF protection**
- **XSS prevention**
- **Secure file upload** validation
- **Environment variable** protection

## 🎨 UI/UX Features

- **Responsive design** for all devices
- **Dark/light mode** support
- **Accessible components** (WCAG compliant)
- **Loading states** and error handling
- **Toast notifications**
- **Form validation**
- **Professional healthcare** design

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

```env
DATABASE_URL="your_production_mongodb_url"
BETTER_AUTH_SECRET="your_production_secret"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
# ... other production variables
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting guide
2. Search existing GitHub issues
3. Create a new issue with detailed information

## 📞 Contact

For questions and support:

- Email: tarifalhasanjs@gmail.com
- GitHub Issues: [Create an issue](https://github.com/tarifalhasan/doctor-portal-web/issues)

---

<div align="center">

**Built with ❤️ for the Shaheen's Clinic**

[Documentation](https://tarifalhasan.vercel.app/) • [Demo](https://doctor-portal-web.vercel.app/) • [Report Bug](https://github.com/tarifalhasan/doctor-portal-web/issues)

</div>
# Shahin-Clinic-Web

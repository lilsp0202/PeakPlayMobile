# PeakPlay - Sports Academy Management Platform

A modern sports academy management platform built with Next.js 14, designed to connect athletes and coaches, streamline profile management, and enhance athletic development.

## 🌟 Features

### Authentication & User Management
- **Secure Authentication**: NextAuth.js integration with credentials provider
- **Role-Based Access**: Separate dashboards for Athletes and Coaches
- **Username System**: Personalized user experience with unique usernames
- **Profile Management**: Comprehensive onboarding flows for both user types

### Athlete Features
- **Comprehensive Profiles**: Name, age, height, weight, academy, and playing role
- **Role Specialization**: Support for Batsman, Bowler, All-rounder, and Wicket Keeper
- **Academy Integration**: Connect with coaches from the same academy
- **Performance Tracking**: Foundation for future analytics and progress monitoring

### Coach Features
- **Coach Dashboards**: Dedicated interface for managing athletes
- **Student Selection**: Browse and select athletes from the same academy
- **Assignment Management**: Assign students to coaching supervision
- **Academy Management**: Organize athletes by academy affiliation

### Database Structure
- **User Management**: Secure user accounts with role-based permissions
- **Student Records**: Comprehensive athlete data with User ID foreign keys
- **Coach Profiles**: Coach information with student relationship management
- **Academy Organization**: Students and coaches grouped by academy

## 🚀 Technology Stack

- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS for modern, responsive design
- **Database**: Prisma ORM with SQLite (development) / PostgreSQL (production)
- **Authentication**: NextAuth.js with secure session management
- **Deployment**: Vercel-ready with environment configuration

## 📦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sports-app-prototype
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 🎯 Usage Guide

### For Athletes
1. **Sign Up**: Create an account and select "Athlete" role
2. **Complete Profile**: Fill out your athletic information during onboarding
3. **Dashboard Access**: View your profile and academy information
4. **Coach Assignment**: Get assigned to coaches from your academy

### For Coaches
1. **Sign Up**: Create an account and select "Coach" role  
2. **Complete Profile**: Set up your coaching profile with academy information
3. **Student Management**: Browse available athletes from your academy
4. **Assignment**: Select and assign athletes to your coaching supervision
5. **Monitor Progress**: View detailed information about your assigned athletes

## 🗄️ Database Schema

### Core Models
- **User**: Authentication and role management with usernames
- **Student**: Comprehensive athlete profiles with academy relationships
- **Coach**: Coach profiles with student assignment capabilities
- **Relationships**: Proper foreign key relationships between users, students, and coaches

### Key Fields
- **Student Records**: User ID (FK), Student ID (PK), name, username, email, physical stats, academy, role
- **Coach Records**: User ID (FK), Coach ID (PK), name, username, email, academy
- **Academy Grouping**: Students and coaches organized by academy affiliation

## 🔍 Database Viewing

### Using Prisma Studio
```bash
npx prisma studio
```
Access the web interface at [http://localhost:5555](http://localhost:5555)

### Direct Database Access
```bash
# View tables
sqlite3 prisma/dev.db ".tables"

# Query users
sqlite3 prisma/dev.db "SELECT * FROM User;"

# Query students
sqlite3 prisma/dev.db "SELECT * FROM Student;"

# Query coaches  
sqlite3 prisma/dev.db "SELECT * FROM Coach;"
```

## 🚀 Deployment

### Vercel Deployment
1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect Vercel**: Link your repository to Vercel
3. **Environment Variables**: Add production environment variables
4. **Database**: Configure PostgreSQL for production
5. **Deploy**: Automatic deployment on push to main branch

### Production Environment Variables
```env
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-production-secret"
```

## 🛠️ Development

### Project Structure
```
src/
├── app/                  # Next.js 14 App Router
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages  
│   ├── dashboard/       # User dashboards
│   └── onboarding/      # Profile setup flows
├── lib/                 # Utility libraries
│   ├── auth.ts         # NextAuth configuration
│   └── prisma.ts       # Database client
└── types/              # TypeScript type definitions
```

### Key API Endpoints
- `POST /api/auth/register` - User registration with username
- `POST /api/student/create` - Create athlete profile
- `POST /api/coach/create` - Create coach profile  
- `GET /api/students/by-academy` - Fetch students by academy
- `POST /api/coach/assign-students` - Assign students to coach

## 🎨 UI/UX Features

### Design Highlights
- **Modern Interface**: Clean, professional design with intuitive navigation
- **Responsive Layout**: Mobile-first design that works on all devices
- **Role-Based Dashboards**: Customized interfaces for athletes and coaches
- **Accessible Forms**: High contrast, readable forms with proper validation
- **Interactive Elements**: Smooth animations and user feedback

### User Experience
- **Personalized Welcome**: Username-based greeting system
- **Progressive Onboarding**: Step-by-step profile completion
- **Real-time Updates**: Immediate feedback on actions and assignments
- **Clear Navigation**: Intuitive flow between different sections

## 🔐 Security Features

- **Secure Authentication**: Password hashing with bcrypt
- **Session Management**: Secure session handling with NextAuth.js
- **Role-Based Access**: Proper authorization checks
- **Data Validation**: Input validation on both client and server
- **SQL Injection Protection**: Prisma ORM prevents SQL injection attacks

## 📈 Future Enhancements

### Planned Features
- **Performance Analytics**: Track athlete progress and statistics
- **Communication Tools**: In-app messaging between coaches and athletes
- **Training Plans**: Create and assign personalized training programs
- **Event Management**: Schedule and manage academy events and competitions
- **Parent Portal**: Allow parents to view their child's progress
- **Multi-Academy Support**: Support for coaches managing multiple academies

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live data updates
- **File Upload**: Profile pictures and document management
- **Notification System**: Email and in-app notifications
- **Mobile App**: React Native companion app
- **Advanced Analytics**: Data visualization and reporting tools

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on how to submit improvements, bug fixes, and new features.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**PeakPlay** - Elevating athletic performance through technology and community.

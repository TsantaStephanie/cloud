# Project-Cloud

A professional road works tracking and reporting application for Antananarivo (Tananarive), Madagascar.

## Features

### Authentication & Authorization
- Secure email/password authentication with Supabase
- Session management with automatic token refresh
- Login attempt tracking with account blocking after 5 failed attempts
- Automatic account unblock after 15 minutes
- Three user roles:
  - **Visitor**: Can view reports without an account
  - **User**: Can create and manage their own reports
  - **Manager**: Can manage all reports and update their status

### Interactive Map
- Real-time map of Antananarivo using Leaflet and OpenStreetMap
- Click-to-select location for new reports
- Color-coded markers based on report status:
  - Red: Reported
  - Amber: In Progress
  - Green: Completed
  - Gray: Rejected
- Priority indicators using emojis:
  - Low, Medium, High, Urgent

### Reporting System
- Create detailed road work reports with location, description, and priority
- View all reports on an interactive map
- Filter reports by status
- Real-time updates using Supabase subscriptions
- Managers can update report status and delete reports

### User Profile Management
- Update personal information (name, phone)
- View account details and role
- Secure profile updates with proper authentication

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Maps**: Leaflet, OpenStreetMap
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.tsx      # Navigation bar
│   ├── MapView.tsx     # Interactive map component
│   └── ReportModal.tsx # Report creation modal
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/               # Utilities and configurations
│   └── supabase.ts    # Supabase client
├── pages/             # Main application pages
│   ├── Home.tsx       # Public landing page
│   ├── Login.tsx      # Login page
│   ├── Register.tsx   # Registration page
│   ├── Dashboard.tsx  # Main dashboard
│   └── Profile.tsx    # User profile page
├── types/             # TypeScript type definitions
│   └── database.ts    # Database types
├── App.tsx            # Main app component
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## Database Schema

### Tables

1. **profiles**
   - User profile information
   - Role-based access control
   - References auth.users

2. **reports**
   - Road work reports
   - Location data (latitude, longitude)
   - Status and priority tracking

3. **login_attempts**
   - Track failed login attempts
   - Automatic account blocking
   - Timed unblocking

### Security

- Row Level Security (RLS) enabled on all tables
- Policies enforce role-based access control
- Users can only modify their own data
- Managers have elevated permissions

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Update `.env` with your Supabase credentials
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Key Features Implemented

### Authentication
- Secure login with session management
- Registration with automatic profile creation
- Login attempt tracking with automatic blocking
- Protected routes for authenticated users

### Map Integration
- Interactive Leaflet map centered on Antananarivo
- Click-to-select location functionality
- Reverse geocoding for location names
- Custom markers with status colors and priority indicators

### Reporting
- Create reports with title, description, priority, and location
- View all reports on the map
- Filter reports by status
- Managers can update status and delete reports

### User Management
- Profile viewing and editing
- Role-based access control
- Account information display

## Design Features

- Clean, modern interface with gradient accents
- Responsive design for all screen sizes
- Smooth transitions and hover effects
- Professional color scheme using blues and grays
- Intuitive navigation and user flow
- Loading states and error handling
- Form validation and user feedback

## Security Features

- Row Level Security on all database tables
- Session-based authentication
- Protected API routes
- Input validation
- XSS protection
- CSRF protection via Supabase

## Future Enhancements

- Email notifications for report updates
- Image upload for reports
- Advanced filtering and search
- Analytics dashboard for managers
- Mobile app version
- Export reports to PDF/CSV
- Real-time notifications

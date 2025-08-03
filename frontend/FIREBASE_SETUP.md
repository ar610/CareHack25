# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for your CareHack25 application.

## Prerequisites

- A Google account
- Node.js and npm installed

## Step 1: Enable Firebase Authentication

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account
   - Select your "cicadaauth" project

2. **Enable Authentication**
   - In the left sidebar, click "Authentication"
   - Click "Get started"
   - Go to the "Sign-in method" tab
   - Click on "Email/Password"
   - Toggle the switch to "Enable"
   - Click "Save"

## Step 2: Set up Firestore Database

1. **Create Database**
   - In the left sidebar, click "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location close to your users
   - Click "Done"

2. **Set Security Rules**
   - In Firestore Database, go to the "Rules" tab
   - Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 3: Test the Setup

1. **Run your application**
   ```bash
   npm run dev
   ```

2. **Test Registration**
   - Go to your app
   - Click "Get Started"
   - Try registering as both a doctor and patient
   - Check Firebase Console > Authentication > Users to see if users were created

3. **Test Login**
   - Try logging in with registered credentials
   - Verify role-based navigation works

## Troubleshooting

### Common Issues

1. **"CONFIGURATION_NOT_FOUND" Error**
   - **Solution**: Make sure Authentication is enabled in Firebase Console
   - Go to Authentication > Sign-in method > Email/Password > Enable

2. **"Permission denied" Error**
   - **Solution**: Check Firestore security rules
   - Make sure rules allow authenticated users to read/write their own data

3. **Users not appearing in Firestore**
   - **Solution**: Check browser console for errors
   - Verify Firestore is enabled and rules are correct

## Features

### Authentication
- Email/password authentication
- Role-based access (Doctor/Patient)
- Protected routes
- Automatic session management

### User Roles

#### Doctor
- Medical license verification
- Access to patient data
- Professional dashboard
- Chat with patients

#### Patient
- Personal health records
- Symptom tracking
- Appointment management
- Chat with AI assistant

### Security
- Firebase Authentication
- Firestore security rules
- Role-based route protection
- Secure data access

## File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Authentication context
├── components/
│   ├── AuthPage.tsx             # Login/Registration
│   ├── ProtectedRoute.tsx       # Route protection
│   └── ...                      # Other components
├── firebase/
│   └── config.ts                # Firebase configuration
└── App.tsx                      # Main app with auth provider
```

## Usage

1. Users can register as either a doctor or patient
2. Doctors go through a verification process
3. Users are automatically redirected based on their role
4. All routes are protected based on user roles
5. Session persists across browser refreshes

## Support

If you encounter issues:
1. Check Firebase Console for error messages
2. Review browser console for JavaScript errors
3. Verify all configuration values are correct
4. Check Firestore security rules
5. Ensure Authentication is properly enabled

For more help, refer to:
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Console](https://console.firebase.google.com/) 
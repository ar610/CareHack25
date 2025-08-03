import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { Doctor, PatientUser, UserRole } from '../App';

interface AuthContextType {
  currentUser: User | null;
  userProfile: Doctor | PatientUser | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Partial<Doctor | PatientUser>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<Doctor | PatientUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Doctor | PatientUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (email: string, password: string, userData: Partial<Doctor | PatientUser>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      const userProfileData = {
        id: user.uid,
        email: user.email,
        ...userData,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), userProfileData);
      
      // Update local state
      setUserProfile(userProfileData as Doctor | PatientUser);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<Doctor | PatientUser>) => {
    if (!currentUser) return;

    try {
      const updatedProfile = { ...userProfile, ...data };
      await setDoc(doc(db, 'users', currentUser.uid), updatedProfile, { merge: true });
      setUserProfile(updatedProfile as Doctor | PatientUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const fetchUserProfile = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data() as Doctor | PatientUser;
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 
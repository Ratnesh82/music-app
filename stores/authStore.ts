import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  error: null,

  signUp: async (email: string, password: string, displayName: string) => {
    try {
      set({ isLoading: true, error: null });
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      const userProfile: UserProfile = {
        id: user.uid,
        email: user.email!,
        displayName,
        photoURL: `https://api.dicebear.com/7.x/avatars/svg?seed=${user.uid}`,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      set({ user, profile: userProfile, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      const profile = profileDoc.data() as UserProfile;
      
      set({ user, profile, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  signOut: async () => {
    try {
      await signOut(auth);
      set({ user: null, profile: null });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    try {
      const { user, profile } = get();
      if (!user || !profile) return;

      const updatedProfile = { ...profile, ...data };
      await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
      set({ profile: updatedProfile });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));

// Initialize auth state listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const profileDoc = await getDoc(doc(db, 'users', user.uid));
    const profile = profileDoc.data() as UserProfile;
    useAuthStore.setState({ user, profile, isLoading: false });
  } else {
    useAuthStore.setState({ user: null, profile: null, isLoading: false });
  }
});
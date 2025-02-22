import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updatePassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  verifyBeforeUpdateEmail
} from 'firebase/auth';
import { auth } from '../src/config/firebase.config';
import { ref, set, get } from 'firebase/database';
import { db } from '../src/config/firebase.config';
import { Roles } from '../common/roles.enum';

// Basic auth operations
export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

// Email operations
export const initiateEmailChange = async (newEmail) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  // Store pending email change in database
  await set(ref(db, `pendingEmailChanges/${user.uid}`), {
    newEmail,
    timestamp: Date.now()
  });

  // Send verification to new email
  return verifyBeforeUpdateEmail(user, newEmail);
};

export const confirmEmailChange = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  // Check if there's a pending email change
  const pendingRef = ref(db, `pendingEmailChanges/${user.uid}`);
  const snapshot = await get(pendingRef);
  
  if (!snapshot.exists()) {
    throw new Error('No pending email change found');
  }

  // Clear pending email change
  await set(pendingRef, null);
};

// Password operations
export const changePassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  // Reauthenticate user before password change
  try {
    await signInWithEmailAndPassword(auth, user.email, currentPassword);
    return updatePassword(user, newPassword);
  } catch (error) {
    if (error.code === 'auth/wrong-password') {
      throw new Error('Current password is incorrect');
    } else {
      // Rethrow the original error for other cases
      throw error;
    }
  }
};

export const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};

// Google Authentication
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user profile exists in the database
    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      // Create a new user profile if it doesn't exist
      await set(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: Roles.user,
        createdAt: Date.now()
      });
    }

    // Return user data
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  } catch (error) {
    throw new Error(`Google sign-in failed: ${error.message}`);
  }
};

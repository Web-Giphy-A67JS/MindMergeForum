import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../src/config/firebase.config';
import { auth } from '../src/config/firebase.config';
import { updateProfile } from 'firebase/auth';
import { ref as dbRef, update } from 'firebase/database';
import { db } from '../src/config/firebase.config';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const uploadProfilePhoto = async (file) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  // Validate file
  if (!file) throw new Error('No file provided');
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 2MB.');
  }

  try {
    // Create a reference to the file location
    const fileRef = ref(storage, `profilePhotos/${user.uid}`);

    // If user already has a profile photo, delete it
    try {
      await deleteObject(fileRef);
    } catch (error) {
      // Ignore error if no existing file
      if (error.code !== 'storage/object-not-found') {
        throw error;
      }
    }

    // Upload new file
    await uploadBytes(fileRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(fileRef);

    // Update user profile and database
    await Promise.all([
      updateProfile(user, {
        photoURL: downloadURL
      }),
      update(dbRef(db, `users/${user.uid}`), {
        photoURL: downloadURL
      })
    ]);

    return downloadURL;
  } catch (error) {
    throw new Error(`Failed to upload profile photo: ${error.message}`);
  }
};

export const deleteProfilePhoto = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  try {
    const fileRef = ref(storage, `profilePhotos/${user.uid}`);
    await deleteObject(fileRef);

    // Update user profile and database
    await Promise.all([
      updateProfile(user, {
        photoURL: null
      }),
      update(dbRef(db, `users/${user.uid}`), {
        photoURL: null
      })
    ]);
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      throw new Error('No profile photo found');
    }
    throw new Error(`Failed to delete profile photo: ${error.message}`);
  }
};

// Helper function to get image dimensions
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
};

// Validate image dimensions
export const validateImage = async (file) => {
  const dimensions = await getImageDimensions(file);
  const minDimension = 200; // Minimum width/height
  const maxDimension = 2048; // Maximum width/height

  if (dimensions.width < minDimension || dimensions.height < minDimension) {
    throw new Error(`Image dimensions too small. Minimum size is ${minDimension}x${minDimension}px`);
  }

  if (dimensions.width > maxDimension || dimensions.height > maxDimension) {
    throw new Error(`Image dimensions too large. Maximum size is ${maxDimension}x${maxDimension}px`);
  }

  return dimensions;
};
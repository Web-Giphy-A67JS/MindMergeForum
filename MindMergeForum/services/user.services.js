import { get, set, ref, query, equalTo, orderByChild, update } from 'firebase/database';
import { db } from '../src/config/firebase.config';

export const getUserByHandle = async (handle) => {

   const snapshot = await get(ref(db, `users/${handle}`));
   if(snapshot.exists){
     return snapshot.val();
   }

};

export const createUserHandle = async (handle, uid, email, firstName, lastName, phone, role) => {
  const user = {
      handle,
      uid,
      email,
      firstName,
      lastName,
      phone,
      createdOn: new Date().toString(),
      role,
  };

  await set(ref(db, `users/${handle}`), user);
};

export const getUserData = async (uid) => {

    const snapshot = await get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
    if(snapshot.exists){
        return snapshot.val();
      }

};

export const getTotalUsers = async () => {
  const snapshot = await get(ref(db, 'users'));
  if (snapshot.exists()) {
    return Object.keys(snapshot.val()).length;
  }
  return 0;
};

export const getAllUsers = async (search='') => {
  const snapshot = await get(ref(db, 'users'));
  if (snapshot.exists()) {
    if(search){
      const users = Object.values(snapshot.val());
      return users.filter(user=>user.handle.toLowerCase().includes(search.toLowerCase()))
    }
    return Object.values(snapshot.val());
  }
  return {};
};

export const getAllUsersByEmail = async (search='') => {
  const snapshot = await get(ref(db, 'users'));
  if (snapshot.exists()) {
    if(search){
      const users = Object.values(snapshot.val());
      return users.filter(user=>user.email.toLowerCase().includes(search.toLowerCase()))
    }
    return Object.values(snapshot.val());
  }
  return {};
};

export const getUserById = async (uid) => {
  const snapshot = await get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
  if (snapshot.exists()) {
    const users = snapshot.val();
    const userId = Object.keys(users)[0];
    return users[userId];
  }
  return null;
};

export const updateUserRole = async (uid, newRole) => {
  const snapshot = await get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
  if (snapshot.exists()) {
    const userKey = Object.keys(snapshot.val())[0];
    await update(ref(db, `users/${userKey}`), { role: newRole });
  } else {
    throw new Error('User not found');
  }
};
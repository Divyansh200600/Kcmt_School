import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

export const getUserRole = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data().role; // assuming role is stored as 'role' in the user document
  } else {
    return null; // If no role is found, return null
  }
};

import { auth, db } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

async function createAdminUser(email: string, password: string) {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Create the user document in Firestore with admin privileges
    await setDoc(doc(db, 'users', uid), {
      email,
      isAdmin: true,
      createdAt: new Date().toISOString(),
    });

    console.log('Admin user created successfully');
    return uid;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

// You can call this function with your admin credentials
// Example: createAdminUser('admin@church.com', 'securepassword'); 
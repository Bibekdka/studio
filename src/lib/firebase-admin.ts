
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : {};

const adminApp = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
    })
  : getApp();

const dbAdmin = getFirestore(adminApp);

export { adminApp, dbAdmin };

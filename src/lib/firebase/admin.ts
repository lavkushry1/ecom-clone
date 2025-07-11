// Firebase Admin Configuration (Server-side only)
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const adminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
}

// Initialize Firebase Admin
const adminApp = getApps().find(app => app.name === 'admin') || initializeApp(adminConfig, 'admin')

// Export Firebase Admin services
export const adminDb = getFirestore(adminApp)
export const adminAuth = getAuth(adminApp)
export default adminApp

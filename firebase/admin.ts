// lib/firebase/admin.ts
import * as admin from "firebase-admin";

interface FirebaseAdminParams {
    projectId: string;
    clientEmail: string;
    storageBucket: string;
    privateKey: string;
}

/**
 * Formats the private key so it works when loaded from environment variables
 */
function formatPrivateKey(key: string) {
    return key.replace(/\\n/g, "\n");
}

/**
 * Creates or returns an existing Firebase Admin app instance
 */
function createFirebaseAdminApp(params: FirebaseAdminParams) {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    return admin.initializeApp({
        credential: admin.credential.cert({
            projectId: params.projectId,
            clientEmail: params.clientEmail,
            privateKey: formatPrivateKey(params.privateKey),
        }),
        projectId: params.projectId,
        storageBucket: params.storageBucket,
    });
}

// ---- Automatic Initialization ----
const params: FirebaseAdminParams = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
    privateKey: process.env.FIREBASE_PRIVATE_KEY as string,
};

createFirebaseAdminApp(params);

// ---- Ready-to-use Exports ----
export const adminDB = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
export default admin;

import admin from "firebase-admin";
import { getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const serviceAccount = require("./nmd-lms-7ae00-firebase-adminsdk-fbsvc-10fbdcd7bb.json")

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

// export const authAdmin = getAuth(getApps()[0]);
export const adminAuth = admin.auth();
export const adminDB = admin.firestore();
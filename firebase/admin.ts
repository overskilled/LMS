import admin from "firebase-admin";

const serviceAccount = require("./nmd-lms-7ae00-firebase-adminsdk-fbsvc-10fbdcd7bb.json")

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export const adminAuth = admin.auth();
export const adminDB = admin.firestore();
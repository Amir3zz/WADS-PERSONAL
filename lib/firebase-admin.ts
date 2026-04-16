import admin from "firebase-admin";

let adminApp: admin.app.App;

export function getAdminApp() {
  if (!admin.apps.length) {
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY
    ) {
      throw new Error("Missing Firebase Admin environment variables");
    }

    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    adminApp = admin.app();
  }

  return adminApp;
}

export const adminAuth = () => getAdminApp().auth();
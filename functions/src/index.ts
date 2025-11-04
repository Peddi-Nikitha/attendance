import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initialize Admin SDK once
try {
  admin.app();
} catch {
  admin.initializeApp();
}

function assertString(name: string, v: any) {
  if (typeof v !== 'string' || v.trim() === '') {
    throw new functions.https.HttpsError('invalid-argument', `${name} is required`);
  }
}

export const createEmployeeUser = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    // Optionally restrict to authenticated admins only (uncomment when you add custom claims)
    // if (!context.auth?.token?.admin) {
    //   throw new functions.https.HttpsError('permission-denied', 'Only admins can create employees');
    // }

    assertString('name', data?.name);
    assertString('email', data?.email);
    assertString('password', data?.password);
    assertString('department', data?.department);
    const role = (data?.role as string) === 'admin' ? 'admin' : 'employee';

    const name: string = data.name.trim();
    const email: string = data.email.trim().toLowerCase();
    const password: string = data.password as string;
    const department: string = data.department.trim();

    // 1) Create Auth user
    const user = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      disabled: false,
    });

    // 2) Optionally set admin claim
    if (role === 'admin') {
      await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    }

    // 3) Create Firestore employee document
    const db = admin.firestore();
    const employeeId = `EMP-${user.uid.substring(0, 8).toUpperCase()}`;
    const now = admin.firestore.FieldValue.serverTimestamp();
    // DJB2 deterministic hash (must match frontend)
    let h = 5381 >>> 0;
    for (let i = 0; i < password.length; i++) {
      h = (((h << 5) + h) + password.charCodeAt(i)) >>> 0;
    }
    const passwordHash = h.toString(16);

    await db.collection('employees').doc(user.uid).set({
      userId: user.uid,
      employeeId,
      name,
      email,
      department,
      role,
      passwordHash,
      joinDate: new Date().toISOString().split('T')[0],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // 4) Optionally create a user profile document (uncomment if your app reads it)
    // await db.collection('users').doc(user.uid).set({
    //   id: user.uid,
    //   email,
    //   name,
    //   role,
    //   department,
    //   isActive: true,
    //   createdAt: now,
    //   updatedAt: now,
    // });

    return { uid: user.uid };
  });



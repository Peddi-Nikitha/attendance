# Deploy Firestore Security Rules

## Quick Deployment Guide

### Prerequisites

1. Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Logged in to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase (if not done):
   ```bash
   firebase init
   ```
   - Select: Firestore, Storage
   - Use existing project: `attendaceapp-9e768`
   - Use default file names

### Deploy Security Rules

#### 1. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

This will deploy the `firestore.rules` file to your Firebase project.

#### 2. Deploy Storage Rules

```bash
firebase deploy --only storage
```

This will deploy the `storage.rules` file to your Firebase Storage.

#### 3. Deploy Everything

```bash
firebase deploy
```

This will deploy both Firestore and Storage rules.

### Verify Deployment

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `attendaceapp-9e768`
3. Navigate to **Firestore Database** → **Rules** tab
4. Verify the rules match `firestore.rules`
5. Navigate to **Storage** → **Rules** tab
6. Verify the rules match `storage.rules`

## Testing Rules

### Option 1: Firebase Console Rules Simulator

1. Go to Firebase Console → Firestore → Rules
2. Click on "Rules playground" or use the simulator
3. Test different scenarios:
   - Authenticated admin user
   - Authenticated employee user
   - Unauthenticated user

### Option 2: Firebase Emulator

1. Install emulator:
   ```bash
   firebase init emulators
   ```

2. Start emulator:
   ```bash
   firebase emulators:start
   ```

3. Test rules using the emulator UI (usually at http://localhost:4000)

## Common Issues

### Issue: "Permission denied" after deployment

**Solution:**
- Verify user document exists in `users` collection
- Check user's role field is set correctly
- Ensure employee document exists for employee users

### Issue: Rules not updating

**Solution:**
- Wait a few seconds for propagation
- Clear browser cache
- Check Firebase Console to confirm deployment

### Issue: Firebase CLI not found

**Solution:**
```bash
npm install -g firebase-tools
```

## Rollback

If rules cause issues, you can rollback:

1. Go to Firebase Console → Firestore → Rules
2. Click on "Release history"
3. Select a previous version
4. Click "Release"

Or deploy a simpler rule set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **Warning:** The above rule allows all authenticated users full access. Use only for testing!

## Next Steps

After deploying rules:
1. ✅ Test with authenticated users
2. ✅ Test with admin users
3. ✅ Test with employee users
4. ✅ Verify unauthorized access is blocked
5. ✅ Monitor Firebase Console for errors

---

**Status**: Rules are ready to deploy!
**Command**: `firebase deploy --only firestore:rules`



# 🚀 Quick Start Guide - SeamClone MVP

**Get the app running in 5 minutes**

## Step 1: Firebase Setup (5 min)

1. Go to https://firebase.google.com and sign in
2. Click "Go to console" and create a new project:
   - Name: `SeamClone`
   - Analytics: OFF (for MVP)
3. Wait for project to initialize
4. In the left menu, click **Authentication** → **Sign-in method**
   - Enable **Email/Password**
5. Click **Firestore Database** → **Create Database**
   - Select: **Start in test mode**
   - Choose location: Your region
6. Go to **Settings** → **Project settings**
7. Scroll down to "SDK setup and configuration"
8. Copy the config object

## Step 2: Update Firebase Config (2 min)

Open `src/services/firebase.ts` and replace:

```typescript
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID",
};
```

## Step 3: Install & Run (3 min)

```bash
cd seamclone
npm install    # Already done, but included for clarity
npm start
```

In the terminal, press:

- `a` for Android emulator
- `i` for iOS simulator
- `w` for web browser

## Step 4: Test the App

1. **Sign Up**
   - Email: `test@example.com`
   - Password: `Test123456`
   - Display name: `Test User`
   - Click "Create Account"

2. **Onboarding**
   - Review the 4 slides
   - Click "Get Started"

3. **Library**
   - Click `+` button to create project
   - Project appears in list

4. **Project Detail**
   - Tap a project card
   - Click "Scan Garment" or "Export & Print"

5. **Logout**
   - Tap "Settings" tab
   - Tap "Logout"

## Screens Overview

```
Login/Signup
    ↓
Onboarding (4 slides)
    ↓
Main App (3 tabs)
├── Library (Project list)
│   └── Project Detail
│       ├── Scanning Interface
│       ├── Rectification
│       ├── Pattern Pieces
│       └── Export Settings
├── New Scan
└── Settings
```

## Common Commands

```bash
npm start           # Start dev server
npm run android     # Run on Android emulator
npm run ios         # Run on iOS simulator
npm run lint        # Check for errors
npm run web         # Run in browser
```

## What Works Now (Phase 1)

- ✅ Sign up and login
- ✅ Create and view projects
- ✅ Navigate through all screens
- ✅ Professional UI mockups
- ✅ Settings and logout

## What's Coming (Phase 2+)

- 🔨 Camera interface with reference object detection
- 🔨 Perspective correction and edge detection
- 🔨 Pattern piece extraction
- 🔨 PDF export and printing

## Troubleshooting

### "Firebase connection error"

- Check your API key is correct in `src/services/firebase.ts`
- Make sure Authentication is enabled in Firebase console
- Verify Firestore is created

### "App won't start"

```bash
npm start -- --clear    # Clear cache
```

### "TypeScript errors"

- Ensure TypeScript version is correct: `npm install -g typescript@5.9`

## Next Phase

When ready to start Phase 2 (Scanning Interface):

1. Install camera libraries
2. Add camera permissions
3. Integrate computer vision

See `IMPLEMENTATION_GUIDE.md` for detailed instructions.

---

**Questions?** Check `PHASE_1_COMPLETE.md` for full documentation.

**Happy coding! 🎉**

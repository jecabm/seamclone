# SeamClone MVP - Phase 1: Foundation Implementation

**Status**: ✅ Complete - Ready for Phase 2 (Scanning Interface)

## Overview

SeamClone is a high-precision technical scanning app for garment manufacturing. Phase 1 focuses on:
- ✅ User authentication (Firebase Auth)
- ✅ Project management (Firestore integration)
- ✅ Onboarding flow with scale reference education
- ✅ Navigation structure (bottom tabs + stack navigation)
- ✅ UI screens for all major user flows

## Tech Stack

- **Frontend**: React Native + TypeScript + Expo
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Navigation**: React Navigation (bottom tabs + native stack)
- **UI**: React Native components + Ionicons

## Project Structure

```
seamclone/
├── src/
│   ├── screens/              # All screen components
│   │   ├── LoginScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── LibraryScreen.tsx
│   │   ├── ProjectDetailScreen.tsx
│   │   ├── NewScanScreen.tsx
│   │   ├── ScanningInterfaceScreen.tsx
│   │   ├── RectificationScreen.tsx
│   │   ├── PatternPiecesScreen.tsx
│   │   ├── ExportSettingsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/           # Navigation configuration
│   │   └── RootNavigator.tsx
│   ├── services/             # Backend services
│   │   └── firebase.ts
│   ├── types/                # TypeScript interfaces
│   │   └── index.ts
│   ├── components/           # Reusable components (future use)
│   ├── utils/                # Utility functions (future use)
│   └── constants/            # Constants (future use)
├── app/
│   └── _layout.tsx           # Root layout
├── assets/                   # Images and icons
├── app.json                  # Expo config
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
└── README.md                 # This file
```

## Setup Instructions

### 1. Prerequisites
- Node.js 16+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Firebase account (https://firebase.google.com)

### 2. Firebase Configuration

1. Create a Firebase project at https://firebase.google.com
2. Enable these services:
   - Authentication (Email/Password)
   - Firestore Database
   - Cloud Storage
3. Copy your Firebase config:
   ```
   Settings → Project Settings → Config
   ```
4. Update `src/services/firebase.ts`:
   ```typescript
   const firebaseConfig = {
     apiKey: 'YOUR_API_KEY',
     authDomain: 'YOUR_AUTH_DOMAIN',
     projectId: 'YOUR_PROJECT_ID',
     storageBucket: 'YOUR_STORAGE_BUCKET',
     messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
     appId: 'YOUR_APP_ID',
   };
   ```

### 3. Install Dependencies

```bash
cd seamclone
npm install
```

### 4. Run the App

**Develop with Expo Go** (easiest for MVP):
```bash
npm start
# Then press 'a' for Android or 'i' for iOS
```

**Run on Android emulator**:
```bash
npm run android
```

**Run on iOS simulator** (macOS only):
```bash
npm run ios
```

## Features - Phase 1

### ✅ Login & Onboarding
- Email/password signup and login
- Persistent session using AsyncStorage
- 4-slide onboarding with scale reference education
- Credit card, ruler reference object explanations

### ✅ Project Dashboard (Library)
- List all user projects
- Create new projects
- View project status (draft, scanning, editing, completed)
- Pull-to-refresh functionality
- FAB button for new project creation

### ✅ Project Detail
- Project info and metadata
- Action buttons to start scan or view patterns
- Project timeline (placeholder for future scans)

### ✅ Settings Screen
- View app info and version
- Logout functionality
- Placeholders for scanning/export configurations

### ✅ Navigation
- Bottom tab navigation: [Library, New Scan, Settings]
- Stack navigation within Library for detailed views
- Full TypeScript support for type-safe navigation

## Firestore Schema (Phase 1)

### Users Collection
```
users/{userId}
├── uid: string
├── email: string
├── displayName: string
├── createdAt: Timestamp
```

### Projects Collection
```
projects/{projectId}
├── userId: string (foreign key)
├── title: string
├── description: string (optional)
├── status: "draft" | "scanning" | "editing" | "completed"
├── createdAt: Timestamp
├── updatedAt: Timestamp
├── thumbnail: string (optional)
└── referenceScale: object (future)
```

### Placeholder Collections (Future Phases)
- `scans/{scanId}` - Individual scans
- `pieces/{pieceId}` - Pattern pieces
- `exports/{exportId}` - PDF exports

## Testing Checklist

### Authentication
- [ ] Sign up with new email
- [ ] Login with existing email
- [ ] Logout from Settings
- [ ] Session persists after app restart
- [ ] Invalid credentials show error alerts

### Project Management
- [ ] Create new project from Library
- [ ] View project list after creation
- [ ] Navigate to project detail
- [ ] All action buttons are clickable

### Navigation
- [ ] Bottom tabs switch between screens
- [ ] Stack navigation back button works
- [ ] No crashes when navigating

### UI/UX
- [ ] All text is readable
- [ ] Buttons are easily tappable
- [ ] Loading indicators appear
- [ ] Error messages display

## Next Steps - Phase 2

After Phase 1 is verified:

1. **Phase 2: Scanning Interface** (Weeks 3-5)
   - Integrate `react-native-vision-camera`
   - Add camera view with bounding box overlay
   - Implement reference object detection
   - Store captured images to Cloud Storage

2. **Phase 3: Perspective Correction** (Weeks 5-8)
   - Integrate OpenCV native bindings
   - Implement 2D rectification
   - Add edge detection and refinement sliders
   - Implement seam allowance toggle

3. **Phase 4: Pattern Extraction & Export** (Weeks 8-12)
   - Detect pattern pieces from edges
   - Build pattern pieces gallery
   - Implement PDF tiling logic in Cloud Functions
   - Add print preview and download

## Known Limitations & TODOs

- **Camera**: Not yet integrated; `NewScanScreen` is a placeholder
- **Computer Vision**: No edge detection or perspective correction; screens are UI mockups
- **PDF Generation**: Export UI is complete; actual PDF generation requires Cloud Functions setup
- **Real-time Sync**: Firestore listeners are ready but not used in UI (future: multi-device sync)
- **Image Upload**: Storage service stubs are ready; actual upload happens in Phase 2

## Debugging

### Common Issues

**Firebase connection error**:
- Verify config in `src/services/firebase.ts`
- Check Firebase project is active and services are enabled
- Review Firebase console for auth/firestore errors

**Navigation errors**:
- Ensure all screen components are imported in `RootNavigator.tsx`
- Verify route params match TypeScript types in `src/types/index.ts`

**Build issues**:
- Clear cache: `npm start -- --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Architecture Notes

### Auth Flow
1. User signs up → Firebase Auth creates account → Firestore user doc created
2. User logs in → Firebase Auth validates → Session stored in AsyncStorage
3. On app start → Check AsyncStorage → Restore session if valid
4. Logout → Clear AsyncStorage and Firebase session

### Data Flow
1. **Offline First**: Firestore listeners sync data in real-time
2. **Error Handling**: All API calls wrapped in try/catch with user alerts
3. **Loading States**: ActivityIndicators show during async operations

### Future Considerations
- Add TypeScript strict mode for even better type safety
- Implement Redux or Context for global state (projects, user)
- Add unit tests and E2E tests
- Optimize Firestore queries with indexes
- Implement FCM for notifications (Phase 3+)

## Support & Feedback

For questions or issues, check:
1. Firebase docs: https://firebase.google.com/docs
2. React Navigation docs: https://reactnavigation.org
3. Expo docs: https://docs.expo.dev
4. This README and inline code comments

---

**Build ID**: SC-7729-ALPHA
**Last Updated**: May 11, 2026

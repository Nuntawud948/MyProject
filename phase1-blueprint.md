# Blueprint for Phase 1: Attendance Clock-In/Out (Mobile & Backend)

This blueprint provides full technical instructions for implementing Phase 1 of the Attendance Mobile system, mapping directly to a .NET Clean Architecture Backend and a React Native (Expo) Mobile application. 

---

## 📂 1. Directory Structure (Schema-Based DTOs & Features)

Execute code creation adhering strictly to the following directory layout:

```text
myproject/
└── apps/
    └── app/                          # React Native (Expo Router) Project Root
        └── src/
            ├── data/
            │   ├── apis/
            │   │   ├── auth.api.ts
            │   │   └── attendance.api.ts
            │   └── dtos/
            │       ├── auth/
            │       │   ├── login.request.ts
            │       │   └── login.response.ts
            │       └── attendance/   # Schema-Based DTOs Cluster
            │           ├── clock-in.request.ts
            │           ├── clock-out.request.ts
            │           └── attendance-status.response.ts
            ├── domain/
            │   └── validators/
            │       └── attendance.validator.ts
            └── presentation/
                ├── components/
                │   ├── common/
                │   └── attendance/
                │       └── ManualCheckInModal.tsx
                ├── hooks/
                │   ├── useAuth.ts
                │   └── useAttendance.ts
                ├── navigation/
                │   └── AppNavigator.tsx
                └── screens/
                    ├── LoginScreen.tsx
                    └── DashboardScreen.tsx
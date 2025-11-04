# Firebase Frontend Development Plan - Attendance Management System

**Architecture**: Direct Firebase integration in React.js frontend (No Backend API)

## 1. Firebase Models / Collections

### 1.1 Users Collection (`users`)
**Description**: Core user authentication and profile data

```typescript
interface User {
  id: string;                    // Firebase Auth UID
  email: string;                 // Primary email
  name: string;                  // Full name
  role: "admin" | "employee";    // User role
  department?: string;           // Department name
  managerId?: string;            // Reference to manager's user ID
  phoneNumber?: string;          // Contact number
  avatarUrl?: string;            // Profile picture URL
  designation?: string;          // Job title/designation
  employeeId?: string;           // Company employee ID
  hireDate?: string;             // YYYY-MM-DD
  isActive: boolean;             // Active/inactive status
  createdAt: Timestamp;          // Account creation timestamp
  updatedAt: Timestamp;          // Last update timestamp
  lastLoginAt?: Timestamp;       // Last login timestamp
}
```

**Indexes Required**:
- `email` (unique)
- `role`
- `department`
- `managerId`
- `isActive`

---

### 1.2 Employees Collection (`employees`)
**Description**: Extended employee information and management data

```typescript
interface Employee {
  id: string;                    // Same as User.id (reference)
  userId: string;                // Reference to users collection
  employeeId: string;           // Company employee ID (unique)
  department: string;            // Department name
  managerId?: string;            // Reference to manager's user ID
  designation: string;          // Job title
  joinDate: string;             // YYYY-MM-DD
  salary?: {
    basic: number;              // Basic salary
    allowances: number;         // Total allowances
    deductions: number;         // Default deductions
  };
  leaveBalance?: {
    casual: number;             // Remaining casual leave days
    sick: number;               // Remaining sick leave days
    privilege: number;          // Remaining privilege leave days
  };
  shiftTiming?: {
    start: string;              // HH:mm format
    end: string;                // HH:mm format
    timezone: string;           // Timezone identifier
  };
  workLocation?: {
    address: string;
    latitude: number;
    longitude: number;
    radius: number;             // Radius in meters for geo-fencing
  };
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes Required**:
- `userId` (unique)
- `employeeId` (unique)
- `department`
- `managerId`
- `isActive`

---

### 1.3 Attendance Collection (`attendance`)
**Description**: Daily attendance check-in/check-out logs

```typescript
interface AttendanceLog {
  id: string;                    // Document ID
  employeeId: string;           // Reference to employees collection
  date: string;                 // YYYY-MM-DD
  checkIn?: {
    timestamp: Timestamp;       // Check-in time
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    method: "manual" | "gps" | "qr" | "system"; // Check-in method
    ipAddress?: string;         // For security/audit
    deviceInfo?: string;        // Device/browser info
  };
  checkOut?: {
    timestamp: Timestamp;       // Check-out time
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    method: "manual" | "gps" | "qr" | "system";
    ipAddress?: string;
    deviceInfo?: string;
  };
  totalHours?: number;          // Calculated working hours
  status: "present" | "absent" | "half-day" | "holiday" | "leave";
  isLate: boolean;              // Late arrival flag
  lateMinutes?: number;         // Minutes late if applicable
  isEarlyDeparture: boolean;    // Early departure flag
  overtimeHours?: number;       // Overtime hours if any
  approved: boolean;            // Manual approval status
  approvedBy?: string;          // Admin/manager who approved
  approvedAt?: Timestamp;       // Approval timestamp
  remarks?: string;             // Additional notes
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes Required**:
- `employeeId`, `date` (composite)
- `employeeId`, `createdAt`
- `date`
- `status`
- `approved`

---

### 1.4 Leave Requests Collection (`leaveRequests`)
**Description**: Employee leave applications and approvals

```typescript
interface LeaveRequest {
  id: string;
  employeeId: string;          // Reference to employees collection
  type: "Casual" | "Sick" | "Privilege" | "Unpaid" | "Emergency";
  reason?: string;             // Leave reason/description
  from: string;                // YYYY-MM-DD (start date)
  to: string;                  // YYYY-MM-DD (end date)
  days: number;                // Total number of days
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  requestedAt: Timestamp;      // When leave was requested
  reviewedBy?: string;         // Admin/manager who reviewed
  reviewedAt?: Timestamp;      // Review timestamp
  rejectionReason?: string;    // If rejected, reason for rejection
  attachments?: string[];      // Array of file URLs (medical certificates, etc.)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes Required**:
- `employeeId`, `status`
- `employeeId`, `from`, `to`
- `status`, `requestedAt`
- `from`, `to`

---

### 1.5 Payslips Collection (`payslips`)
**Description**: Monthly payslip records

```typescript
interface Payslip {
  id: string;
  employeeId: string;          // Reference to employees collection
  month: string;               // YYYY-MM format
  year: number;
  period: {
    start: string;            // YYYY-MM-DD
    end: string;              // YYYY-MM-DD
  };
  earnings: {
    basic: number;
    allowances: number;       // Total allowances
    overtime: number;         // Overtime earnings
    bonus?: number;           // Any bonuses
    total: number;            // Total earnings
  };
  deductions: {
    tax: number;             // Income tax
    providentFund?: number;  // PF deduction
    other: number;           // Other deductions
    total: number;           // Total deductions
  };
  attendance: {
    workingDays: number;      // Number of working days
    presentDays: number;      // Days present
    absentDays: number;       // Days absent
    leaveDays: number;        // Leave days taken
    overtimeHours: number;    // Total overtime hours
  };
  netSalary: number;          // Final salary after deductions
  paymentDate?: string;       // YYYY-MM-DD (actual payment date)
  status: "draft" | "generated" | "paid" | "cancelled";
  pdfUrl?: string;           // Generated PDF URL
  generatedBy?: string;       // Admin who generated
  generatedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes Required**:
- `employeeId`, `month`
- `employeeId`, `year`
- `status`
- `month`, `year`

---

### 1.6 Holidays Collection (`holidays`)
**Description**: Company holidays and special days

```typescript
interface Holiday {
  id: string;
  name: string;               // Holiday name
  date: string;               // YYYY-MM-DD
  type: "national" | "regional" | "company" | "optional";
  description?: string;       // Holiday description
  isActive: boolean;          // Active/inactive
  applicableTo?: string[];    // Array of department IDs (empty = all)
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;          // Admin who created
}
```

**Indexes Required**:
- `date`
- `type`
- `isActive`
- `date`, `isActive`

---

### 1.7 Timesheets Collection (`timesheets`)
**Description**: Detailed timesheet entries (can be derived from attendance or manually entered)

```typescript
interface Timesheet {
  id: string;
  employeeId: string;
  date: string;               // YYYY-MM-DD
  attendanceLogId?: string;   // Reference to attendance collection
  entries: {
    timeIn: Timestamp;
    timeOut: Timestamp;
    hours: number;
    breakHours?: number;
    description?: string;     // Task/project description
    projectCode?: string;     // Project/client code
  }[];
  totalHours: number;         // Total hours for the day
  status: "draft" | "submitted" | "approved" | "rejected";
  submittedAt?: Timestamp;
  approvedBy?: string;
  approvedAt?: Timestamp;
  remarks?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes Required**:
- `employeeId`, `date`
- `employeeId`, `status`
- `date`, `status`

---

### 1.8 Settings Collection (`settings`)
**Description**: System-wide configuration settings

```typescript
interface Settings {
  id: string;                 // Document ID (e.g., "general")
  organization: {
    name: string;
    address?: string;
    logoUrl?: string;
    taxId?: string;
  };
  attendance: {
    shiftStartTime: string;   // Default shift start (HH:mm)
    shiftEndTime: string;     // Default shift end (HH:mm)
    lateMarkMinutes: number;  // Minutes after which marked as late
    halfDayHours: number;     // Hours for half-day calculation
    geoFencingEnabled: boolean;
    requireGPS: boolean;
    allowManualEntry: boolean;
    qrCodeEnabled: boolean;
  };
  leave: {
    maxCasualLeaves: number;
    maxSickLeaves: number;
    maxPrivilegeLeaves: number;
    leaveCarryForward: boolean;
    leaveAccrualRate?: number;
  };
  payroll: {
    defaultBasicSalary: number;
    defaultAllowances: number;
    taxSlabs?: Array<{
      min: number;
      max?: number;
      rate: number;
    }>;
    workingDaysPerMonth: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    notifyOnLeaveRequest: boolean;
    notifyOnLeaveApproval: boolean;
    notifyOnPayslipGeneration: boolean;
    notifyOnAttendanceMarked: boolean;
  };
  updatedAt: Timestamp;
  updatedBy: string;
}
```

**Indexes Required**:
- Single document collection (no indexes needed)

---

### 1.9 Reports Collection (`reports`)
**Description**: Generated reports metadata

```typescript
interface Report {
  id: string;
  type: "attendance" | "leave" | "payroll" | "timesheet" | "employee";
  title: string;
  description?: string;
  filters: {
    dateRange?: {
      start: string;
      end: string;
    };
    employeeIds?: string[];
    departments?: string[];
    status?: string[];
  };
  generatedBy: string;       // User ID
  fileUrl?: string;          // Generated file URL (PDF/Excel)
  fileFormat: "pdf" | "excel" | "csv";
  status: "pending" | "completed" | "failed";
  createdAt: Timestamp;
  completedAt?: Timestamp;
}
```

**Indexes Required**:
- `generatedBy`, `createdAt`
- `type`, `status`
- `status`, `createdAt`

---

## 2. Firebase Security Rules

### 2.1 Users Collection Rules
```javascript
match /users/{userId} {
  allow read: if request.auth != null && 
    (request.auth.uid == userId || 
     resource.data.role == 'admin');
  allow create: if request.auth != null && 
    request.resource.data.id == request.auth.uid;
  allow update: if request.auth != null && 
    (request.auth.uid == userId || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  allow delete: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### 2.2 Employees Collection Rules
```javascript
match /employees/{employeeId} {
  allow read: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  allow create, update, delete: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### 2.3 Attendance Collection Rules
```javascript
match /attendance/{attendanceId} {
  allow read: if request.auth != null && 
    (resource.data.employeeId == get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.employeeId || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  allow create: if request.auth != null && 
    request.resource.data.employeeId == get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.employeeId;
  allow update: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  allow delete: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### 2.4 Leave Requests Collection Rules
```javascript
match /leaveRequests/{leaveId} {
  allow read: if request.auth != null && 
    (resource.data.employeeId == get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.employeeId || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  allow create: if request.auth != null && 
    request.resource.data.employeeId == get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.employeeId;
  allow update: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### 2.5 Payslips Collection Rules
```javascript
match /payslips/{payslipId} {
  allow read: if request.auth != null && 
    (resource.data.employeeId == get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.employeeId || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  allow create, update, delete: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### 2.6 Holidays Collection Rules
```javascript
match /holidays/{holidayId} {
  allow read: if request.auth != null;
  allow create, update, delete: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### 2.7 Timesheets Collection Rules
```javascript
match /timesheets/{timesheetId} {
  allow read: if request.auth != null && 
    (resource.data.employeeId == get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.employeeId || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
  allow create, update: if request.auth != null && 
    request.resource.data.employeeId == get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.employeeId;
  allow delete: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### 2.8 Settings Collection Rules
```javascript
match /settings/{settingId} {
  allow read: if request.auth != null;
  allow create, update, delete: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

---

## 3. Frontend Firebase Development Plan

### Phase 1: Firebase Setup & Authentication (Week 1-2)

#### 1.1 Firebase Project Setup
- [ ] Create Firebase project
- [ ] Enable Authentication (Email/Password)
- [ ] Configure Firestore database
- [ ] Set up Cloud Storage buckets
- [ ] Initialize Firebase in React app
- [ ] Configure environment variables

#### 1.2 Firebase Authentication Integration
- [ ] Install and configure Firebase SDK
  ```typescript
  // lib/firebase/config.ts
  - Initialize Firebase App
  - Configure Auth
  - Configure Firestore
  - Configure Storage
  ```
- [ ] Create authentication service (`lib/firebase/auth.ts`)
  - `signUp(email, password, userData)`
  - `signIn(email, password)`
  - `signOut()`
  - `sendPasswordResetEmail(email)`
  - `verifyOTP(otp)` - Using Firebase Phone Auth or custom OTP
  - `updatePassword(newPassword)`
  - `getCurrentUser()`
  - `onAuthStateChanged(callback)`

#### 1.3 Authentication UI Integration
- [ ] Update login page with Firebase Auth
  - Replace static auth with `signIn(email, password)`
  - Add error handling and loading states
- [ ] Update signup/profile setup page
  - Use `signUp()` then create user document
  - Store additional user data in Firestore
- [ ] Implement forgot password flow
  - Use `sendPasswordResetEmail()`
- [ ] Implement OTP verification
- [ ] Add authentication state persistence
- [ ] Create `useAuth()` custom hook

#### 1.4 User Profile Management (Frontend)
- [ ] Create user service (`lib/firebase/services/users.ts`)
  - `createUserProfile(userId, userData)`
  - `getUserProfile(userId)`
  - `updateUserProfile(userId, updates)`
- [ ] Implement profile setup on first login
  - Create user document in `users` collection
  - Link to `employees` collection if needed
- [ ] Create profile update functionality
- [ ] Implement role-based routing
  - Protect admin routes
  - Protect employee routes
- [ ] Create `useUserProfile()` hook for profile data

**Deliverables**:
- Complete authentication flow
- User profile management
- Role-based routing

---

### Phase 2: Employee Management (Week 3)

#### 2.1 Employee Firestore Service
- [ ] Create employee service (`lib/firebase/services/employees.ts`)
  - `createEmployee(employeeData)` - Add document to `employees` collection
  - `getEmployee(employeeId)` - Get single employee
  - `getEmployees(filters)` - Query with filters
  - `updateEmployee(employeeId, updates)` - Update document
  - `deleteEmployee(employeeId)` - Delete/Deactivate employee
- [ ] Implement Firestore queries with indexes
  - Query by department
  - Query by role
  - Query by manager
  - Query by status (active/inactive)

#### 2.2 Employee Management UI
- [ ] Update admin employees page
  - Replace DataStore with Firestore queries
  - Use `useEmployees()` hook for real-time data
- [ ] Implement add employee form
  - Use `createEmployee()` service
  - Also create corresponding user document
  - Handle errors and loading states
- [ ] Implement edit employee functionality
  - Use `updateEmployee()` service
- [ ] Implement delete/deactivate functionality
- [ ] Add real-time updates with Firestore listeners

#### 2.3 Employee Search & Filters (Frontend)
- [ ] Implement client-side search
  - Filter by name/email
  - Use Firestore query filters
- [ ] Add department filter dropdown
- [ ] Add role filter dropdown
- [ ] Add manager filter
- [ ] Create `useEmployees(filters)` hook

#### 2.4 CSV Import Functionality
- [ ] Create CSV parser utility
- [ ] Implement batch write to Firestore
  - Use `batch()` for multiple writes
  - Create users and employees in batch
- [ ] Add progress tracking
- [ ] Handle errors and validation

**Deliverables**:
- Complete employee management system
- CSV import functionality
- Advanced filtering and search

---

### Phase 3: Attendance Management (Week 4-5)

#### 3.1 Attendance Firestore Service
- [ ] Create attendance service (`lib/firebase/services/attendance.ts`)
  - `checkIn(employeeId, location?)` - Create/update attendance document
  - `checkOut(employeeId, location?)` - Update check-out time
  - `getAttendanceLog(attendanceId)` - Get single log
  - `getAttendanceHistory(employeeId, dateRange)` - Query attendance
  - `updateAttendance(attendanceId, updates)` - Manual correction (admin)
  - `getAttendanceReports(filters)` - Generate reports data
- [ ] Implement Firestore transactions for check-in/check-out
  - Prevent duplicate check-ins
  - Ensure data consistency

#### 3.2 Check-In/Check-Out UI Implementation
- [ ] Update employee mark-attendance page
  - Replace DataStore with Firebase service
  - Use `checkIn()` and `checkOut()` functions
  - Add GPS location capture (optional)
- [ ] Implement check-in functionality
  - Capture timestamp (server timestamp)
  - Store GPS coordinates if available
  - Detect late arrival (compare with shift timing)
  - Add document to `attendance` collection
- [ ] Implement check-out functionality
  - Calculate total hours (client-side or Cloud Function)
  - Detect early departure
  - Calculate overtime hours
  - Update attendance document
- [ ] Add real-time status updates
  - Show current check-in status
  - Use Firestore real-time listener

#### 3.3 Attendance Tracking UI
- [ ] Update attendance history page
  - Use `getAttendanceHistory()` service
  - Implement calendar view with Firestore queries
  - Filter by date range
- [ ] Create admin attendance management page
  - List all attendance with `getAttendanceReports()`
  - Implement filters (date, employee, department)
  - Add real-time updates

#### 3.4 Manual Attendance Correction (Admin)
- [ ] Create admin attendance edit form
  - Use `updateAttendance()` service
  - Update check-in/check-out times
  - Add remarks
  - Update approval status

#### 3.5 Attendance Calculations (Frontend/Cloud Functions)
- [ ] Implement working hours calculation
  - Calculate in frontend for display
  - Or use Cloud Function for accuracy
- [ ] Detect late arrivals
  - Compare check-in time with shift start
  - Update `isLate` field
- [ ] Calculate overtime hours
  - Compare total hours with standard hours
- [ ] Handle half-day attendance
- [ ] Integrate with holidays collection
  - Check if date is holiday before marking absent

**Deliverables**:
- Check-in/check-out system
- Attendance tracking dashboard
- Attendance reports
- Manual correction tools

---

### Phase 4: Leave Management (Week 6)

#### 4.1 Leave Firestore Service
- [ ] Create leave service (`lib/firebase/services/leaves.ts`)
  - `createLeaveRequest(leaveData)` - Add to `leaveRequests` collection
  - `getLeaveRequest(leaveId)` - Get single request
  - `getLeaveRequests(employeeId, filters)` - Query requests
  - `approveLeaveRequest(leaveId, reviewerId)` - Update status
  - `rejectLeaveRequest(leaveId, reviewerId, reason)` - Update status
  - `getLeaveBalance(employeeId)` - Calculate from leave requests
- [ ] Implement leave validation
  - Check overlapping dates (Firestore query)
  - Check leave balance
  - Validate date range

#### 4.2 Leave Application UI
- [ ] Update employee leave application page
  - Replace DataStore with Firebase service
  - Use `createLeaveRequest()` function
- [ ] Implement leave application form
  - Select leave type
  - Choose date range (date picker)
  - Add reason/description
  - Upload attachments to Firebase Storage
  - Store attachment URLs in leave request
- [ ] Implement leave balance display
  - Use `getLeaveBalance()` to calculate
  - Show remaining leaves by type
  - Update in real-time

#### 4.3 Leave Approval Workflow (Admin)
- [ ] Update admin leaves page
  - Query pending leaves with Firestore
  - Use `useLeaveRequests()` hook
  - Filter by status, employee, date
- [ ] Implement approve/reject functionality
  - Use `approveLeaveRequest()` / `rejectLeaveRequest()`
  - Update leave request status
  - Update employee leave balance
  - Send notification (Cloud Function or client-side)

#### 4.4 Leave Reports
- [ ] Employee leave history view
  - Query leave requests for employee
  - Show status, dates, type
- [ ] Admin leave reports
  - Query all leave requests with filters
  - Export functionality (client-side CSV generation)

**Deliverables**:
- Complete leave application system
- Approval workflow
- Leave reports and analytics

---

### Phase 5: Timesheet Management (Week 7)

#### 5.1 Timesheet Firestore Service
- [ ] Create timesheet service (`lib/firebase/services/timesheets.ts`)
  - `createTimesheet(timesheetData)` - Add to `timesheets` collection
  - `getTimesheet(timesheetId)` - Get single timesheet
  - `getTimesheets(employeeId, dateRange)` - Query timesheets
  - `updateTimesheet(timesheetId, updates)` - Update timesheet
  - `submitTimesheet(timesheetId)` - Update status to submitted
  - `approveTimesheet(timesheetId, approverId)` - Admin approval
  - `exportTimesheetToCSV(employeeId, dateRange)` - Client-side CSV generation

#### 5.2 Timesheet Entry UI
- [ ] Auto-generate from attendance
  - Query attendance logs
  - Create timesheet entries automatically
  - Link attendance log to timesheet
- [ ] Manual timesheet entry form
  - Add time entries per day
  - Multiple entries per day support
  - Project/task code input
  - Description field
- [ ] Update employee timesheet page
  - Display timesheet entries
  - Allow editing (if status is draft)
  - Use `useTimesheets()` hook for real-time data

#### 5.3 Timesheet Approval (Admin)
- [ ] Update admin timesheets page
  - Query submitted timesheets
  - Filter by employee, date, status
- [ ] Implement approve/reject functionality
  - Use `approveTimesheet()` / `rejectTimesheet()`
  - Add remarks field

#### 5.4 Timesheet Export
- [ ] Implement client-side CSV export
  - Use `exportTimesheetToCSV()` function
  - Generate CSV from Firestore data
- [ ] Implement PDF export (optional)
  - Use client-side PDF library (jsPDF)
  - Or generate via Cloud Function

**Deliverables**:
- Timesheet entry and management
- Approval workflow
- Export functionality

---

### Phase 6: Payslip Management (Week 8)

#### 6.1 Payslip Firestore Service
- [ ] Create payslip service (`lib/firebase/services/payslips.ts`)
  - `generatePayslip(employeeId, month)` - Create payslip document
    - Calculate earnings from employee salary
    - Calculate deductions from attendance
    - Calculate overtime from attendance logs
    - Store in `payslips` collection
  - `getPayslip(payslipId)` - Get single payslip
  - `getPayslips(employeeId)` - Query payslips for employee
  - `downloadPayslipPDF(payslipId)` - Generate PDF (client-side or Cloud Function)

#### 6.2 Payslip Generation Logic
- [ ] Implement payslip calculation (frontend or Cloud Function)
  - Fetch employee salary from `employees` collection
  - Fetch attendance data for the month
  - Calculate working days, present days
  - Calculate overtime hours
  - Calculate earnings (basic + allowances + overtime)
  - Calculate deductions (tax, PF, other)
  - Calculate net salary
- [ ] Store payslip in Firestore
- [ ] Generate PDF (optional - client-side with jsPDF or Cloud Function)

#### 6.3 Payslip UI
- [ ] Update admin payslips page
  - List all payslips
  - Generate payslip button (trigger calculation)
  - Filter by employee, month
- [ ] Update employee payslips page
  - Display payslips list using `usePayslips()` hook
  - Download PDF functionality
  - View payslip details

#### 6.4 Payroll Settings UI
- [ ] Create settings page for payroll
  - Configure salary components (stored in `settings` collection)
  - Set tax slabs
  - Configure default deductions
  - Update `settings` document in Firestore

**Deliverables**:
- Automated payslip generation
- PDF generation and download
- Payroll configuration

---

### Phase 7: Holiday Management (Week 9)

#### 7.1 Holiday Firestore Service
- [ ] Create holiday service (`lib/firebase/services/holidays.ts`)
  - `createHoliday(holidayData)` - Add to `holidays` collection
  - `getHoliday(holidayId)` - Get single holiday
  - `getHolidays(year, filters)` - Query holidays by year
  - `updateHoliday(holidayId, updates)` - Update holiday
  - `deleteHoliday(holidayId)` - Delete holiday

#### 7.2 Holiday Management UI
- [ ] Update admin holidays page
  - Replace "Coming soon" with functional UI
  - List holidays using `useHolidays()` hook
  - Add holiday form (use `createHoliday()`)
  - Edit holiday functionality
  - Delete holiday functionality
  - Mark active/inactive toggle

#### 7.3 Holiday Integration
- [ ] Display holidays on dashboard
  - Query upcoming holidays from Firestore
  - Show on employee and admin dashboards
- [ ] Integrate with attendance
  - Check if date is holiday before marking absent
  - Query holidays collection when calculating attendance
- [ ] Holiday-based leave calculations
  - Exclude holidays from leave days calculation

**Deliverables**:
- Holiday management system
- Calendar integration

---

### Phase 8: Settings & Configuration (Week 10)

#### 8.1 Settings Firestore Service
- [ ] Create settings service (`lib/firebase/services/settings.ts`)
  - `getSettings()` - Read from `settings` collection (single document)
  - `updateSettings(updates)` - Update settings document (admin only)

#### 8.2 Settings Management UI
- [ ] Update admin settings page
  - Replace "Coming soon" with functional UI
  - Organization settings form
    - Company name, address, logo upload
    - Upload logo to Firebase Storage
  - Attendance rules configuration
    - Shift start/end time
    - Late mark minutes
    - Half-day hours
    - Geo-fencing enable/disable
    - Require GPS toggle
    - Allow manual entry toggle
  - Leave policy settings
    - Max leaves per type
    - Leave carry forward toggle
    - Leave accrual rate
  - Payroll settings
    - Default salary components
    - Tax slabs configuration
    - Working days per month
  - Notification preferences
    - Email notifications toggle
    - SMS notifications toggle
    - Push notifications toggle
- [ ] Use `useSettings()` hook for settings data
- [ ] Save settings to Firestore `settings` collection

**Deliverables**:
- Comprehensive settings management
- Configurable business rules

---

### Phase 9: Reports & Analytics (Week 11)

#### 9.1 Report Data Queries
- [ ] Create report service (`lib/firebase/services/reports.ts`)
  - Query attendance data with filters
  - Query leave data with filters
  - Query payroll/payslip data
  - Query employee statistics
  - Aggregate data for reports
- [ ] Implement client-side data aggregation
  - Calculate totals, averages
  - Group by department, date, etc.
  - Generate charts data

#### 9.2 Reports UI
- [ ] Update admin reports page
  - Attendance reports
    - Query `attendance` collection with filters
    - Show statistics (present, absent, late)
    - Date range filter
  - Leave reports
    - Query `leaveRequests` collection
    - Filter by employee, department, date range
  - Payroll reports
    - Query `payslips` collection
    - Aggregate by month, department
  - Employee reports
    - Query `employees` collection
    - Statistics by department

#### 9.3 Report Export (Client-side)
- [ ] Implement CSV export
  - Use client-side CSV generation library
  - Export filtered data from Firestore queries
- [ ] Implement Excel export (optional)
  - Use client-side Excel library (xlsx)
- [ ] Implement PDF export (optional)
  - Use jsPDF or similar
  - Generate PDF reports from Firestore data

**Deliverables**:
- Comprehensive reporting system
- Multiple export formats

---

### Phase 10: Cloud Functions & Automation (Week 12)

#### 10.1 Automated Tasks
- [ ] Auto-calculate attendance hours
- [ ] Auto-update leave balance
- [ ] Auto-generate monthly payslips
- [ ] Send notification emails
- [ ] Daily attendance reminders

#### 10.2 Background Jobs
- [ ] Data cleanup jobs
- [ ] Monthly payslip generation
- [ ] Report generation for large datasets

**Deliverables**:
- Automated background processes
- Scheduled jobs
- Email notifications

---

### Phase 11: Frontend Firebase Integration (Throughout All Phases)

#### 11.1 Firebase SDK Setup
- [ ] Install Firebase dependencies
  ```bash
  npm install firebase
  ```
- [ ] Create Firebase configuration file (`lib/firebase/config.ts`)
  - Initialize Firebase App
  - Initialize Authentication
  - Initialize Firestore
  - Initialize Storage
  - Initialize Functions (if needed)
- [ ] Create Firebase services structure
  - `lib/firebase/auth.ts` - Authentication service
  - `lib/firebase/firestore.ts` - Firestore operations
  - `lib/firebase/storage.ts` - Storage operations
  - `lib/firebase/hooks.ts` - Custom React hooks

#### 11.2 Firebase Service Functions
Create reusable service functions for all Firebase operations:

**Authentication Services** (`lib/firebase/auth.ts`):
```typescript
- signUp(email, password)
- signIn(email, password)
- signOut()
- sendPasswordResetEmail(email)
- verifyOTP(otp)
- updatePassword(newPassword)
- getCurrentUser()
- onAuthStateChanged(callback)
```

**User Services** (`lib/firebase/services/users.ts`):
```typescript
- createUserProfile(userId, data)
- getUserProfile(userId)
- updateUserProfile(userId, updates)
- getUsersList(filters)
- deleteUser(userId)
```

**Employee Services** (`lib/firebase/services/employees.ts`):
```typescript
- createEmployee(data)
- getEmployee(employeeId)
- getEmployees(filters)
- updateEmployee(employeeId, updates)
- deleteEmployee(employeeId)
- importEmployeesFromCSV(file)
```

**Attendance Services** (`lib/firebase/services/attendance.ts`):
```typescript
- checkIn(employeeId, location?)
- checkOut(employeeId, location?)
- getAttendanceLog(attendanceId)
- getAttendanceHistory(employeeId, dateRange)
- updateAttendance(attendanceId, updates)
- getAttendanceReports(filters)
```

**Leave Services** (`lib/firebase/services/leaves.ts`):
```typescript
- createLeaveRequest(data)
- getLeaveRequest(leaveId)
- getLeaveRequests(employeeId, filters)
- approveLeaveRequest(leaveId, reviewerId)
- rejectLeaveRequest(leaveId, reviewerId, reason)
- getLeaveBalance(employeeId)
```

**Payslip Services** (`lib/firebase/services/payslips.ts`):
```typescript
- generatePayslip(employeeId, month)
- getPayslip(payslipId)
- getPayslips(employeeId)
- downloadPayslipPDF(payslipId)
```

**Holiday Services** (`lib/firebase/services/holidays.ts`):
```typescript
- createHoliday(data)
- getHoliday(holidayId)
- getHolidays(year, filters)
- updateHoliday(holidayId, updates)
- deleteHoliday(holidayId)
```

**Timesheet Services** (`lib/firebase/services/timesheets.ts`):
```typescript
- createTimesheet(data)
- getTimesheet(timesheetId)
- getTimesheets(employeeId, dateRange)
- updateTimesheet(timesheetId, updates)
- submitTimesheet(timesheetId)
- approveTimesheet(timesheetId, approverId)
- exportTimesheetToCSV(employeeId, dateRange)
```

**Settings Services** (`lib/firebase/services/settings.ts`):
```typescript
- getSettings()
- updateSettings(updates)
```

#### 11.3 Custom React Hooks
Create custom hooks for easier Firebase integration:

**Authentication Hooks** (`lib/firebase/hooks/useAuth.ts`):
```typescript
- useAuth() - Get current authenticated user
- useUserProfile() - Get current user profile
- useLogin() - Login mutation hook
- useSignup() - Signup mutation hook
```

**Data Hooks** (`lib/firebase/hooks/useFirestore.ts`):
```typescript
- useEmployees(filters) - Real-time employees list
- useEmployee(employeeId) - Single employee
- useAttendance(employeeId, dateRange) - Attendance data
- useLeaveRequests(employeeId, filters) - Leave requests
- usePayslips(employeeId) - Payslips list
- useHolidays(year) - Holidays list
- useTimesheets(employeeId, dateRange) - Timesheets
- useSettings() - Settings data
```

**Mutation Hooks** (`lib/firebase/hooks/useMutations.ts`):
```typescript
- useCreateEmployee()
- useUpdateEmployee()
- useDeleteEmployee()
- useCheckIn()
- useCheckOut()
- useCreateLeaveRequest()
- useApproveLeave()
- useGeneratePayslip()
```

#### 11.4 Real-time Data Listeners
- [ ] Set up real-time listeners for live updates
  - Employees list
  - Attendance logs
  - Leave requests
  - Timesheets
  - Dashboard statistics
- [ ] Implement efficient data caching
- [ ] Handle offline support with Firestore persistence

#### 11.5 File Upload Services
- [ ] Implement avatar upload to Firebase Storage
- [ ] Implement leave attachment uploads
- [ ] Implement payslip PDF storage
- [ ] Create upload progress hooks

**Deliverables**:
- Complete Firebase SDK integration
- All service functions implemented
- Custom React hooks for data management
- Real-time data synchronization

---

### Phase 12: Testing & Optimization (Week 13)

#### 12.1 Testing
- [ ] Unit tests for Firebase services
  - Mock Firestore queries
  - Test service functions
- [ ] Integration tests for Firebase operations
  - Test Firestore read/write operations
  - Test Authentication flows
  - Test Storage uploads
- [ ] Component tests
  - Test React components with Firebase hooks
  - Test form submissions
- [ ] Security testing
  - Test Firestore security rules
  - Verify role-based access
- [ ] Performance testing
  - Test query performance
  - Test real-time listener performance
  - Test large dataset queries

#### 12.2 Optimization
- [ ] Firestore query optimization
  - Ensure all queries use proper indexes
  - Optimize composite queries
  - Limit query results with pagination
- [ ] Index optimization
  - Verify all required indexes are created
  - Monitor query performance
- [ ] Caching strategy
  - Implement React Query or SWR for caching
  - Cache frequently accessed data
  - Implement optimistic updates
- [ ] Real-time listener optimization
  - Unsubscribe listeners on unmount
  - Use efficient query filters
  - Limit real-time data scope
- [ ] Bundle optimization
  - Code splitting for Firebase modules
  - Lazy load Firebase services

**Deliverables**:
- Comprehensive test coverage
- Performance optimizations
- Security hardening

---

### Phase 13: Documentation & Deployment (Week 14)

#### 13.1 Documentation
- [ ] Firebase services documentation
- [ ] React hooks documentation
- [ ] Database schema documentation
- [ ] Firestore security rules documentation
- [ ] Deployment guide
- [ ] User guide

#### 13.2 Deployment
- [ ] Set up production Firebase project
- [ ] Configure production Firestore security rules
- [ ] Configure production Storage security rules
- [ ] Build React/Next.js application
- [ ] Deploy to Firebase Hosting or Vercel
- [ ] Deploy Cloud Functions (for automation only)
- [ ] Set up Firebase monitoring and logging
- [ ] Configure Firestore backup strategy
- [ ] Set up error tracking (Sentry, etc.)

**Deliverables**:
- Complete documentation
- Production deployment
- Monitoring setup

---

## 4. Technology Stack

### Firebase Services (Direct Integration)
- **Firebase Authentication**: User authentication (direct SDK)
- **Cloud Firestore**: NoSQL database (direct SDK, real-time listeners)
- **Cloud Functions**: Serverless functions for automation only
- **Cloud Storage**: File storage (direct SDK for uploads/downloads)
- **Firebase Hosting**: Deploy React app

### Frontend Stack
- **React 19**: UI framework
- **Next.js 16**: React framework with routing
- **TypeScript**: Type safety
- **Firebase SDK v10+**: Client-side Firebase operations
- **Tailwind CSS**: Styling
- **React Hooks**: Custom hooks for Firebase operations

### Development Tools
- **Node.js**: Runtime environment
- **Firebase CLI**: Firebase project management
- **Jest/React Testing Library**: Testing framework
- **ESLint/Prettier**: Code quality

### Third-party Libraries (Client-side)
- **jsPDF**: PDF generation for payslips/reports
- **xlsx**: Excel export functionality
- **date-fns**: Date manipulation
- **React Query / SWR**: Data fetching and caching (optional)

---

## 5. Database Indexes

Create the following composite indexes in Firestore:

1. **attendance** collection:
   - `employeeId` (ASC), `date` (DESC)
   - `employeeId` (ASC), `createdAt` (DESC)
   - `date` (ASC), `status` (ASC)

2. **leaveRequests** collection:
   - `employeeId` (ASC), `status` (ASC)
   - `employeeId` (ASC), `from` (DESC)
   - `status` (ASC), `requestedAt` (DESC)

3. **payslips** collection:
   - `employeeId` (ASC), `month` (DESC)
   - `employeeId` (ASC), `year` (DESC)

4. **timesheets** collection:
   - `employeeId` (ASC), `date` (DESC)
   - `employeeId` (ASC), `status` (ASC)

5. **users** collection:
   - `role` (ASC), `isActive` (ASC)
   - `department` (ASC), `isActive` (ASC)

---

## 6. Security Considerations

1. **Firebase Authentication**: All operations require authenticated users
2. **Firestore Security Rules**: Implement comprehensive security rules (see Section 2)
3. **Role-based Access Control**: Enforce RBAC in security rules
4. **Data Validation**: Validate all input data on client-side before Firestore writes
5. **Rate Limiting**: Implement client-side throttling for operations
6. **Storage Security Rules**: Secure Firebase Storage with proper rules
7. **Input Sanitization**: Sanitize user inputs to prevent XSS attacks
8. **Offline Security**: Firestore offline persistence is secure (encrypted)
9. **Environment Variables**: Keep Firebase config in environment variables
10. **Client-side Validation**: Always validate on client, but rely on security rules as primary protection

---

## 7. Estimated Timeline

- **Phase 1**: Weeks 1-2 (Firebase Setup & Authentication)
- **Phase 2**: Week 3 (Employee Management)
- **Phase 3**: Weeks 4-5 (Attendance Management)
- **Phase 4**: Week 6 (Leave Management)
- **Phase 5**: Week 7 (Timesheet Management)
- **Phase 6**: Week 8 (Payslip Management)
- **Phase 7**: Week 9 (Holiday Management)
- **Phase 8**: Week 10 (Settings)
- **Phase 9**: Week 11 (Reports)
- **Phase 10**: Week 12 (Cloud Functions for Automation)
- **Phase 11**: Throughout (Frontend Firebase Integration)
- **Phase 12**: Week 13 (Testing & Optimization)
- **Phase 13**: Week 14 (Documentation & Deployment)

**Total Estimated Time**: 14 weeks (~3.5 months)

---

## 8. Success Metrics

1. **Performance**:
   - Firestore query time < 200ms (95th percentile)
   - Page load time < 2 seconds
   - Real-time update latency < 500ms
   - First Contentful Paint < 1.5 seconds

2. **Reliability**:
   - 99.9% uptime
   - Zero data loss
   - Automated backups

3. **Security**:
   - Zero security breaches
   - All Firestore operations protected by security rules
   - Regular security rule audits
   - All Storage operations secured

4. **User Experience**:
   - Intuitive UI/UX
   - Fast response times
   - Error-free operations

---

## 9. Next Steps

1. **Review and Approval**: Review this plan with stakeholders
2. **Resource Allocation**: Assign developers to phases
3. **Environment Setup**: Set up development Firebase project
4. **Begin Phase 1**: Start with authentication setup

---

## 10. Maintenance & Support

### Ongoing Tasks
- Regular security updates
- Performance monitoring
- Bug fixes and patches
- Feature enhancements
- Database optimization
- Backup verification

### Support Plan
- Documentation updates
- User training materials
- Technical support process
- Issue tracking system

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Prepared By**: Development Team


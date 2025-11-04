# Firestore Security Rules Documentation

This document explains the Firestore security rules implemented for the Attendance Management System.

## Rules Overview

The security rules enforce role-based access control (RBAC) and ensure users can only access data they're authorized to see or modify.

## Helper Functions

### `isAuthenticated()`
Checks if the current request is from an authenticated user.

### `isAdmin()`
Checks if the authenticated user has the 'admin' role by reading from the `users` collection.

### `isEmployee()`
Checks if the authenticated user has the 'employee' role.

### `isOwner(userId)`
Checks if the authenticated user owns the resource (their userId matches).

### `getUserData()`
Retrieves the current user's data from the `users` collection.

### `getEmployeeByUserId(userId)`
Retrieves the employee document associated with a user ID.

## Collection Rules

### 1. Users Collection (`/users/{userId}`)

**Read Rules:**
- Users can read their own profile
- Admins can read any user profile

**Create Rules:**
- Users can create their own profile during signup
- Must match their Firebase Auth UID

**Update Rules:**
- Users can update their own profile (except role)
- Admins can update any user profile and change roles

**Delete Rules:**
- Only admins can delete users

---

### 2. Employees Collection (`/employees/{employeeId}`)

**Read Rules:**
- Employees can read their own employee record (by userId match)
- Admins can read any employee record

**Create/Update/Delete Rules:**
- Only admins can create, update, or delete employee records

**Required Fields for Create:**
- userId, employeeId, department, designation, joinDate, isActive

---

### 3. Attendance Collection (`/attendance/{attendanceId}`)

**Read Rules:**
- Employees can read their own attendance records
- Admins can read any attendance record

**Create Rules:**
- Employees can create their own attendance (check-in)
- Must match their employeeId
- Required fields: employeeId, date, status

**Update Rules:**
- Only admins can update attendance (for manual corrections)

**Delete Rules:**
- Only admins can delete attendance records

---

### 4. Leave Requests Collection (`/leaveRequests/{leaveId}`)

**Read Rules:**
- Employees can read their own leave requests
- Admins can read any leave request

**Create Rules:**
- Employees can create their own leave requests
- Must match their employeeId
- Status must be 'Pending' on create
- Required fields: employeeId, type, from, to, status

**Update Rules:**
- Only admins can update leave requests (approve/reject)
- Status must be valid: 'Pending', 'Approved', 'Rejected', or 'Cancelled'

**Delete Rules:**
- Employees can delete their own pending leave requests
- Admins can delete any leave request

---

### 5. Payslips Collection (`/payslips/{payslipId}`)

**Read Rules:**
- Employees can read their own payslips
- Admins can read any payslip

**Create/Update/Delete Rules:**
- Only admins can create, update, or delete payslips

**Required Fields for Create:**
- employeeId, month, year, netSalary, status

---

### 6. Holidays Collection (`/holidays/{holidayId}`)

**Read Rules:**
- All authenticated users can read holidays

**Create/Update/Delete Rules:**
- Only admins can create, update, or delete holidays

**Required Fields for Create:**
- name, date, type, isActive

---

### 7. Timesheets Collection (`/timesheets/{timesheetId}`)

**Read Rules:**
- Employees can read their own timesheets
- Admins can read any timesheet

**Create Rules:**
- Employees can create their own timesheets
- Must match their employeeId
- Required fields: employeeId, date, totalHours, status

**Update Rules:**
- Employees can update their own timesheets (only if status is 'draft')
- Admins can update any timesheet

**Delete Rules:**
- Only admins can delete timesheets

---

### 8. Settings Collection (`/settings/{settingId}`)

**Read Rules:**
- All authenticated users can read settings

**Create/Update/Delete Rules:**
- Only admins can create, update, or delete settings

---

### 9. Reports Collection (`/reports/{reportId}`)

**Read Rules:**
- Users can read reports they generated
- Admins can read any report

**Create Rules:**
- All authenticated users can create reports
- generatedBy must match current user ID
- Required fields: type, title, generatedBy, status

**Update Rules:**
- Users can update their own reports
- Admins can update any report

**Delete Rules:**
- Users can delete their own reports
- Admins can delete any report

---

## Security Best Practices

1. **Always Authenticated**: All operations require authentication (except in rare cases)
2. **Role-Based Access**: Admin role checked via `users` collection lookup
3. **Ownership Validation**: Users can only modify their own data (unless admin)
4. **Field Validation**: Required fields are enforced on create operations
5. **Status Validation**: Status fields are validated to prevent invalid states

## Testing Security Rules

### Using Firebase Emulator

1. Install Firebase Tools:
   ```bash
   npm install -g firebase-tools
   ```

2. Initialize Firebase:
   ```bash
   firebase init firestore
   ```

3. Start Emulator:
   ```bash
   firebase emulators:start --only firestore
   ```

4. Test rules using Firebase Emulator Suite UI (usually at http://localhost:4000)

### Testing Checklist

- [ ] Unauthenticated users cannot access any data
- [ ] Employees can read their own data
- [ ] Employees cannot read other employees' data
- [ ] Employees cannot modify data they don't own
- [ ] Admins can read all data
- [ ] Admins can modify all data
- [ ] Role changes are prevented for non-admins
- [ ] Required fields are enforced on create
- [ ] Status transitions are valid

## Deployment

### Deploy Rules to Firebase

```bash
# Deploy only security rules
firebase deploy --only firestore:rules

# Or deploy everything
firebase deploy
```

### View Rules in Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Review and test rules

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check if user is authenticated
   - Verify user role in `users` collection
   - Ensure employee document exists for employees

2. **Admin Access Not Working**
   - Verify `users/{userId}` document exists
   - Check that `role` field is exactly 'admin'
   - Ensure user document ID matches Firebase Auth UID

3. **Employee Access Issues**
   - Verify employee document exists with matching `userId`
   - Check that employee `employeeId` matches attendance/leave records

## Notes

- Rules use `get()` calls which count as reads (cost consideration)
- Consider caching user data in client to reduce `get()` calls
- Rules are evaluated on every request
- Complex rules may impact query performance

## Updates

When adding new collections, ensure:
1. Helper functions are used appropriately
2. Role checks are consistent
3. Required fields are validated
4. Ownership rules are enforced
5. Documentation is updated



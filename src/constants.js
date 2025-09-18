export const DB_NAME = "campusHub";

// USER constants
export const UserRolesEnum = {
    ADMIN: "admin",
    FACULTY: "faculty",
    STUDENT: "student",
}

export const AvailableUserRoles = Object.values(UserRolesEnum);

// API key constants
export const ApiKeyStatusEnum = {
    ACTIVE: "active",
    INACTIVE: "inactive",
}

export const AvailableApiKeyStatus = Object.values(ApiKeyStatusEnum);

// ENROLLMENT constants
export const EnrollStatusEnum = {
    ACTIVE: "active",
    COMPLETED: "completed",
    DROPPED: "dropped",
}

export const AvailableEnrollStatus = Object.values(EnrollStatusEnum);

// ATTENDANCE constants
export const AttendaceStatusEnum = {
    PRESENT: "present",
    ABSENT: "absent",
}

export const AvailableAttendanceStatus = Object.values(AttendaceStatusEnum);

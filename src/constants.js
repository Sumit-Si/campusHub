export const DB_NAME = "campusHub";

export const UserRolesEnum = {
    ADMIN: "admin",
    FACULTY: "faculty",
    STUDENT: "student",
}

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const ApiKeyStatusEnum = {
    ACTIVE: "active",
    INACTIVE: "inactive",
}

export const AvailableApiKeyStatus = Object.values(ApiKeyStatusEnum);

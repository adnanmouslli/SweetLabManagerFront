import { RootState } from "@/redux/store";
import { useCallback } from "react";
import { useSelector } from "react-redux";

// Define the Role enum to match your existing roles
export enum Role {
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  ShiftManager = "ShiftManager",
  TreasuryManager = "TreasuryManager",
  TrayManager = "TrayManager",
}

// Custom hook for role-based access control
export const useRoles = () => {
  // Use the existing Redux selector to get roles
  const roles = useSelector(
    (state: RootState) => state.user.user.user?.roles || []
  );

  // Check if user has a specific role
  const hasRole = useCallback(
    (role: Role) => {
      // SUPER_ADMIN has all roles
      if (roles.includes(Role.SUPER_ADMIN)) return true;
      return roles.includes(role);
    },
    [roles]
  );

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback(
    (checkRoles: Role[]) => {
      // SUPER_ADMIN has all roles
      if (roles.includes(Role.SUPER_ADMIN)) return true;
      return checkRoles.some((role) => roles.includes(role));
    },
    [roles]
  );

  // Check if user has all specified roles
  const hasAllRoles = useCallback(
    (checkRoles: Role[]) => {
      return checkRoles.every((role) => roles.includes(role));
    },
    [roles]
  );

  // Get all user roles
  const getUserRoles = useCallback(() => {
    return roles;
  }, [roles]);

  return {
    roles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getUserRoles,
  };
};

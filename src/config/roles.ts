export type UserRole = "guest" | "user" | "admin";

export const ROLES: Record<string, UserRole> = {
  GUEST: "guest",
  USER: "user",
  ADMIN: "admin",
};

export function canAccessAdmin(role: string | undefined | null): boolean {
  return role === ROLES.ADMIN;
}
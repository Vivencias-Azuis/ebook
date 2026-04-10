export function hasAdminRole(
  user: unknown,
) {
  return (
    typeof user === "object" &&
    user !== null &&
    "role" in user &&
    (user as { role?: string | null }).role === "admin"
  );
}

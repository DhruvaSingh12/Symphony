export function getUserInitials(name?: string | null): string {
  if (!name) return "?";
  
  const parts = name.trim().split(" ");
  
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  
  return parts[0]?.[0]?.toUpperCase() || "?";
}

export function getUserDisplayName(
  user: { full_name?: string | null } | null | undefined,
  fallback: string = "Unknown User"
): string {
  return user?.full_name || fallback;
}
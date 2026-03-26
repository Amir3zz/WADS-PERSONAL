export function getAvatarUrl(name: string, size = 128): string {
  const encodedName = encodeURIComponent(name.trim() || "User");
  return `https://ui-avatars.com/api/?name=${encodedName}&size=${size}&background=6366f1&color=fff&bold=true`;
}
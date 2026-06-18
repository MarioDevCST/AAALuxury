export const secretAdminAccessKey = "secretAdminAccess";
export const adminEmail = "admin@admin.com";

export function grantSecretAdminAccess() {
  try {
    sessionStorage.setItem(secretAdminAccessKey, "1");
  } catch {}
}

export function hasSecretAdminAccess() {
  try {
    return sessionStorage.getItem(secretAdminAccessKey) === "1";
  } catch {
    return false;
  }
}

export function revokeSecretAdminAccess() {
  try {
    sessionStorage.removeItem(secretAdminAccessKey);
  } catch {}
}

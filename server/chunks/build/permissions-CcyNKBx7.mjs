function can(user, permission) {
  var _a;
  if (!user) return false;
  if (user.is_super_admin === true) return true;
  return !!((_a = user.permissions) == null ? void 0 : _a.includes(permission));
}
function canAny(user, permissions) {
  return permissions.some((p) => can(user, p));
}
const ADMIN_AREA_PERMISSIONS = [
  "guides.view",
  "government_services.view",
  "government_offices.view",
  "appointment_guides.view",
  "italian_lessons.view",
  "patente.view",
  "universities.view",
  "users.view",
  "roles.view",
  "subscriptions.view",
  "plans.view",
  "job_sources.view",
  "jobs.view",
  "audit_logs.view",
  "reports.view"
];
function hasAdminAccess(user) {
  return canAny(user, ADMIN_AREA_PERMISSIONS);
}

export { can as a, canAny as c, hasAdminAccess as h };
//# sourceMappingURL=permissions-CcyNKBx7.mjs.map

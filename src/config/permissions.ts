export enum Permission {
  // User permissions
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // Role permissions
  ROLE_CREATE = 'role:create',
  ROLE_READ = 'role:read',
  ROLE_UPDATE = 'role:update',
  ROLE_DELETE = 'role:delete',

  // Category permissions
  CATEGORY_CREATE = 'category:create',
  CATEGORY_READ = 'category:read',
  CATEGORY_UPDATE = 'category:update',
  CATEGORY_DELETE = 'category:delete',

  // course permissions
  COURSE_CREATE = 'course:create',
  COURSE_READ = 'course:read',
  COURSE_UPDATE = 'course:update',
  COURSE_DELETE = 'course:delete',
}

export const ALL_PERMISSIONS = Object.values(Permission);

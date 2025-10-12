// lib/permissions.ts
export type UserRole = "staff" | "instructor" | "user";

export interface User {
  id: number;
  role: UserRole;
  [key: string]: any;
}

export interface Activity {
  id: number;
  uid: number; // lecturer id
  [key: string]: any;
}

/**
 * Check if user can edit/delete an activity
 */
export function canUserModifyActivity(user: User | null, activity: Activity): boolean {
  if (!user) return false;
  
  return (
    user.role === "staff" || 
    (user.role === "instructor" && activity.uid === user.id)
  );
}

/**
 * Check if user can view activities (everyone can view)
 */
export function canUserViewActivity(user: User | null): boolean {
  return true; // All users can view activities
}

/**
 * Check if user can create activities
 */
export function canUserCreateActivity(user: User | null): boolean {
  if (!user) return false;
  
  return user.role === "staff" || user.role === "instructor";
}
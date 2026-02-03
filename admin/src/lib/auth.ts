import bcrypt from 'bcryptjs';
import { query } from './postgres';
import type { UserRole } from '../types/database';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: UserRole;
  phone?: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Register new user
export async function registerUser(userData: RegisterData): Promise<User> {
  const { email, password, full_name, role = 'user', phone } = userData;
  
  // Check if user already exists
  const existingUser = await query('SELECT id FROM profiles WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new Error('User with this email already exists');
  }
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Insert new user
  const result = await query(
    `INSERT INTO profiles (email, password_hash, full_name, role, phone) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, email, full_name, role, phone, created_at, updated_at`,
    [email, passwordHash, full_name, role, phone]
  );
  
  return result.rows[0];
}

// Login user
export async function loginUser(credentials: LoginCredentials): Promise<User> {
  const { email, password } = credentials;
  
  // Find user by email
  const result = await query(
    'SELECT id, email, password_hash, full_name, role, phone, created_at, updated_at FROM profiles WHERE email = $1',
    [email]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Invalid credentials');
  }
  
  const user = result.rows[0];
  
  // Verify password
  const isValidPassword = await verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }
  
  // Remove password hash from returned user object
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  const result = await query(
    'SELECT id, email, full_name, role, phone, created_at, updated_at FROM profiles WHERE id = $1',
    [userId]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<Pick<User, 'full_name' | 'phone'>>): Promise<User> {
  const fields = [];
  const values = [];
  let paramIndex = 1;
  
  if (updates.full_name !== undefined) {
    fields.push(`full_name = $${paramIndex++}`);
    values.push(updates.full_name);
  }
  
  if (updates.phone !== undefined) {
    fields.push(`phone = $${paramIndex++}`);
    values.push(updates.phone);
  }
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  values.push(userId);
  
  const result = await query(
    `UPDATE profiles SET ${fields.join(', ')} WHERE id = $${paramIndex} 
     RETURNING id, email, full_name, role, phone, created_at, updated_at`,
    values
  );
  
  return result.rows[0];
}

// Change password
export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  // Get current password hash
  const result = await query('SELECT password_hash FROM profiles WHERE id = $1', [userId]);
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  
  const { password_hash } = result.rows[0];
  
  // Verify current password
  const isValidPassword = await verifyPassword(currentPassword, password_hash);
  if (!isValidPassword) {
    throw new Error('Current password is incorrect');
  }
  
  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);
  
  // Update password
  await query('UPDATE profiles SET password_hash = $1 WHERE id = $2', [newPasswordHash, userId]);
}

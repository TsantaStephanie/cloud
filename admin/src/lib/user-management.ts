import { supabase } from './supabase';
import { collections, Utilisateur, dateToTimestamp } from './firebase';
import { addDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import type { UserRole } from '../types/database';
import { Timestamp } from 'firebase/firestore';

export interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

export interface CreateUserResult {
  success: boolean;
  message: string;
  userId?: string;
  postgresError?: string;
  firebaseError?: string;
}

// Créer un utilisateur dans PostgreSQL (via Supabase)
export async function createUserInPostgres(userData: CreateUserData): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // Créer d'abord l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.fullName,
        role: userData.role,
        phone: userData.phone || null
      }
    });

    if (authError) {
      throw new Error(`Supabase Auth error: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Failed to create user in Supabase Auth');
    }

    // Créer le profil dans la table profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: userData.email,
        full_name: userData.fullName,
        role: userData.role,
        phone: userData.phone || null
      } as any);

    if (profileError) {
      throw new Error(`Profile creation error: ${profileError.message}`);
    }

    return { success: true, userId: authData.user.id };
  } catch (error) {
    console.error('PostgreSQL user creation error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown PostgreSQL error' 
    };
  }
}

// Créer un utilisateur dans Firebase
export async function createUserInFirebase(userData: CreateUserData): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // Hasher le mot de passe pour Firebase
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Créer l'objet utilisateur pour Firebase
    const firebaseUser: Omit<Utilisateur, 'id'> = {
      email: userData.email,
      mot_de_passe_hash: hashedPassword,
      role: userData.role === 'admin' ? 'admin' : 'utilisateur',
      date_creation: dateToTimestamp(new Date())
    };

    // Ajouter l'utilisateur à la collection Firebase
    const docRef = await addDoc(collections.utilisateurs, firebaseUser);

    return { success: true, userId: docRef.id };
  } catch (error) {
    console.error('Firebase user creation error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown Firebase error' 
    };
  }
}

// Créer un utilisateur dans les deux bases de données
export async function createUserInBothDatabases(userData: CreateUserData): Promise<CreateUserResult> {
  const result: CreateUserResult = {
    success: false,
    message: ''
  };

  try {
    // Créer dans PostgreSQL
    const postgresResult = await createUserInPostgres(userData);
    
    if (!postgresResult.success) {
      result.postgresError = postgresResult.error;
      result.message = `Échec de la création dans PostgreSQL: ${postgresResult.error}`;
      return result;
    }

    // Créer dans Firebase
    const firebaseResult = await createUserInFirebase(userData);
    
    if (!firebaseResult.success) {
      result.firebaseError = firebaseResult.error;
      result.message = `Utilisateur créé dans PostgreSQL mais échec dans Firebase: ${firebaseResult.error}`;
      return result;
    }

    result.success = true;
    result.message = 'Utilisateur créé avec succès dans PostgreSQL et Firebase';
    result.userId = postgresResult.userId;
    
    return result;
  } catch (error) {
    result.message = `Erreur inattendue: ${error instanceof Error ? error.message : 'Unknown error'}`;
    return result;
  }
}

// Valider les données de création d'utilisateur
export function validateCreateUserData(userData: CreateUserData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!userData.email || !userData.email.includes('@')) {
    errors.push('Email invalide');
  }

  if (!userData.fullName || userData.fullName.trim().length < 2) {
    errors.push('Le nom complet doit contenir au moins 2 caractères');
  }

  if (!userData.role || !['utilisateur', 'admin'].includes(userData.role)) {
    errors.push('Rôle invalide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

import { collections, Utilisateur, dateToTimestamp } from './firebase';
import { addDoc } from 'firebase/firestore';
//import bcrypt from 'bcryptjs';
import type { UserRole } from '../types/database';
//import { Timestamp } from 'firebase/firestore';

// Configuration de l'API backend admin
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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

// Créer un utilisateur dans PostgreSQL (via notre backend)
export async function createUserInPostgres(userData: CreateUserData): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        role: userData.role
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Backend error: ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Backend error: ${data.message || 'Unknown error'}`);
    }

    return {
      success: true,
      userId: data.user?.id?.toString()
    };
  } catch (error) {
    console.error('PostgreSQL user creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Créer un utilisateur dans Firebase
export async function createUserInFirebase(userData: CreateUserData): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // Hasher le mot de passe pour Firebase
    const hashedPassword = userData.password;

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

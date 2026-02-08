import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Utilisateur, RouteEndommagee, SignalementHorsLigne } from '../types/firebase';

// Services pour les utilisateurs
export const utilisateurService = {
  async create(utilisateur: Omit<Utilisateur, 'userId' | 'dateCreation'>) {
    const docRef = await addDoc(collection(db, 'utilisateurs'), {
      ...utilisateur,
      dateCreation: Timestamp.now()
    });
    return docRef.id;
  },

  async getById(userId: string) {
    const docRef = doc(db, 'utilisateurs', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { userId: docSnap.id, ...docSnap.data() } as Utilisateur : null;
  },

  async getByEmail(email: string) {
    const q = query(collection(db, 'utilisateurs'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { userId: doc.id, ...doc.data() } as Utilisateur;
    }
    return null;
  }
};

// Services pour les routes endommagées
export const routeService = {
  async create(route: Omit<RouteEndommagee, 'routeId' | 'dateCreation' | 'dateMiseAJour'>) {
    const docRef = await addDoc(collection(db, 'routesEndommagees'), {
      ...route,
      dateCreation: Timestamp.now(),
      dateMiseAJour: Timestamp.now()
    });
    return docRef.id;
  },

  async getAll() {
    const q = query(collection(db, 'routesEndommagees'), orderBy('dateCreation', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        routeId: doc.id,
        ...data,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateMiseAJour: data.dateMiseAJour?.toDate() || new Date()
      } as RouteEndommagee;
    });
  },

  async update(routeId: string, data: Partial<RouteEndommagee>) {
    const docRef = doc(db, 'routesEndommagees', routeId);
    await updateDoc(docRef, {
      ...data,
      dateMiseAJour: Timestamp.now()
    });
  },

  async delete(routeId: string) {
    const docRef = doc(db, 'routesEndommagees', routeId);
    await deleteDoc(docRef);
  }
};

// Services pour les signalements hors ligne
export const signalementService = {
  async create(signalement: Omit<SignalementHorsLigne, 'signalementId' | 'dateCreation'>) {
    const docRef = await addDoc(collection(db, 'signalementsHorsLigne'), {
      ...signalement,
      dateCreation: Timestamp.now()
    });
    return docRef.id;
  },

  async getAll() {
    const q = query(collection(db, 'signalementsHorsLigne'), orderBy('dateCreation', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ signalementId: doc.id, ...doc.data() } as SignalementHorsLigne));
  }
};

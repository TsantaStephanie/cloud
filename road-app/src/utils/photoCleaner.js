// Utilitaire pour nettoyer les photos de Firebase
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export const cleanAllPhotos = async () => {
  console.log('🧹 Nettoyage de toutes les photos...');
  
  try {
    const db = getFirestore();
    const routesRef = collection(db, 'routes_endommagees');
    const querySnapshot = await getDocs(routesRef);
    
    let updatedCount = 0;
    
    for (const docSnapshot of querySnapshot.docs) {
      const docRef = doc(db, 'routes_endommagees', docSnapshot.id);
      const data = docSnapshot.data();
      
      // Vérifier si le document a des photos
      if (data.imageUrl || (data.images && data.images.length > 0)) {
        await updateDoc(docRef, {
          imageUrl: null,
          images: [],
          date_mise_a_jour: new Date()
        });
        
        updatedCount++;
        console.log(`🗑️ Photos supprimées pour: ${data.description || docSnapshot.id}`);
      }
    }
    
    console.log(`✅ ${updatedCount} documents mis à jour`);
    return updatedCount;
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return 0;
  }
};

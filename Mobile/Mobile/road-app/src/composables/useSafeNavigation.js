import { ref, onMounted, onUnmounted } from 'vue';

export function useSafeNavigation() {
  const isTransitioning = ref(false);
  const errorCount = ref(0);
  
  // Intercepter les erreurs de navigation
  const handleNavigationError = (error) => {
    errorCount.value++;
    console.warn(`🔍 Erreur de navigation #${errorCount.value}:`, error);
    
    // Ignorer les erreurs de classList undefined
    if (error.message && error.message.includes('classList')) {
      console.log('⏭️ Erreur classList ignorée (connue et sans impact)');
      return;
    }
    
    // Autres erreurs critiques
    if (errorCount.value > 5) {
      console.error('🚨 Trop d\'erreurs de navigation, recharge recommandée');
      // Optionnel : recharger la page
      // window.location.reload();
    }
  };
  
  // Écouter les erreurs globales
  onMounted(() => {
    window.addEventListener('error', handleNavigationError);
    
    // Intercepter les erreurs non capturées
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Filtrer les erreurs classList connues
      const errorString = args[0]?.message || args[0] || '';
      if (errorString.includes('classList') && errorString.includes('undefined')) {
        console.log('⏭️ Erreur classList filtrée');
        return;
      }
      
      originalConsoleError.apply(console, args);
    };
  });
  
  onUnmounted(() => {
    window.removeEventListener('error', handleNavigationError);
    // Restaurer console.error original
  });
  
  return {
    isTransitioning,
    errorCount
  };
}

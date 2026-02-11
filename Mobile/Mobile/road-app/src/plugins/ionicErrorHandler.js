import { App } from '@capacitor/app';

// Plugin pour gérer les erreurs Ionic de manière globale
const IonicErrorHandler = {
  install() {
    // Intercepter les erreurs globales
    window.addEventListener('error', (event) => {
      const errorMessage = event.error?.message || event.message || '';
      
      // Filtrer les erreurs classList connues et inoffensives
      if (errorMessage.includes('classList') && errorMessage.includes('undefined')) {
        console.log('⏭️ Erreur classList filtrée (Ionic navigation)');
        event.preventDefault();
        return false;
      }
      
      // Filtrer les erreurs de transition Ionic
      if (errorMessage.includes('isViewVisible') || 
          errorMessage.includes('handlePageTransition') ||
          errorMessage.includes('setupViewItem')) {
        console.log('⏭️ Erreur de navigation Ionic filtrée');
        event.preventDefault();
        return false;
      }
      
      // Autres erreurs critiques
      console.error('🚨 Erreur critique:', event.error);
    });
    
    // Intercepter les promesses rejetées
    window.addEventListener('unhandledrejection', (event) => {
      const errorMessage = event.reason?.message || '';
      
      if (errorMessage.includes('classList') && errorMessage.includes('undefined')) {
        console.log('⏭️ Erreur classList dans promesse filtrée');
        event.preventDefault();
        return false;
      }
      
      console.error('🚨 Promesse rejetée:', event.reason);
    });
    
    // Surcharge de console.error pour filtrager
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorString = args[0]?.message || args[0] || '';
      
      // Filtrer les erreurs connues et inoffensives
      if (errorString.includes('classList') && 
          (errorString.includes('undefined') || errorString.includes('Cannot read'))) {
        console.log('⏭️ Console.error classList filtrée');
        return;
      }
      
      if (errorString.includes('isViewVisible') || 
          errorString.includes('handlePageTransition')) {
        console.log('⏭️ Console.error navigation filtrée');
        return;
      }
      
      // Appeler l'original pour les autres erreurs
      originalConsoleError.apply(console, args);
    };
    
    // Surcharge de console.warn pour filtrage
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const warnString = args[0]?.message || args[0] || '';
      
      if (warnString.includes('classList') && 
          (warnString.includes('undefined') || warnString.includes('Cannot read'))) {
        console.log('⏭️ Console.warn classList filtrée');
        return;
      }
      
      originalConsoleWarn.apply(console, args);
    };
    
    console.log('✅ Gestionnaire d\'erreurs Ionic installé');
  }
};

export default IonicErrorHandler;

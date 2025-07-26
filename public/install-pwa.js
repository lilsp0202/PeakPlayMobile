// PWA Installation Script
let deferredPrompt;
let installButton;

// Wait for the page to load
window.addEventListener('load', () => {
  // Check if the app is already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('PWA is already installed');
    return;
  }

  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA install prompt available');
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button or trigger custom install flow
    showInstallPromotion();
  });

  // Listen for the appinstalled event
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed successfully');
    deferredPrompt = null;
    hideInstallPromotion();
  });
});

function showInstallPromotion() {
  // Create install button if it doesn't exist
  if (!installButton) {
    installButton = document.createElement('button');
    installButton.id = 'pwa-install-button';
    installButton.innerHTML = '📱 Install App';
    installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #3B82F6;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      z-index: 1000;
      transition: all 0.3s ease;
    `;
    
    installButton.addEventListener('click', installPWA);
    installButton.addEventListener('mouseenter', () => {
      installButton.style.transform = 'scale(1.05)';
      installButton.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
    });
    installButton.addEventListener('mouseleave', () => {
      installButton.style.transform = 'scale(1)';
      installButton.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
    });
    
    document.body.appendChild(installButton);
  }
  
  // Show the button
  installButton.style.display = 'block';
}

function hideInstallPromotion() {
  if (installButton) {
    installButton.style.display = 'none';
  }
}

async function installPWA() {
  if (!deferredPrompt) {
    console.log('No install prompt available');
    return;
  }

  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    console.log('User accepted the install prompt');
  } else {
    console.log('User dismissed the install prompt');
  }
  
  // Clear the deferredPrompt
  deferredPrompt = null;
  hideInstallPromotion();
}

// Export functions for use in React components
window.PWAInstaller = {
  install: installPWA,
  isInstallable: () => !!deferredPrompt,
  isInstalled: () => window.matchMedia('(display-mode: standalone)').matches
}; 
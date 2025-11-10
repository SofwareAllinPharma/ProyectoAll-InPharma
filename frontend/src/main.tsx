import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './app/App.tsx'
import { AuthProvider } from './lib/auth'
import { ToastProvider } from './components/ui/toast/ToastContext';
import { GlobalSnackProvider } from './components/ui/overlay/GlobalSnackContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <GlobalSnackProvider>
          <App />
        </GlobalSnackProvider>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)

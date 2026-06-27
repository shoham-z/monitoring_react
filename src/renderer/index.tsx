import { createRoot } from 'react-dom/client';
import App from './App';
import i18n from '../i18n/config';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

const initializeApp = async () => {
  try {
    const response = await window.electron.ipcRenderer.getVars();
    if (response.success && response.content.LANGUAGE) {
      i18n.changeLanguage(response.content.LANGUAGE);
      document.documentElement.dir =
        response.content.LANGUAGE === 'he' ? 'rtl' : 'ltr';
    }
  } catch {
    // ignore loading errors and use fallback language
  }

  root.render(<App />);
};

initializeApp();

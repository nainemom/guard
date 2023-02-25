import { createRoot } from 'react-dom/client';
import '@/main.css';
import {
  Routes,
  Route,
  Navigate,
  HashRouter,
} from 'react-router-dom';

import Profile from '@/pages/Profile';
import Encrypt from '@/pages/Encrypt';
import Decrypt from '@/pages/Decrypt';
import { Dialogs } from '@/services/dialog';
import { useEffect, useState } from 'react';
import { getAuth, saveAuth } from './services/auth';
import { generatePairKeys } from './services/cryptography';
import { Notifcations } from './services/notification';

function Main() {
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const personalKeys = getAuth();
    if (personalKeys === null) {
      generatePairKeys().then(saveAuth).then(() => {
        setIsReady(true);
      });
    } else {
      setIsReady(true);
    }
  }, []);

  return isReady ? (
    <Notifcations>
      <Dialogs>
        { /* @ts-ignore */ }
        <HashRouter>
          <Routes>
            <Route key="profile" path="/profile" element={<Profile />} />
            <Route key="encrypt" path="/encrypt/:receiver?" element={<Encrypt />} />
            <Route key="encrypt" path="/decrypt" element={<Decrypt />} />
            <Route key="*" path="/*" element={<Navigate to="/profile" />} />
          </Routes>
        </HashRouter  >
      </Dialogs>
    </Notifcations>
  ) : (
    <div>Please wait...</div>
  );
}

createRoot(
  document.querySelector('#app') as HTMLElement,
).render((<Main />));

/* @ts-ignore */
console.info(`Guard v${APP_VERSION}`);
console.log('%cDO NOT PASTE ANYTHING HERE!', 'font-family:system-ui;color:red;font-size:2rem;font-weight:bold');
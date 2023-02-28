import { createRoot  } from 'react-dom/client';
import '@/main.css';
import {
  Routes,
  Route,
  Navigate,
  HashRouter,
} from 'react-router-dom';
import { lazy, Suspense } from 'react';

const Setup = lazy(() => import('@/pages/Setup'));
const Encrypt = lazy(() => import('@/pages/Encrypt'));
const Decrypt = lazy(() => import('@/pages/Decrypt'));

import { Dialogs } from '@/services/dialog';
import { Notifcations } from './services/notification';

function Main() {
  return (
    <Notifcations>
      <Dialogs>
        <HashRouter>
          <Routes>
            <Route key="setup" path="/setup" element={<Suspense><Setup /></Suspense>} />
            <Route key="decrypt" path="/decrypt" element={<Suspense><Decrypt /></Suspense>} />
            <Route key="encrypt" path="/encrypt/:receiver" element={<Suspense><Encrypt /></Suspense>} />
            <Route key="*" path="*" element={<Navigate to="/decrypt" />} />
          </Routes>
        </HashRouter>
      </Dialogs>
    </Notifcations>
  );
}

createRoot(
  document.querySelector('#app') as HTMLElement,
).render((<Main />));

/* @ts-ignore */
console.info(`Guard v${APP_VERSION}`);
console.log('%cDO NOT PASTE ANYTHING HERE!', 'font-family:system-ui;color:red;font-size:2rem;font-weight:bold');
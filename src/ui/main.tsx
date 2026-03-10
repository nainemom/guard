import { type FC, type ReactNode, Suspense, use } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Redirect, Route, Router, Switch } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { dbReady } from '@/db';
import { KeyCreatePage } from './keys/KeyCreatePage';
import { KeyDetailsPage } from './keys/KeyDetailsPage';
import { KeysListPage } from './keys/KeysListPage';
import { InstallPrompt, ToastProvider } from './shared';
import './main.css';

const DbGate: FC<{ children: ReactNode }> = ({ children }) => {
  use(dbReady);
  return children;
};

const root = document.querySelector<HTMLElement>('#app') as HTMLElement;

createRoot(root).render(
  <Suspense>
    <ToastProvider>
      <InstallPrompt />
      <DbGate>
        <Router
          hook={useHashLocation}
          aroundNav={(nav, to, opts) => {
            if (!document.startViewTransition) {
              nav(to, opts);
              return;
            }
            document.startViewTransition(() => {
              flushSync(() => nav(to, opts));
            });
          }}
        >
          <Switch>
            <Route path="/keys" component={KeysListPage} />
            <Route path="/keys/new/:key?" component={KeyCreatePage} />
            <Route path="/keys/:id" component={KeyDetailsPage} />
            <Route path="/">
              <Redirect to="/keys" />
            </Route>
          </Switch>
        </Router>
      </DbGate>
    </ToastProvider>
  </Suspense>,
);

console.log(
  '%cDO NOT PASTE ANYTHING HERE!',
  'font-family:system-ui;color:red;font-size:2rem;font-weight:bold',
);
console.log(
  '%cThis app is fully local. All data stays on your device.\nNetwork access to external origins is blocked by CSP and Service Worker.',
  'font-family:system-ui;color:green;font-size:0.9rem',
);

if ('serviceWorker' in navigator) {
  const { getSerwist } = await import('virtual:serwist');
  const serwist = await getSerwist();
  serwist?.register();
}

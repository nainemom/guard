import { type FC, type ReactNode, Suspense, use } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Redirect, Route, Router, Switch } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { dbReady } from '@/db';
import { KeyCreatePage } from './keys/KeyCreatePage';
import { KeyDetailsPage } from './keys/KeyDetailsPage';
import { KeysListPage } from './keys/KeysListPage';
import './main.css';

const DbGate: FC<{ children: ReactNode }> = ({ children }) => {
  use(dbReady);
  return children;
};

const root = document.querySelector<HTMLElement>('#app') as HTMLElement;

createRoot(root).render(
  <Suspense>
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
          <Route path="/keys/new" component={KeyCreatePage} />
          <Route path="/keys/:id" component={KeyDetailsPage} />
          <Route path="/">
            <Redirect to="/keys" />
          </Route>
        </Switch>
      </Router>
    </DbGate>
  </Suspense>,
);

console.log(
  '%cDO NOT PASTE ANYTHING HERE!',
  'font-family:system-ui;color:red;font-size:2rem;font-weight:bold',
);

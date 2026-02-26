import { createRoot } from 'react-dom/client';
import '@/main.css';
import { StrictMode, Suspense } from 'react';
import { Route, Router, Switch } from 'wouter';
import Decrypt from './pages/Decrypt';
import Encrypt from './pages/Encrypt';
import Profile from './pages/Setup';

function Main() {
  return (
    <Suspense>
      <Router>
        <Switch>
          <Route path="/profile" component={Profile} />
          <Route path="/encrypt" component={Encrypt} />
          <Route path="/decrypt" component={Decrypt} />
          <Route />
        </Switch>
      </Router>
    </Suspense>
  );
}

const root = document.querySelector<HTMLElement>('#app')!;
createRoot(root).render(
  <StrictMode>
    <Main />
  </StrictMode>,
);

/* @ts-expect-error */
console.log(
  '%cDO NOT PASTE ANYTHING HERE!',
  'font-family:system-ui;color:red;font-size:2rem;font-weight:bold',
);

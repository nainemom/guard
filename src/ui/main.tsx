import { default as Framework7 } from 'framework7/lite/bundle';
import { App, default as Framework7React, View } from 'framework7-react';
import { type FC, type ReactNode, Suspense, use } from 'react';
import { createRoot } from 'react-dom/client';
import { dbReady } from '@/db';
import { HomePage } from './routes/HomePage';
import { TestPage } from './routes/TestPage';
import './main.css';

Framework7.use(Framework7React);

const routes = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/test',
    component: TestPage,
  },
];

const DbGate: FC<{ children: ReactNode }> = ({ children }) => {
  use(dbReady);
  return children;
};

const root = document.querySelector<HTMLElement>('#app') as HTMLElement;

createRoot(root).render(
  <Suspense>
    <DbGate>
      <App name="Guard">
        <View
          main
          url="/"
          routes={routes}
          browserHistory
          browserHistorySeparator="#"
          browserHistoryOnLoad
        />
      </App>
    </DbGate>
  </Suspense>,
);

console.log(
  '%cDO NOT PASTE ANYTHING HERE!',
  'font-family:system-ui;color:red;font-size:2rem;font-weight:bold',
);

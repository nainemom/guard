import { render } from 'preact';
import '@/main.css';
import Router from 'preact-router';
import { createHashHistory } from 'history';

import Profile from '@/pages/Profile';
import Encrypt from '@/pages/Encrypt';
import Decrypt from '@/pages/Decrypt';
import Redirect from '@/components/common/Redirect';
import { Dialogs } from '@/services/dialog';
import { useEffect, useState } from 'preact/hooks';
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
        <Router history={createHashHistory()}>
          <Profile path="/profile" />
          <Encrypt path="/encrypt/:receiver?" />
          <Decrypt path="/decrypt" />
          <Redirect path="/" to="/profile" />
        </Router>
      </Dialogs>
    </Notifcations>
  ) : (
    <div>Please wait...</div>
  );
}

render(
  <Main />,
  document.querySelector('#app') as HTMLElement,
);

/* @ts-ignore */
console.info(`Guard v${APP_VERSION}`);
console.log('%cDO NOT PASTE ANYTHING HERE!', 'font-family:system-ui;color:red;font-size:2rem;font-weight:bold');
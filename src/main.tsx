import { render } from 'preact';
import '@/main.css';
import Router from 'preact-router';
import Profile from '@/views/Profile';
import Encrypt from '@/views/Encrypt';
import Decrypt from '@/views/Decrypt';
import Redirect from '@/components/common/Redirect';
import { Dialogs } from '@/services/dialog';
import { useEffect, useState } from 'preact/hooks';
import { getAuth, saveAuth } from './services/auth';
import { generatePairKeys } from './services/cryptography';

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
    <Dialogs>
      <Router>
        <Profile path="/profile" />
        <Encrypt path="/encrypt" />
        <Decrypt path="/decrypt" />
        <Redirect path="/:any" to="/profile" />
      </Router>
    </Dialogs>
  ) : (
    <div>Please wait...</div>
  );
}

render(
  <Main />,
  document.querySelector('#app') as HTMLElement,
);

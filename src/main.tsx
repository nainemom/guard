import { render } from 'preact';
import '@/main.css';
import Router from 'preact-router';
import Encrypt from '@/views/Encrypt';
import Decrypt from '@/views/Decrypt';
import Redirect from '@/components/common/Redirect';
import { Dialogs } from '@/services/dialog';

function Main() {
  return (
    <Dialogs>
      <Router>
        <Encrypt path="/encrypt" />
        <Decrypt path="/decrypt" />
        <Redirect path="/" to="/encrypt" />
      </Router>
    </Dialogs>
  );
}

render(
  <Main />,
  document.querySelector('#app') as HTMLElement,
);

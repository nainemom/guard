import { render } from 'preact';
import Router from 'preact-router';
import '@/style.css';

// Views
import Enter from '@/views/Enter';
import Home from '@/views/Home';
import Recipients from '@/views/Recipients';
import Encrypt from '@/views/Encrypt';
import Decrypt from '@/views/Decrypt';
import Redirect from '@/components/common/Redirect';

function Main() {
  return (
    <Router>
      <Enter path="/enter" />
      <Home path="/home" />
      <Recipients path="/recipients" />
      <Encrypt path="/encrypt" />
      <Decrypt path="/decrypt" />
      <Redirect path="/" to="/enter" />
    </Router>
  );
}

render(
  <Main />,
  document.querySelector('#app') as HTMLElement,
);

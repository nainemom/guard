import { render } from 'preact';
import { App } from './App';
import './style.css';

render(
  <App />,
  document.querySelector('#app') as HTMLElement,
);

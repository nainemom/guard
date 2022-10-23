import './Tabs.css';
import { Link } from 'preact-router/match';

export default function Tabs() {
  return (
    <nav class="x-tabs-container">
      <Link class="x-button x-button-md x-tab-button" activeClassName="x-tab-button-active" href="/keys">
        Keys
      </Link>
      <Link class="x-button x-button-md x-tab-button" activeClassName="x-tab-button-active" href="/encrypt">
        Encrypt
      </Link>
      <Link class="x-button x-button-md x-tab-button" activeClassName="x-tab-button-active" href="/decrypt">
        Decrypt
      </Link>
    </nav>
  );
}

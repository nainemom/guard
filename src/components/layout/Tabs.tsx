import './Tabs.css';
import { Link } from 'preact-router/match';

export default function Tabs() {
  return (
    <nav class="tabs-container">
      <Link class="button button-md tab-button" activeClassName="tab-button-active" href="/encrypt">
        Encrypt
      </Link>
      <Link class="button button-md tab-button" activeClassName="tab-button-active" href="/decrypt">
        Decrypt
      </Link>
    </nav>
  );
}

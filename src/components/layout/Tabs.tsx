import './Tabs.css';
import { Link } from 'preact-router/match';
import Icon from '../shared/Icon';

export default function Tabs() {
  return (
    <nav class="x-tabs-container">
      <Link class="x-button x-button-md x-tab-button" activeClassName="x-tab-button-active" href="/profile">
        <Icon name="manage_accounts" className="w-6 h-6" />
        Profile
      </Link>
      <Link class="x-button x-button-md x-tab-button gap-1" activeClassName="x-tab-button-active" href="/encrypt">
        <Icon name="mail_lock" className="w-6 h-6" />
        Encrypt
      </Link>
      <Link class="x-button x-button-md x-tab-button gap-1" activeClassName="x-tab-button-active" href="/decrypt">
        <Icon name="drafts" className="w-6 h-6" />
        Decrypt
      </Link>
    </nav>
  );
}

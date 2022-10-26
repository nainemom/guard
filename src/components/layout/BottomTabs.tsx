import './BottomTabs.css';
import { Link } from 'preact-router/match';
import Icon from '../shared/Icon';

export default function BottomTabs() {
  return (
    <nav class="x-bottom-tabs-container">
      <Link class="x-button x-button-lg x-button-rounded x-bottom-tab-button" activeClassName="x-bottom-tab-button-active" href="/profile">
        <Icon name="manage_accounts" className="w-7 h-7" />
      </Link>
      <Link class="x-button x-button-lg x-button-rounded x-bottom-tab-button gap-1" activeClassName="x-bottom-tab-button-active" href="/encrypt">
        <Icon name="mail_lock" className="w-7 h-7" />
      </Link>
      <Link class="x-button x-button-lg x-button-rounded x-bottom-tab-button gap-1" activeClassName="x-bottom-tab-button-active" href="/decrypt">
        <Icon name="drafts" className="w-7 h-7" />
      </Link>
    </nav>
  );
}

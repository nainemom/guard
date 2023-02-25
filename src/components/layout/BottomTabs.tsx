import './BottomTabs.css';
import { NavLink } from 'react-router-dom';
import Icon from '../shared/Icon';
import { cx } from '@/utils/cx';

export default function BottomTabs() {
  const withActiveClass = (className: string) => (state: { isActive: boolean }) => cx(state.isActive ? 'x-bottom-tab-button-active' : '', className)
  return (
    <nav className="x-bottom-tabs-container">
      <NavLink className={withActiveClass("x-button x-button-lg x-button-rounded x-bottom-tab-button")} to="/profile">
        <Icon name="manage_accounts" className="w-7 h-7" />
      </NavLink>
      <NavLink className={withActiveClass("x-button x-button-lg x-button-rounded x-bottom-tab-button gap-1")} to="/encrypt">
        <Icon name="mail_lock" className="w-7 h-7" />
      </NavLink>
      <NavLink className={withActiveClass("x-button x-button-lg x-button-rounded x-bottom-tab-button gap-1")} to="/decrypt">
        <Icon name="drafts" className="w-7 h-7" />
      </NavLink>
    </nav>
  );
}

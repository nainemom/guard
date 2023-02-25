import './Tabs.css';
import { cx } from '@/utils/cx';
import { ReactNode, createContext, useContext } from 'react';
import Button from '../form/Button';

type TabId = string | number | null;

type TabsProps = {
  children?: ReactNode,
  className?: string,
  value?: TabId,
  onChange?: (newTab: TabId) => void,
}

const tabsContext = createContext<{
  value?: TabId,
  onChange: (newTab: TabId) => void,
} | null>(null);

type TabItemProps = {
  tabId: TabId,
  children?: ReactNode,
  className?: string,
}

const tabDefaultProps = {
  onChange: () => {},
}

const tabItemDefaultProps = {
  onMenu: () => {},
  onClick: () => {},
}

export function Tabs(props: TabsProps) {
  const { children, className, value, onChange } = { ...tabDefaultProps, ...props };

  return (
    <tabsContext.Provider value={{ onChange, value }}>
      <div className={cx('x-tabs', className)}>
        { children }
      </div>
    </tabsContext.Provider>
  )
}

export function TabItem(props: TabItemProps) {
  const { children, className, tabId } = { ...tabItemDefaultProps, ...props };
  const parent = useContext(tabsContext);

  return (
    <Button
      size="lg"
      theme="transparent"
      rounded={false}
      className={cx('x-tab-item', tabId === parent?.value && 'x-tab-item-selected', className)}
      onClick={() => parent?.onChange(tabId)}
    >
      { children }
    </Button>
  )
}

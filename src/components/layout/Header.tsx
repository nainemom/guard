import { useAuth } from '@/services/auth';
import { createAuthFile, exportFileToUser } from '@/services/files';
import { showToast } from '@/services/notification';
import { share } from '@/utils/share';
import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, MenuActivator, MenuItem } from '../common/Menu';
import Icon from '@/components/shared/Icon';

type HeaderProps = {
  title: ReactNode,
  subtitle?: ReactNode,
  startButtons?: ReactNode,
}

export default function Header({ title, subtitle, startButtons }: HeaderProps) {
  const [auth, setAuth] = useAuth();

  const navigate = useNavigate();
  const { pathname: currentPath } = useLocation();

  const exportAuth = () => {
    if (!auth) return;
    const file = createAuthFile(auth);
    exportFileToUser(file);
  };

  const shareLink = () => {
    if (!auth) return;
    const shareLink = new URL(window.location.href);
    shareLink.hash = `#/encrypt/${encodeURIComponent(auth.public_key)}`;
    share(shareLink.href).then((type) => {
      if (type === 'clipboard') {
        showToast('Share Link Copied To Clipboard!');
      }
    });
  };

  return (
    <header className="h-16 shrink-0 flex items-center bg-section-normal text-section-content p-3 gap-3">
      { startButtons && (
        <div>
          { startButtons }
        </div>
      ) }
      <div className="flex-grow flex flex-row items-center gap-3">
        <img src={`${import.meta.env.BASE_URL}logo_white.svg`} className="w-10 h-10" alt="Guard Logo" />
        <div>
          { title && (<h2 className="text-xl font-semibold">{ title }</h2>) }
          { subtitle && (<p className="text-xs text-section-subtitle">{subtitle}</p>) }
        </div>
      </div>
      <a
        className="x-button x-button-transparent x-button-rounded x-button-lg x-button-circle"
        href="https://github.com/nainemom/guard"
        target="_blank"
        aria-label="Github Page"
      >
        <Icon name="github" className="h-6 w-6" />
      </a>
      <Menu>
        <MenuActivator circle theme="transparent" size="lg" ariaLabel="Profile Menu">
          <Icon name="manage_accounts" className="w-8 h-8" />
        </MenuActivator>
        { auth && currentPath !== '/decrypt' && (
          <MenuItem onClick={() => navigate('/decrypt')}>
            <Icon name="drafts" className="w-6 h-6" />
            <div>
              <h3>Decrypt</h3>
              <p className="text-xs text-section-subtitle">You can decrypt your encrypted message through this page</p>
            </div>
          </MenuItem>
        ) }
        { auth && (
          <MenuItem onClick={() => shareLink()}>
            <Icon name="share" className="w-6 h-6 shrink-0" />
            <div>
              <h3>Share</h3>
              <p className="text-xs text-section-subtitle">Create a unique url with your public key to let others encrypt data for you</p>
            </div>
          </MenuItem>
        ) }
        { auth && (
          <MenuItem onClick={() => exportAuth()}>
            <Icon name="save" className="w-6 h-6 shrink-0" />
            <div>
              <h3>Export</h3>
              <p className="text-xs text-section-subtitle">Generate a .auth file from your account to access it in future</p>
            </div>
          </MenuItem>
        ) }
        { auth && (
          <MenuItem onClick={() => setAuth(null)}>
            <Icon name="logout" className="w-6 h-6 shrink-0" /> Logout
          </MenuItem>
        ) }
        { !auth && (
          <MenuItem onClick={() => navigate('/setup')}>
            <Icon name="login" className="w-6 h-6" />
            <div>
              <h3>Login</h3>
              <p className="text-xs text-section-subtitle">Login to your own account or just generate a new account</p>
            </div>
          </MenuItem>
        ) }
      </Menu>
    </header>
  )
}

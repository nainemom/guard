import { Cancel01Icon, Download04Icon } from '@hugeicons/core-free-icons';
import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSessionStorage } from 'react-use';
import { Icon } from './Icon';
import { useToast } from './Toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'install-prompt-dismissed';

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.matchMedia('(display-mode: window-controls-overlay)').matches ||
  ('standalone' in navigator &&
    (navigator as { standalone?: boolean }).standalone === true);

const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);

const isAndroid = () => /Android/.test(navigator.userAgent);

// Capture the event globally so it's never missed due to React mount timing
let earlyPromptEvent: BeforeInstallPromptEvent | null = null;
const earlyListeners = new Set<(e: BeforeInstallPromptEvent) => void>();

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  earlyPromptEvent = e as BeforeInstallPromptEvent;
  for (const fn of earlyListeners) fn(earlyPromptEvent);
});

type PromptMode = 'none' | 'native' | 'ios-hint' | 'android-hint';

const PromptContent: FC<{ subtitle: ReactNode }> = ({ subtitle }) => (
  <>
    <div className="shrink-0 rounded-full bg-primary/10 p-2.5">
      <Icon icon={Download04Icon} size="lg" className="text-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-text">Install Guard</p>
      <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
    </div>
  </>
);

export const InstallPrompt: FC = () => {
  const toast = useToast();
  const toastIdRef = useRef<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(earlyPromptEvent);
  const [mode, setMode] = useState<PromptMode>(() => {
    if (earlyPromptEvent) return 'native';
    return 'none';
  });
  const [dismissed, setDismissed] = useSessionStorage(DISMISSED_KEY, false);

  const dismissToast = useCallback(() => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  }, [toast]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setDeferredPrompt(null);
    setMode('none');
    dismissToast();
  }, [setDismissed, dismissToast]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    const { outcome } = await deferredPrompt.prompt();
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      earlyPromptEvent = null;
      dismissToast();
    }
  }, [deferredPrompt, dismissToast]);

  useEffect(() => {
    if (isStandalone() || dismissed) return;

    const standaloneMq = window.matchMedia('(display-mode: standalone)');
    const wcoMq = window.matchMedia('(display-mode: window-controls-overlay)');
    const onStandalone = () => {
      if (standaloneMq.matches || wcoMq.matches) setMode('none');
    };
    standaloneMq.addEventListener('change', onStandalone);
    wcoMq.addEventListener('change', onStandalone);

    if (isIos()) {
      setMode('ios-hint');
      return () => {
        standaloneMq.removeEventListener('change', onStandalone);
        wcoMq.removeEventListener('change', onStandalone);
      };
    }

    if (earlyPromptEvent) {
      setDeferredPrompt(earlyPromptEvent);
      setMode('native');
      return () => {
        standaloneMq.removeEventListener('change', onStandalone);
        wcoMq.removeEventListener('change', onStandalone);
      };
    }

    const handler = (e: BeforeInstallPromptEvent) => {
      setDeferredPrompt(e);
      setMode('native');
    };
    earlyListeners.add(handler);

    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    if (isAndroid()) {
      fallbackTimer = setTimeout(() => {
        if (!earlyPromptEvent) {
          setMode('android-hint');
        }
      }, 3000);
    }

    return () => {
      earlyListeners.delete(handler);
      clearTimeout(fallbackTimer);
      standaloneMq.removeEventListener('change', onStandalone);
      wcoMq.removeEventListener('change', onStandalone);
    };
  }, [dismissed]);

  useEffect(() => {
    if (dismissed || mode === 'none') {
      dismissToast();
      return;
    }

    const isClickable = mode === 'native';

    const subtitle = isClickable ? (
      'Tap to add to your home screen'
    ) : mode === 'ios-hint' ? (
      <>Tap share, then &ldquo;Add to Home Screen&rdquo;</>
    ) : (
      <>Tap menu, then &ldquo;Install app&rdquo;</>
    );

    toastIdRef.current = toast.show(
      <div className="flex items-center">
        {isClickable ? (
          <button
            type="button"
            onClick={handleInstall}
            className="flex-1 flex items-center gap-4 p-4 text-left cursor-pointer active:scale-[0.98] transition-transform"
          >
            <PromptContent subtitle={subtitle} />
          </button>
        ) : (
          <div className="flex-1 flex items-center gap-4 p-4">
            <PromptContent subtitle={subtitle} />
          </div>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 p-1.5 mr-3 rounded-full text-text-muted hover:text-text transition-colors cursor-pointer"
        >
          <Icon icon={Cancel01Icon} size="sm" />
        </button>
      </div>,
      0,
    );

    return dismissToast;
  }, [mode, dismissed, toast, handleInstall, handleDismiss, dismissToast]);

  return null;
};

import { Cancel01Icon, Download04Icon } from '@hugeicons/core-free-icons';
import { type FC, useCallback, useEffect, useState } from 'react';
import { useSessionStorage } from 'react-use';
import { Icon } from './Icon';

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

export const InstallPrompt: FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(earlyPromptEvent);
  const [mode, setMode] = useState<PromptMode>(() => {
    if (earlyPromptEvent) return 'native';
    return 'none';
  });
  const [dismissed, setDismissed] = useSessionStorage(DISMISSED_KEY, false);

  useEffect(() => {
    if (isStandalone() || dismissed) return;

    if (isIos()) {
      setMode('ios-hint');
      return;
    }

    // If we already have the event, use it
    if (earlyPromptEvent) {
      setDeferredPrompt(earlyPromptEvent);
      setMode('native');
      return;
    }

    const handler = (e: BeforeInstallPromptEvent) => {
      setDeferredPrompt(e);
      setMode('native');
    };
    earlyListeners.add(handler);

    // If beforeinstallprompt doesn't fire within 3s on Android,
    // show a manual hint (covers Firefox, Samsung Internet, etc.)
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
    };
  }, [dismissed]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    const { outcome } = await deferredPrompt.prompt();
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      earlyPromptEvent = null;
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setDeferredPrompt(null);
    setMode('none');
  }, [setDismissed]);

  if (dismissed || mode === 'none') return null;

  const isClickable = mode === 'native';

  return (
    <div className="fixed bottom-6 left-4 right-4 mx-auto max-w-sm z-50 rounded-2xl shadow-2xl animate-in bg-surface border border-border flex items-center">
      {isClickable ? (
        <button
          type="button"
          onClick={handleInstall}
          className="flex-1 flex items-center gap-4 p-4 text-left cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="shrink-0 rounded-full bg-primary/10 p-2.5">
            <Icon icon={Download04Icon} size={22} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text">Install Guard</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Tap to add to your home screen
            </p>
          </div>
        </button>
      ) : (
        <div className="flex-1 flex items-center gap-4 p-4">
          <div className="shrink-0 rounded-full bg-primary/10 p-2.5">
            <Icon icon={Download04Icon} size={22} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text">Install Guard</p>
            <p className="text-xs text-text-secondary mt-0.5">
              {mode === 'ios-hint' ? (
                <>Tap share, then &ldquo;Add to Home Screen&rdquo;</>
              ) : (
                <>Tap menu, then &ldquo;Install app&rdquo;</>
              )}
            </p>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 p-1.5 mr-3 rounded-full text-text-muted hover:text-text transition-colors cursor-pointer"
      >
        <Icon icon={Cancel01Icon} size={16} />
      </button>
    </div>
  );
};

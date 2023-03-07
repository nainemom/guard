export function copyToClipboard(text: string): Promise<void> {
  return new Promise((resolve) => {
    const fallback = () => {
      // eslint-disable-next-line no-alert
      prompt('Copy this to clipboard!', text);
      resolve();
    };
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => resolve()).catch(fallback);
    } else {
      fallback();
    }
  });
}

export function osShare(text: string): Promise<void> {
  return navigator.share({
    text,
  });
}

export function share(text: string): Promise<'clipboard' | 'os'> {
  return osShare(text)
    .then(() => 'os')
    .catch(() => copyToClipboard(text))
    .then(() => 'clipboard');
}

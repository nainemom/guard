export const copyToClipboard = async (content: string): Promise<boolean> => new Promise((resolve) => {
  const fallback = () => {
    prompt('Copy this to clipboard!', content);
    resolve(false);
  };
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(content).then(() => resolve(true)).catch(fallback);
  } else {
    fallback();
  }
});
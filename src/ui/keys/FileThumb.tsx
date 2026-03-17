import { File01Icon } from '@hugeicons/core-free-icons';
import { type FC, useEffect, useState } from 'react';
import { Icon } from '../shared';

export const FileThumb: FC<{ file: File }> = ({ file }) => {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (src && file.type.startsWith('image/')) {
    return (
      <img
        src={src}
        alt={file.name}
        className="rounded-lg max-w-full max-h-28 object-contain"
      />
    );
  }

  if (src && file.type.startsWith('audio/')) {
    return (
      // biome-ignore lint/a11y/useMediaCaption: encrypted audio has no captions
      <audio src={src} controls className="w-full max-w-56" />
    );
  }

  return <Icon icon={File01Icon} size="xl" className="text-text-muted" />;
};

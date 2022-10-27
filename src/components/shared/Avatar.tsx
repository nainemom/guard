import { CryptographyPublicKey } from "@/services/cryptography";
import { cx } from "@/utils/cx";
import { useEffect, useState } from "preact/hooks";
import { createAvatar } from '@dicebear/avatars';
import * as bottts from '@dicebear/avatars-bottts-sprites';

export type AvatarProps = {
  publicKey: CryptographyPublicKey,
  className?: string,
}

export default function Avatar({ publicKey, className }: AvatarProps) {
  const [avatarContent, setAvatarContent] = useState<string>('');
  useEffect(() => {
    setAvatarContent(createAvatar(bottts, {
      seed: publicKey,
    }));
  }, [publicKey]);
  return (
    <div className={cx('inline-block', className)} dangerouslySetInnerHTML={{__html: avatarContent}} />
  );
}

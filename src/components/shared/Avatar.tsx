import { CryptographyPublicKey, hash } from "@/services/cryptography";
import { cx } from "@/utils/cx";
import { useEffect, useMemo, useState } from "preact/hooks";

export type AvatarProps = {
  publicKey: CryptographyPublicKey,
  className?: string,
}

export default function Avatar({ publicKey, className }: AvatarProps) {
  const [slug, setSlug] = useState<string>('');
  useEffect(() => {
    hash(publicKey).then(setSlug);
  }, [publicKey]);
  return (
    <img width="32" height="32" className={cx('inline-block', className)} src={`https://avatars.dicebear.com/api/bottts/${slug}.svg`} />
  );
}

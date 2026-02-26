import { useEffect, useState } from 'react';
import { type CryptographyPublicKey, hash } from '@/services/cryptography';

export type UsernameProps = {
  publicKey: CryptographyPublicKey;
  className?: string;
};

export default function Username({ publicKey }: UsernameProps) {
  const [username, setUsername] = useState<string>('');
  useEffect(() => {
    if (!publicKey) {
      setUsername('');
    } else {
      hash(publicKey).then(setUsername);
    }
  }, [publicKey]);
  return <>{username}</>;
}

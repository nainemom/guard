import { CryptographyPublicKey, hash } from "@/services/cryptography";
import { useEffect, useState } from "preact/hooks";

export type UsernameProps = {
  publicKey: CryptographyPublicKey,
  className?: string,
}

export default function Username({ publicKey }: UsernameProps) {
  const [username, setUsername] = useState<string>('');
  useEffect(() => {
    if (!publicKey) {
      setUsername('');
    } else {
      hash(publicKey).then(setUsername);
    }
  }, [publicKey]);
  return (<>{username}</>);
}

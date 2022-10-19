import { useStorage } from '@/services/storage';
import { CryptographyPairKeys } from '@/types';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { route, RouterProps } from 'preact-router';
import { generatePairKeys } from '@/services/cryptography';

export default function Enter(_props: RouterProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [personalKeys, setPersonalKeys] = useStorage<CryptographyPairKeys | null>('personal-keys');
  
  const goToHome = useCallback(() => route('/home'), []);

  const generate = useCallback(() => {
    generatePairKeys().then(setPersonalKeys).finally(() => {
      setLoading(false);
    });
  }, [setLoading, goToHome]);

  useEffect(() => {
    if (personalKeys) {
      goToHome();
    }
  }, [personalKeys]);

  return (
    <div>
      Enter.tsx
      <button onClick={generate} disabled={loading}>Generate And Enter</button>
      <button onClick={goToHome}>Skip</button>
    </div>
  )
}

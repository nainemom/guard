import Body from '@/components/layout/Body';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import Tabs from '@/components/layout/Tabs';
import { RouterProps } from 'preact-router';
import { storageKey as authStorageKey } from '@/services/auth';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { CryptographyPairKeys, decrypt } from '@/services/cryptography';
import Input from '@/components/form/Input';
import { useStorage } from '@/services/storage';
import Button from '@/components/form/Button';

let decryptTimer: number = -1;

export default function Decrypt(_props: RouterProps) {
  const [personalKeys] = useStorage<CryptographyPairKeys>(authStorageKey);
  const [encryptedMessage, setEncryptedMessage] = useState<string>('');
  const [decryptedMessage, setDecryptedMessage] = useState<string>('');

  useEffect(() => {
    clearTimeout(decryptTimer);
    if (encryptedMessage) {
      decryptTimer = setTimeout(() => doDecrypt(encryptedMessage), 300);
    }
    return () => {
      clearTimeout(decryptTimer);
    }
  }, [encryptedMessage]);

  const doDecrypt = useCallback((message: string) => {
    decrypt(message, personalKeys.private_key).then(setDecryptedMessage);
  }, [setDecryptedMessage, personalKeys]);

  const pasteFromClipboard = useCallback(() => {
    navigator.clipboard.readText().then(setEncryptedMessage);
  }, []);

  return (
    <Layout>
      <Header title="Guard App" subtitle="Encrypt and Decrypt Messages" />
      <Body className="flex flex-col">
        <div className="p-4 overflow-hidden relative">
          <Input
            size="manual"
            className="h-60 font-mono"
            value={encryptedMessage}
            onInput={setEncryptedMessage}
            multiLine
            placeholder="Enter Encrypted Message."
            label="Encrypted Message:"
          />
          <Button className="absolute bottom-6 right-6" size="sm" theme="primary" onClick={pasteFromClipboard}>Paste</Button>
        </div>
        <hr />
        <div className="p-4 flex-grow overflow-hidden relative">
          <h2 className="pb-2 text-base font-bold"> Output: </h2>
          <p className="pb-4 text-base text-body-content h-full w-full break-all overflow-auto">
            { decryptedMessage }
          </p>
        </div>
      </Body>
      <Tabs />
    </Layout>
  )
}

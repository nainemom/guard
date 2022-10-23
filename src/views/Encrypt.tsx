import Body from '@/components/layout/Body';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import Tabs from '@/components/layout/Tabs';
import { RouterProps } from 'preact-router';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { CryptographyPublicKey, encrypt } from '@/services/cryptography';
import Input from '@/components/form/Input';
import Button from '@/components/form/Button';

let decryptTimer: number = -1;

export default function Encrypt(_props: RouterProps) {
  const [publicKey, setPublicKey] = useState<CryptographyPublicKey>('');
  const [decryptedMessage, setDecryptedMessage] = useState<string>('');
  const [encryptedMessage, setEncryptedMessage] = useState<string>('');

  const doEncrypt = useCallback((message: string) => {
    encrypt(message, publicKey).then(setEncryptedMessage);
  }, [setDecryptedMessage, publicKey]);

  useEffect(() => {
    clearTimeout(decryptTimer);
    if (decryptedMessage) {
      decryptTimer = setTimeout(() => doEncrypt(decryptedMessage), 300);
    } else {
      setDecryptedMessage('');
    }
    return () => {
      clearTimeout(decryptTimer);
    }
  }, [decryptedMessage, doEncrypt, setDecryptedMessage]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(encryptedMessage);
  }, [encryptedMessage]);

  return (
    <Layout>
      <Header title="Guard App" subtitle="Encrypt and Decrypt Messages" />
      <Body className="flex flex-col">
        <div className="p-4 shrink-0">
          <Input
            size="md"
            value={publicKey}
            onInput={setPublicKey}
            placeholder="Receiver Public Key."
            label="Receiver:"
            className="mb-4"
          />
          <Input
            size="md"
            value={decryptedMessage}
            onInput={setDecryptedMessage}
            multiLine
            placeholder="Enter Your Raw Message."
            label="Message:"
          />
        </div>
        <hr />
        <div className="p-4 flex-grow overflow-hidden relative">
          <h2 className="pb-2 text-base font-bold"> Output: </h2>
          <p className="pb-4 text-base text-body-content h-full w-full break-all overflow-auto select-text font-mono">
            { encryptedMessage }
          </p>
          { encryptedMessage && (
            <Button className="absolute bottom-4 right-4" size="sm" theme="primary" onClick={copyToClipboard}>Copy</Button>
          ) }
        </div>
      </Body>
      <Tabs />
    </Layout>
  )
}

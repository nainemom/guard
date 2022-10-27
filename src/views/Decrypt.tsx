import Body from '@/components/layout/Body';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import BottomTabs from '@/components/layout/BottomTabs';
import { RouterProps } from 'preact-router';
import { storageKey as authStorageKey } from '@/services/auth';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { CryptographyPairKeys, decrypt } from '@/services/cryptography';
import Input from '@/components/form/Input';
import { useStorage } from '@/services/storage';
import Button from '@/components/form/Button';
import { Resizable, ResizableSection } from '@/components/common/Resizable';
import Icon from '@/components/shared/Icon';
import { ab2str, str2ab } from '@/utils/convert';

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
    decrypt(str2ab(message), personalKeys.private_key).then(ab2str).then(setDecryptedMessage);
  }, [setDecryptedMessage, personalKeys]);

  return (
    <Layout>
      <Header title="Guard App" subtitle="Encrypt and Decrypt Messages" />
      <Body>
        <Resizable>
          <ResizableSection className="p-4 h-64">
            <Input
              size="manual"
              className="h-full font-mono"
              value={encryptedMessage}
              onInput={setEncryptedMessage}
              multiLine
              placeholder="Enter Encrypted Message."
              label="Encrypted Message:"
            />
          </ResizableSection>
          <ResizableSection className="p-4">
            <h2 className="pb-2 text-base font-bold"> Output: </h2>
            <p className="pb-4 text-base text-body-content h-full w-full break-all overflow-auto whitespace-pre">
              { decryptedMessage }
            </p>
          </ResizableSection>
        </Resizable>
      </Body>
      <BottomTabs />
    </Layout>
  )
}

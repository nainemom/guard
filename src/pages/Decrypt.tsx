import Body from '@/components/layout/Body';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import BottomTabs from '@/components/layout/BottomTabs';
import { RouterProps } from 'preact-router';
import { storageKey as authStorageKey } from '@/services/auth';
import { useEffect, useState } from 'preact/hooks';
import { CryptographyPairKeys, decrypt } from '@/services/cryptography';
import Input from '@/components/form/Input';
import { useStorage } from '@/services/storage';
import { Resizable, ResizableSection } from '@/components/common/Resizable';
import { ab2str, uatob } from '@/utils/convert';

export default function Decrypt(_props: RouterProps) {
  const [personalKeys] = useStorage<CryptographyPairKeys>(authStorageKey);
  const [encryptedContent, setEncryptedContent] = useState<string>('');
  const [decryptedMessage, setDecryptedMessage] = useState<string>('');
  const [decryptTimer, setDecryptTimer] = useState<ReturnType<typeof setTimeout>>();
  const [decryptError, setDecryptError] = useState<boolean>(false);

  useEffect(() => {
    clearTimeout(decryptTimer);
    if (encryptedContent) {
      setDecryptTimer(setTimeout(async () => {
        try {
          setDecryptError(false);
          setDecryptedMessage(ab2str(await decrypt(uatob(encryptedContent), personalKeys.private_key)));
        } catch (_e) {
          setDecryptedMessage('');
          setDecryptError(true);
        }
      }, 300));
    }
    return () => {
      clearTimeout(decryptTimer);
    }
  }, [encryptedContent, setDecryptTimer, setDecryptedMessage, setDecryptError]);

  return (
    <Layout>
      <Header title="Guard App" subtitle="Encrypt and Decrypt Messages" />
      <Body>
        <Resizable>
          <ResizableSection className="p-3 h-64">
            <Input
              size="manual"
              className="h-full font-mono"
              value={encryptedContent}
              onInput={setEncryptedContent}
              multiLine
              placeholder="Enter Encrypted Content."
              label="Encrypted Content:"
            />
          </ResizableSection>
          <ResizableSection className="p-3">
            <h2 className="pb-2 text-base font-bold"> Output: </h2>
            <p className="pb-4 text-base text-body-content h-full w-full break-all overflow-auto whitespace-pre">
              { decryptError ? (
                <div className="text-danger-normal">Decrypt Error!</div>
              ) : (
                <>{ decryptedMessage }</>
              )}
            </p>
          </ResizableSection>
        </Resizable>
      </Body>
      <BottomTabs />
    </Layout>
  )
}

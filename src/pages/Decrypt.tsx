import Body from '@/components/layout/Body';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import { needAuth, useAuth } from '@/services/auth';
import { useEffect, useMemo, useState } from 'react';
import { decrypt } from '@/services/cryptography';
import Input from '@/components/form/Input';
import { Resizable, ResizableSection } from '@/components/common/Resizable';
import { ab2str, uatob } from '@/utils/convert';
import { NavLink } from 'react-router-dom';

export default function Decrypt() {
  needAuth();
  const [auth] = useAuth();
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
          if (auth) {
            setDecryptedMessage(ab2str(await decrypt(uatob(encryptedContent), auth.private_key)));
          };
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

  const shareLink = useMemo(() => {
    if (!auth) return;
    const shareLink = new URL(window.location.href);
    shareLink.hash = `#/encrypt/${encodeURIComponent(auth.public_key)}`;
    return shareLink.href;
  }, []);

  return (
    <Layout>
      <Header title="Guard Decrypt" subtitle="Decrypt received messages" />
      <Body>
        <Resizable>
          <ResizableSection className="h-64">
            <Input
              size="manual"
              className="h-full font-mono"
              value={encryptedContent}
              onInput={setEncryptedContent}
              multiLine
              placeholder="Enter Encrypted Content."
            />
          </ResizableSection>
          <ResizableSection className="p-3">
            <h2 className="pb-2 text-base font-bold"> Output: </h2>
            <p className="pb-4 text-base text-body-content h-full w-full break-all overflow-auto whitespace-pre-line">
              { decryptError ? (
                <div className="space-y-2">
                  <b className="text-danger-normal font-bold">Decrypt Error!</b>
                  { shareLink && (
                    <p className="text-sm text-section-subtitle">
                      Encrypted content must be created using your <NavLink className="underline underline-offset-4" to={shareLink} target="_blank">Guard link</NavLink>.
                    </p>
                  ) }
                </div>
              ) : (
                <>{ decryptedMessage }</>
              )}
            </p>
          </ResizableSection>
        </Resizable>
      </Body>
    </Layout>
  )
}

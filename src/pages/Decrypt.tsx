import Body from '@/components/layout/Body';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import { needAuth, useAuth, useEncryptLink } from '@/services/auth';
import { decrypt } from '@/services/cryptography';
import Input from '@/components/form/Input';
import { Resizable, ResizableSection } from '@/components/common/Resizable';
import { ab2str, uatob } from '@/utils/convert';
import { NavLink } from 'react-router-dom';
import { usePromise } from '@/utils/usePromise';
import Icon from '@/components/shared/Icon';

export default function Decrypt() {
  needAuth();
  const [auth] = useAuth();
  const decryptor = usePromise(
    (encrypted: string) => decrypt(uatob(encrypted), auth?.private_key || '').then(ab2str),
    { debounceTimer: 300, respectLoading: false },
  );
  const encryptLink = useEncryptLink();

  return (
    <Layout>
      <Header title="Guard Decrypt" subtitle="Decrypt received messages" />
      <Body>
        <Resizable>
          <ResizableSection className="h-64">
            <Input
              size="manual"
              className="h-full font-mono"
              onInput={decryptor.refresh}
              multiLine
              placeholder="Enter Encrypted Content."
            />
          </ResizableSection>
          <ResizableSection className="p-3">
            <h2 className="pb-2 text-base font-bold">Output:</h2>
            <div className="pb-4 text-base text-body-content h-full w-full break-all overflow-auto whitespace-pre-line">
              { decryptor.state === 'loading' && (
                <Icon name="sync" className="w-6 h-6 animate-spin" />
              ) }
              { decryptor.state === 'rejected' && (
                <div className="space-y-2">
                  <h3 className="text-danger-normal font-bold">Decrypt Error!</h3>
                  { encryptLink && (
                    <p className="text-sm text-section-subtitle">
                      Encrypted content must be created using your <NavLink className="underline underline-offset-4" to={encryptLink} target="_blank">Guard Link</NavLink>.
                    </p>
                  ) }
                </div>
              ) }
              { decryptor.state === 'resolved' && (
                <>{ decryptor.response }</>
              ) }
            </div>
          </ResizableSection>
        </Resizable>
      </Body>
    </Layout>
  )
}

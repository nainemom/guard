import Body from '@/components/layout/Body';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import { useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { encrypt } from '@/services/cryptography';
import Input from '@/components/form/Input';
import Button from '@/components/form/Button';
import Icon from '@/components/shared/Icon';
import { str2ab, ubtoa } from '@/utils/convert';
import { showToast } from '@/services/notification';
import { share } from '@/utils/share';
import Username from '@/components/shared/Username';
import { Resizable, ResizableSection } from '@/components/common/Resizable';
import { usePromise } from '@/utils/usePromise';

export default function Encrypt() {
  const { receiver } = useParams();
  const receiverPublic = useMemo(() => decodeURIComponent(receiver || ''), [receiver]);

  const encryptor = usePromise(
    (raw: string) => encrypt(str2ab(raw), receiverPublic).then(ubtoa),
    { debounceTimer: 200, respectLoading: false },
  );

  const [message, setMessage] = useState<string>('');

  const encryptAndShare = async () => {
    try {
      const encryptedData = await encryptor.refresh(message);
  
      const shareType = await share(encryptedData);
  
      if (shareType === 'clipboard') {
        showToast('Encrypted Content Copied to Clipboard!');
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Layout>
      <Header
        title="Guard Encrypt"
        subtitle={<Username publicKey={receiverPublic} />}
      />
      <Body
        className="flex flex-col"
        stickyArea={
          <div className="m-3 flex flex-row gap-3">
            <Button theme="primary" size="lg" circle onClick={encryptAndShare} disabled={!receiverPublic || !message} ariaLabel="Share">
              { encryptor.state === 'loading' ? (
                <Icon name="sync" className="w-6 h-6 animate-spin" key="loading" />
              ) : (<Icon name="share" className="w-6 h-6" />) }
            </Button>
          </div>
        }
      >
        <Input
          className="h-full flex-grow"
          size="manual"
          value={message}
          onInput={setMessage}
          readOnly={encryptor.state === 'loading'}
          multiLine
          placeholder="Enter Your Raw Message."
        />
      </Body>
    </Layout>
  )
}

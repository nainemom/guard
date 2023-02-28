import Body from '@/components/layout/Body';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import { useParams } from 'react-router-dom';
import { useCallback, useMemo, useState } from 'react';
import { encrypt } from '@/services/cryptography';
import Input from '@/components/form/Input';
import Button from '@/components/form/Button';
import Icon from '@/components/shared/Icon';
import { str2ab, ubtoa } from '@/utils/convert';
import { showToast } from '@/services/notification';
import { share } from '@/utils/share';
import Username from '@/components/shared/Username';

export default function Encrypt() {
  const { receiver } = useParams();
  const receiverPublic = useMemo(() => decodeURIComponent(receiver || ''), [receiver]);
  const [message, setMessage] = useState<string>('');

  const shareMessage = useCallback(async () => {
    try {
      const encryptedMessage = await encrypt(str2ab(message), receiverPublic);
      const textContent = ubtoa(encryptedMessage);
      const shareType = await share(textContent);
      if (shareType === 'clipboard') {
        showToast('Encrypted Content Copied to Clipboard!');
      }
    } catch (_e) {
      console.error(_e);
      showToast('Share Error!');
    }
  }, [message, receiverPublic]);

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
            <Button theme="primary" size="lg" circle onClick={shareMessage} disabled={!receiverPublic || !message} ariaLabel="Share">
              <Icon name="share" className="w-6 h-6" />
            </Button>
          </div>
        }
      >
        <Input
          className="h-full flex-grow"
          size="manual"
          value={message}
          onInput={setMessage}
          multiLine
          placeholder="Enter Your Raw Message."
        />
      </Body>
    </Layout>
  )
}

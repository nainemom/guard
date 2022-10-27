import Body from '@/components/layout/Body';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import BottomTabs from '@/components/layout/BottomTabs';
import { route, RouterProps } from 'preact-router';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { encrypt } from '@/services/cryptography';
import Input from '@/components/form/Input';
import Button from '@/components/form/Button';
import Icon from '@/components/shared/Icon';
import ContactSelector from '@/components/shared/ContactSelector';
import { str2ab, ubtoa } from '@/utils/convert';
import { copyToClipboard } from '@/utils/clipboard';
import { showToast } from '@/services/notification';

type EncryptProps = RouterProps & {
  receiver?: string,
}
export default function Encrypt({ receiver }: EncryptProps) {
  const receiverPublic = useMemo(() => decodeURIComponent(receiver || ''), [receiver]);
  const [message, setMessage] = useState<string>('');

  const share = useCallback(async () => {
    try {
      const encryptedMessage = await encrypt(str2ab(message), receiverPublic);
      const textContent = ubtoa(encryptedMessage);
      await navigator.share({
        text: textContent,
      });
    } catch (_e) {
      console.error(_e);
      showToast('Share Error!');
    }
  }, [message, receiverPublic]);

  const copy = useCallback(async () => {
    try {
      const encryptedMessage = await encrypt(str2ab(message), receiverPublic);
      const textContent = ubtoa(encryptedMessage);
      copyToClipboard(textContent).then((ok) => {
        if (ok) {
          showToast('Encrypted Content Copied to Clipboard!');
        }
      });
    } catch (_e) {
      console.error(_e);
      showToast('Copy Error!');
    }
  }, [message, receiverPublic]);

  return (
    <Layout>
      <Header title="Guard App" subtitle="Encrypt and Decrypt Messages" />
      <Body
        className="flex flex-col p-3"
        stickyArea={
          <div className="m-3 flex flex-row gap-3">
            <Button theme="primary" circle onClick={copy} disabled={!receiverPublic || !message}>
              <Icon name="content_copy" className="w-6 h-6" />
            </Button>
            <Button theme="primary" circle onClick={share} disabled={!receiverPublic || !message || !navigator?.share}>
              <Icon name="share" className="w-6 h-6" />
            </Button>
          </div>
        }
      >
        <ContactSelector
          className="shrink-0 mb-3"
          label="Receiver:"
          publicKey={receiver}
          onInput={(newReceiver) => route(`/encrypt/${encodeURIComponent(newReceiver)}`, true)}
        />
        <Input
          className="h-full flex-grow"
          label="Message:"
          size="manual"
          value={message}
          onInput={setMessage}
          multiLine
          placeholder="Enter Your Raw Message."
        />
      </Body>
      <BottomTabs />
    </Layout>
  )
}

import Body from '@/components/layout/Body';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import BottomTabs from '@/components/layout/BottomTabs';
import { RouterProps } from 'preact-router';
import { useCallback, useState } from 'preact/hooks';
import { CryptographyPublicKey, encrypt } from '@/services/cryptography';
import Input from '@/components/form/Input';
import Button from '@/components/form/Button';
import Icon from '@/components/shared/Icon';
import ContactSelector from '@/components/shared/ContactSelector';


export default function Encrypt(_props: RouterProps) {
  const [publicKey, setPublicKey] = useState<CryptographyPublicKey>('');
  const [message, setMessage] = useState<string>('');

  const share = useCallback(async () => {
    try {
      const encryptedMessage = await encrypt(message, publicKey);
      if (navigator.share) {
        await navigator.share({
          text: encryptedMessage,
        });
      } else {
        navigator.clipboard.writeText(encryptedMessage);
        alert('Cannot use share feature, so just copied to clipboard!');
      }
    } catch (_e) {
      alert('Error!');
    }
  }, [message, publicKey]);

  return (
    <Layout>
      <Header title="Guard App" subtitle="Encrypt and Decrypt Messages" />
      <Body
        className="flex flex-col p-3"
        stickyArea={
          <Button className="m-3" theme="primary" onClick={share} disabled={!publicKey || !message}>
            <Icon name="share" className="w-5 h-5" />
            Share
          </Button>
        }
      >
        <ContactSelector
          label="Receiver:"
          className="shrink-0 mb-3"
          publicKey={publicKey}
          onInput={setPublicKey}
        />
        <Input
          label="Message:"
          size="manual"
          className="h-full flex-grow"
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

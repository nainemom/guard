import Body from '@/components/layout/Body';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import BottomTabs from '@/components/layout/BottomTabs';
import { RouterProps } from 'preact-router';
import { useCallback, useState } from 'preact/hooks';
import { CryptographyPairKeys, CryptographyPublicKey, encrypt, decrypt } from '@/services/cryptography';
import Input from '@/components/form/Input';
import Button from '@/components/form/Button';
import Icon from '@/components/shared/Icon';
import ContactSelector from '@/components/shared/ContactSelector';
import { storageKey as authStorageKey } from '@/services/auth';
import { useStorage } from '@/services/storage';
import { ab2str, str2ab } from '@/utils/convert';

export default function Encrypt(_props: RouterProps) {
  const [personalKeys] = useStorage<CryptographyPairKeys>(authStorageKey);

  const [publicKey, setPublicKey] = useState<CryptographyPublicKey>(personalKeys.public_key);
  const [message, setMessage] = useState<string>('');


  const share = useCallback(async () => {
    try {
      console.log('encrypting...', `str-length: ${message.length}, ab-size: ${str2ab(message).byteLength}`);
      const encryptedMessage = await encrypt(str2ab(message), publicKey);
      console.log('encrypt done.', encryptedMessage);
      console.log('decrypting...');
      const decryptedAgain = await decrypt(encryptedMessage, personalKeys.private_key);
      console.log(ab2str(decryptedAgain));
    } catch (_e) {
      console.error(_e);
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

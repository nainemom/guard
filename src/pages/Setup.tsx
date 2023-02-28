import Button from '@/components/form/Button';
import Body from '@/components/layout/Body';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/services/auth';
import { generatePairKeys } from '@/services/cryptography';
import Dialog from '@/services/dialog';
import { useCallback, useEffect, useState } from 'react';
import PersonalKeysEditForm from '@/components/shared/PersonalKeysEditForm';
import Icon from '@/components/shared/Icon';
import { getFileFromUser, openAuthFile } from '@/services/files';
import { showToast } from '@/services/notification';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [auth, setAuth] = useAuth();
  const [personalKeysDialog, setPersonalKeysDialog] = useState<boolean>(false);

  const generateAccount = useCallback(() => {
    generatePairKeys().then((keys) => {
      setAuth(keys);
      showToast('Account Generated!');
    });
  }, [auth]);

  const importAuth = useCallback(async () => {
    try {
      const authFile = await getFileFromUser();
      const newPersonalKeys = await openAuthFile(authFile);
      setAuth(newPersonalKeys);
      showToast('Account Updated!');
    } catch (_e) {}
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    if (auth?.private_key && auth?.public_key) {
      navigate('/contacts');
    }
  }, [auth]);

  return (
    <Layout>
      <Body className="flex flex-col">
        <div className="flex-grow p-3 flex flex-col items-stretch justify-center gap-3 text-base w-full max-w-xs mx-auto">
          <div className='flex flex-row justify-center'>
            <img src={`${import.meta.env.BASE_URL}logo_white.svg`} className="w-24 h-24" alt="Guard Logo" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Setup</h2>
            <p className="text-sm text-body-subtitle">Setup your Account to use Guard App!</p>
          </div>
          <Button theme="primary" onClick={() => generateAccount()} size="lg" ariaLabel="Generate new Account">
            <Icon name="magic_button" className="w-5 h-5" />
            Generate new Account!
          </Button>
          <div className="text-center border-b border- border-body-lighter"/>
          <Button theme="default" onClick={() => importAuth()} size="lg" ariaLabel="Import Account">
            <Icon name="upload_file" className="w-5 h-5" />
            Import via .auth File
          </Button>
          <Button theme="default" onClick={() => setPersonalKeysDialog(true)} size="lg" ariaLabel="Manually Enter Keys">
            <Icon name="edit" className="w-5 h-5" />
            Manually Enter Keys
          </Button>
        </div>

        {/* Personal Keys Edit Dialog */}
        <Dialog
          isOpen={personalKeysDialog}
        >
          { personalKeysDialog && (
            <PersonalKeysEditForm
              onClose={() => setPersonalKeysDialog(false)}
            />
          ) }
        </Dialog>
      </Body>
    </Layout>
  )
}

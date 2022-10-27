import Button from '@/components/form/Button';
import Body from '@/components/layout/Body';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import BottomTabs from '@/components/layout/BottomTabs';
import ContactEditForm from '@/components/shared/ContactEditForm';
import { Contact, UnSavedContact, storageKey as contactsStorageKey } from '@/services/contacts';
import { storageKey as authStorageKey } from '@/services/auth';
import { CryptographyPairKeys } from '@/services/cryptography';
import Dialog from '@/services/dialog';
import { useStorage } from '@/services/storage';
import { RouterProps } from 'preact-router';
import { useCallback, useState } from 'preact/hooks';
import PersonalKeysEditForm from '@/components/shared/PersonalKeysEditForm';
import Icon from '@/components/shared/Icon';
import Avatar from '@/components/shared/Avatar';
import Username from '@/components/shared/Username';
import ContactList from '@/components/shared/ContactList';
import { createAuthFile, exportFileToUser, getFileFromUser, openAuthFile } from '@/services/files';
import { showToast } from '@/services/notification';
import { copyToClipboard } from '@/utils/clipboard';

const UNSAVED_CONTACT: UnSavedContact = {
  public_key: '',
};

type EditingContactDialog = Partial<Contact> | null;


export default function Profile(_props: RouterProps) {
  const [contacts] = useStorage<Contact[]>(contactsStorageKey);
  const [personalKeys, setPersonalKeys] = useStorage<CryptographyPairKeys>(authStorageKey);

  const [editingContact, setEditingContact] = useState<EditingContactDialog>(null);
  const [personalKeysDialog, setPersonalKeysDialog] = useState<boolean>(false);

  const exportAuth = useCallback(() => {
    const file = createAuthFile(personalKeys);
    exportFileToUser(file);
  }, [personalKeys]);

  const importAuth = useCallback(async () => {
    try {
      const authFile = await getFileFromUser();
      const newPersonalKeys = await openAuthFile(authFile);
      setPersonalKeys(newPersonalKeys);
      showToast('Account Updated!');
    } catch (_e) {}
  }, []);

  const share = useCallback(() => {
    const shareLink = new URL(window.location.href);
    shareLink.hash = `#/encrypt/${encodeURIComponent(personalKeys.public_key)}`;
    copyToClipboard(shareLink.href).then((ok) => {
      if (ok) {
        showToast('Share Link Copied To Clipboard!');
      }
    });
  }, [personalKeys]);

  return (
    <Layout>
      <Header title="Guard App" subtitle="Encrypt and Decrypt Messages" />
      <Body
        className="flex flex-col"
        stickyArea={
          (contacts || []).length > 0 && (
            <Button theme="primary" size="lg" circle onClick={() => setEditingContact(UNSAVED_CONTACT)}>
              <Icon name="add" className="w-6 h-6" />
            </Button>
          )
        }
      >
        <div className="shrink-0 p-3 mb-6 max-w-xs mx-auto">
          <div className="flex flex-col items-center w-full mx-auto">
            <Avatar publicKey={personalKeys.public_key} className="w-32 h-32" />
            <p className="text-base font-bold">
              <Username publicKey={personalKeys.public_key} />
            </p>
            <div className="w-full flex flex-row flex-wrap justify-center gap-3 mt-6">
              <Button className="shrink-0" size="lg" circle onClick={importAuth}>
                <Icon name="upload_file" className="w-6 h-6" />
              </Button>
              <Button className="shrink-0" size="lg" circle onClick={exportAuth}>
                <Icon name="save" className="w-6 h-6" />
              </Button>
              <Button className="shrink-0" size="lg" circle onClick={share}>
                <Icon name="share" className="w-6 h-6" />
              </Button>
              <Button className="shrink-0" size="lg" circle onClick={() => setPersonalKeysDialog(true)}>
                <Icon name="edit" className="w-6 h-6" />
              </Button>
            </div>
            <div className="w-full flex flex-row justify-center gap-1 mt-6">

            </div>
          </div>
        </div>
        { (contacts || []).length > 0 ? (
          <div className="flex-grow">
            <h2 className="text-xl font-semibold mb-2 p-3"> Contact List: </h2>
            <ContactList
              onContactMenu={setEditingContact}
            />
          </div>
        ) : (
          <>
            <div className="flex-grow p-3 flex flex-col items-center justify-start gap-3 text-base">
              <p>You don't have any contact yet!</p>
              <Button theme="primary" onClick={() => setEditingContact(UNSAVED_CONTACT)}>
                <Icon name="add" className="w-5 h-5" />
                Create New Contact
              </Button>
            </div>
          </>
        ) }

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

        {/* Contact Add/Edit Dialog */}
        <Dialog
          isOpen={editingContact !== null}
        >
          { editingContact && (
            <ContactEditForm
              contact={editingContact}
              onClose={() => setEditingContact(null)}
            />
          ) }
        </Dialog>

      </Body>
      <BottomTabs />
    </Layout>
  )
}

import { List, ListItem } from '@/components/common/List';
import Button from '@/components/form/Button';
import Body from '@/components/layout/Body';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import Tabs from '@/components/layout/Tabs';
import ContactEditForm from '@/components/shared/ContactEditForm';
import { Contact, UnSavedContact, storageKey as contactsStorageKey } from '@/services/contacts';
import { storageKey as authStorageKey } from '@/services/auth';
import { CryptographyPairKeys } from '@/services/cryptography';
import Dialog from '@/services/dialog';
import { useStorage } from '@/services/storage';
import { RouterProps } from 'preact-router';
import { useState } from 'preact/hooks';
import PersonalKeysEditForm from '@/components/shared/PersonalKeysEditForm';
import Icon from '@/components/shared/Icon';
import Avatar from '@/components/shared/Avatar';
import Username from '@/components/shared/Username';

const UNSAVED_CONTACT: UnSavedContact = {
  public_key: '',
};

type EditingContactDialog = Partial<Contact> | null;


export default function Profile(_props: RouterProps) {
  const [contacts] = useStorage<Contact[]>(contactsStorageKey);
  const [personalKeys] = useStorage<CryptographyPairKeys>(authStorageKey);

  const [editingContact, setEditingContact] = useState<EditingContactDialog>(null);
  const [personalKeysDialog, setPersonalKeysDialog] = useState<boolean>(false);

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
        <div className="shrink-0 p-3 mb-6">
          <div className="flex flex-col items-center w-full mx-auto">
            <Avatar publicKey={personalKeys.public_key} className="w-32 h-32" />
            <p className="text-lg font-bold">
              <Username publicKey={personalKeys.public_key} />
            </p>
            <div className="w-full flex flex-row justify-center gap-6 mt-6">
              <Button className="shrink-0" size="lg" circle onClick={() => setPersonalKeysDialog(true)} disabled>
                <Icon name="share" className="w-6 h-6" />
              </Button>
              <Button className="shrink-0" size="lg" circle onClick={() => setPersonalKeysDialog(true)} disabled>
                <Icon name="download" className="w-6 h-6" />
              </Button>
              <Button className="shrink-0" size="lg" circle onClick={() => setPersonalKeysDialog(true)} disabled>
                <Icon name="upload" className="w-6 h-6" />
              </Button>
              <Button className="shrink-0" size="lg" circle onClick={() => setPersonalKeysDialog(true)}>
                <Icon name="edit" className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
        { (contacts || []).length > 0 ? (
          <div className="flex-grow">
            <h2 className="text-xl font-semibold mb-2 p-3"> Contact List: </h2>
            <List>
              { contacts.map((contact) => (
                <ListItem
                  key={contact.id}
                  className="flex flex-row items-center h-16 w-full gap-3 p-3"
                  clickable
                  onMenu={() => setEditingContact(contact)}
                >
                  <Avatar publicKey={contact.public_key} className="w-12 h-12 border border-body-darker rounded-xl p-3 bg-body-active" />
                  <div className="flex-grow overflow-hidden text-ellipsis">
                    <h2 className="text-sm font-semibold">
                      <Username publicKey={contact.public_key} />
                    </h2>
                    { contact.note && (
                      <p className="text-xs text-body-subtitle">{ contact.note }</p>
                    ) }
                  </div>
                </ListItem>
              )) }
            </List>
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
      <Tabs />
    </Layout>
  )
}

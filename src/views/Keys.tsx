import { List, ListItem } from '@/components/common/List';
import Button from '@/components/form/Button';
import Body from '@/components/layout/Body';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import Tabs from '@/components/layout/Tabs';
import ContactEditForm from '@/components/shared/ContactEditForm';
import { Contact, getContacts, UnSavedContact, storageKey as contactsStorageKey } from '@/services/contacts';
import { storageKey as authStorageKey } from '@/services/auth';
import { CryptographyPairKeys } from '@/services/cryptography';
import Dialog from '@/services/dialog';
import { useStorage } from '@/services/storage';
import { RouterProps } from 'preact-router';
import { useCallback, useEffect, useState } from 'preact/hooks';
import PersonalKeysEditForm from '@/components/shared/PersonalKeysEditForm';

const UNSAVED_CONTACT: UnSavedContact = {
  public_key: '',
  display_name: '',
};

type EditingContactDialog = Partial<Contact> | null;
type PersonalKeysDialog = CryptographyPairKeys | null;


export default function Keys(_props: RouterProps) {
  const [contacts, setContacts] = useStorage<Contact[]>(contactsStorageKey);
  const [personalKeys] = useStorage<CryptographyPairKeys>(authStorageKey);

  const [editingContact, setEditingContact] = useState<EditingContactDialog>(null);
  const [personalKeysDialog, setPersonalKeysDialog] = useState<boolean>(false);

  return (
    <Layout>
      <Header title="Guard App" subtitle="Encrypt and Decrypt Messages" />
      <Body
        stickyArea={
          <Button theme="primary" size="lg" circle onClick={() => setEditingContact(UNSAVED_CONTACT)}>+</Button>
        }
      >
        <div className="p-4">
          <h2 className="mb-2 text-base"> My Key: </h2>
          <ListItem className="flex flex-row items-center px-2 h-16">
            <p className="text-base flex-grow font-mono">{ personalKeys.public_key }</p>
            <div className="shrink-0 flex flex-row gap-2">
              <Button size="sm" onClick={() => setPersonalKeysDialog(true)}>Change</Button>
            </div>
          </ListItem>
        </div>
        <hr className="my-2" />
        <div className="p-4">
          <h2 className="text-base mb-2"> Contacts Keys: </h2>
          <List>
            { (contacts || []).map((contact) => (
            <ListItem
              key={contact.id}
              className="flex flex-row items-center px-2 h-16"
            >
              <div className="flex-grow">
                <h2 className="text-base">{ contact.display_name }</h2>
                <p className="text-sm font-mono text-body-subtitle">{ contact.public_key }</p>  
              </div>
              <div className="shrink-0 flex flex-row gap-2">
                <Button size="sm" onClick={() => setEditingContact(contact)}>Edit</Button>
              </div>
            </ListItem>
            )) }
          </List>
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

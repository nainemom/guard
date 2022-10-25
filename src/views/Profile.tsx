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

const UNSAVED_CONTACT: UnSavedContact = {
  public_key: '',
  display_name: '',
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
        stickyPadding
        stickyArea={
          <Button theme="primary" onClick={() => setEditingContact(UNSAVED_CONTACT)}>
            <Icon name="add" className="w-5 h-5" />
            Add New Contact
          </Button>
        }
      >
        <div className="p-4">
          <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
            <Icon name="manage_accounts" className="w-20 h-20 border-2 rounded-full p-2" />
            <p className="w-full overflow-hidden text-ellipsis font-mono">
              { personalKeys.public_key }
            </p>
            <div className="w-full flex flex-row gap-2">
              <Button size="sm" className="flex-grow" onClick={() => setPersonalKeysDialog(true)} disabled>
                <Icon name="share" className="w-4 h-4" />
                Share
              </Button>
              <Button size="sm" className="flex-grow" onClick={() => setPersonalKeysDialog(true)} disabled>
                <Icon name="download" className="w-4 h-4" />
                Import
              </Button>
              <Button size="sm" className="flex-grow" onClick={() => setPersonalKeysDialog(true)} disabled>
                <Icon name="upload" className="w-4 h-4" />
                Export
              </Button>
              <Button size="sm" className="flex-grow" onClick={() => setPersonalKeysDialog(true)}>
                <Icon name="edit" className="w-4 h-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>
        <hr className="my-2" />
        <div className="p-4">
          <h2 className="text-base mb-2"> Contacts: </h2>
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
                <Button size="sm" onClick={() => setEditingContact(contact)}>
                  <Icon name="edit" className="w-4 h-4" />
                  Edit
                </Button>
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

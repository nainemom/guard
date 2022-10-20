import { List, ListItem } from '@/components/common/List';
import Button from '@/components/form/Button';
import Body from '@/components/layout/Body';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import Tabs from '@/components/layout/Tabs';
import ContactEditForm from '@/components/shared/ContactEditForm';
import { Contact, getContacts, UnSavedContact } from '@/services/contacts';
import Dialog from '@/services/dialog';
import { RouterProps } from 'preact-router';
import { useCallback, useEffect, useState } from 'preact/hooks';

const UNSAVED_CONTACT_OBJECT: UnSavedContact = {
  public_key: '',
  display_name: '',
};

export default function Encrypt(_props: RouterProps) {
  const [contacts, setContacts] = useState<Contact[]>(getContacts());

  const reloadContacts = useCallback(() => {
    setContacts(getContacts());
  }, []);

  const [activeContact, setActiveContact] = useState<Partial<Contact> | null>(null);
  const setContactDialog = useCallback((open: boolean, data?: Partial<Contact>) => {
    setActiveContact(open === false ? null : {
      ...UNSAVED_CONTACT_OBJECT,
      ...data,
    });
  }, [setActiveContact]);

  return (
    <Layout>
      <Header title="Guard App" subtitle="Encrypt and Decrypt Messages" />
      <Body
        className="p-2"
        stickyArea={
          <Button theme="primary" size="lg" circle onClick={() => setContactDialog(true)}>+</Button>
        }
      >
        { contacts.length > 0 ? (
          <List>
            { contacts.map((contact) => (
              <ListItem
                key={contact.id}
                onMenu={() => setContactDialog(true, contact)}
              >
                <h2 className="text-base">{ contact.display_name }</h2>
                <p className="text-xs font-light text-body-subtitle">{ contact.public_key }</p>
              </ListItem>
          )) }
          </List>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <p>You dont have any contacts yet.</p>
            <p className="mb-4">Try Create one</p>
            <Button theme="primary" size="md" onClick={() => setContactDialog(true)}>Create New Contact.</Button>
          </div>
        ) }

        <Dialog
          isOpen={activeContact !== null}
        >
          { activeContact && (
            <ContactEditForm
              contact={activeContact}
              onClose={() => setContactDialog(false)}
              onSuccess={() => reloadContacts()}
            />
          ) }
        </Dialog>
      </Body>
      <Tabs />
    </Layout>
  )
}

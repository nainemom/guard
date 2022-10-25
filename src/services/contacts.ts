import { CryptographyPublicKey } from "@/services/cryptography";
import { get, set } from "@/services/storage";

export const storageKey = 'contacts';

type ContactId = string;

export type Contact = {
  id: ContactId,
  public_key: CryptographyPublicKey,
};

export type UnSavedContact = Omit<Contact, 'id'>

export const getContacts = (): Contact[] => get(storageKey) || [];

export const getContact = (contactId: ContactId): Contact | null => getContacts().find((contact) => contact.id === contactId) || null;

export const saveContact = (contact: Contact | UnSavedContact) => {
  const contacts = getContacts();
  const contactId: ContactId = typeof (contact as Contact).id === 'undefined' ? crypto.randomUUID() : (<Contact>contact).id;
  const newContact: Contact = {
    id: contactId,
    ...contact,
  };
  const index = contacts.findIndex((contactItem) => contactItem.id === contactId);
  let newContacts: Contact[];
  if (index === -1) {
    newContacts = [
      ...contacts,
      newContact,
    ];
  } else {
    newContacts = [
      ...contacts.slice(0, index),
      newContact,
      ...contacts.slice(index + 1)
    ];
  }
  set(storageKey, newContacts);
  return newContacts;
}

export const removeContact = (contactId: ContactId) => {
  const contacts = getContacts();
  const index = contacts.findIndex((contactItem) => contactItem.id === contactId);
  let newContacts: Contact[] = contacts;
  if (index > -1) {
    newContacts = [
      ...contacts.slice(0, index),
      ...contacts.slice(index + 1)
    ];
    set(storageKey, newContacts);
  }
  return newContacts;
}
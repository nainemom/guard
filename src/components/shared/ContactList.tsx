import './ContactList.css';
import { Contact, storageKey as contactsStorageKey } from '@/services/contacts';
import { List, ListItem } from "../common/List";
import { useStorage } from "@/services/storage";
import ContactRow from "./ContactRow";
import { CryptographyPairKeys, CryptographyPublicKey } from '@/services/cryptography';
import { useEffect, useMemo } from 'preact/hooks';
import { storageKey as authStorageKey } from '@/services/auth';

export type ContactListProps = {
  onContactMenu?: (contactItem: CryptographyPublicKey) => void,
  onContactClick?: (contactItem: CryptographyPublicKey) => void,
  selectedContact?: CryptographyPublicKey,
  includesMe?: boolean,
  className?: string,
}

type ContactItemWithKey = {
  key: string,
  value: CryptographyPublicKey,
};

const contactListDefaultProps = {
  onContactMenu: () => {},
  onContactClick: () => {},
};

export default function ContactList(props: ContactListProps) {
  const { className, onContactMenu, onContactClick } = { ...contactListDefaultProps, ...props };
  const [contacts] = useStorage<Contact[]>(contactsStorageKey);
  const [personalKeys] = useStorage<CryptographyPairKeys>(authStorageKey);

  const list = useMemo<ContactItemWithKey[]>(() => [
    ...(props.includesMe ? [
      {
        key: personalKeys.public_key,
        value: personalKeys.public_key,
      },
    ] : []),
    ...(contacts || []).map((contact, index) => ({
      key: JSON.stringify(contact) + index,
      value: contact.public_key,
    })),
  ], [contacts, props.includesMe, personalKeys]);
  
  return (
    <List className={className}>
      { list.map((listITem) => (
        <ListItem
          key={listITem.key}
          className="h-16 p-3"
          clickable
          onMenu={() => onContactMenu(listITem.value)}
          onClick={() => onContactClick(listITem.value)}
          selected={props?.selectedContact === listITem.value}
        >
          <ContactRow
            size="md"
            publicKey={listITem.value}
          />
        </ListItem>
      )) }
    </List>
  );
}
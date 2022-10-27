import './ContactList.css';
import { Contact, storageKey as contactsStorageKey } from '@/services/contacts';
import { List, ListItem } from "../common/List";
import { useStorage } from "@/services/storage";
import ContactRow from "./ContactRow";
import { CryptographyPairKeys, CryptographyPublicKey } from '@/services/cryptography';
import { useMemo } from 'preact/hooks';
import { storageKey as authStorageKey } from '@/services/auth';

export type ContactListProps = {
  onContactMenu?: (contactItem: CryptographyPublicKey) => void,
  onContactClick?: (contactItem: CryptographyPublicKey) => void,
  selectedContact?: CryptographyPublicKey,
  includesMe?: boolean,
  className?: string,
}

const contactListDefaultProps = {
  onContactMenu: () => {},
  onContactClick: () => {},
};

export default function ContactList(props: ContactListProps) {
  const { className, onContactMenu, onContactClick } = { ...contactListDefaultProps, ...props };
  const [contacts] = useStorage<Contact[]>(contactsStorageKey);
  const [personalKeys] = useStorage<CryptographyPairKeys>(authStorageKey);

  const list = useMemo<CryptographyPublicKey[]>(() => [
    ...(props.includesMe ? [
      personalKeys.public_key,
    ] : []),
    ...(contacts || []).map((contact) => contact.public_key),
  ], [contacts, props.includesMe, personalKeys]);
  
  return (
    <List className={className}>
      { list.map((contactPublicKey) => (
        <ListItem
          key={contactPublicKey}
          className="h-16 p-3"
          clickable
          onMenu={() => onContactMenu(contactPublicKey)}
          onClick={() => onContactClick(contactPublicKey)}
          selected={props?.selectedContact === contactPublicKey}
        >
          <ContactRow
            size="md"
            publicKey={contactPublicKey}
          />
        </ListItem>
      )) }
    </List>
  );
}
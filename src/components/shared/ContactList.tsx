import './ContactList.css';
import { Contact, storageKey as contactsStorageKey } from '@/services/contacts';
import { List, ListItem } from "../common/List";
import { useStorage } from "@/services/storage";
import ContactRow from "./ContactRow";
import { CryptographyPublicKey } from '@/services/cryptography';

export type ContactListProps = {
  onContactMenu?: (contactItem: Contact) => void,
  onContactClick?: (contactItem: Contact) => void,
  selectedContact?: CryptographyPublicKey,
  className?: string,
}

const contactListDefaultProps = {
  onContactMenu: () => {},
  onContactClick: () => {},
};

export default function ContactList(props: ContactListProps) {
  const { className, onContactMenu, onContactClick } = { ...contactListDefaultProps, ...props };
  const [contacts] = useStorage<Contact[]>(contactsStorageKey);
  
  return (
    <List className={className}>
      { (contacts || []).map((contact) => (
        <ListItem
          key={contact.id}
          className="h-16 p-3"
          clickable
          onMenu={() => onContactMenu(contact)}
          onClick={() => onContactClick(contact)}
          selected={props?.selectedContact === contact.public_key}
        >
          <ContactRow
            size="md"
            publicKey={contact.public_key}
          />
        </ListItem>
      )) }
    </List>
  );
}
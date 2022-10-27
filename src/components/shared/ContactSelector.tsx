import './ContactSelector.css'
import { CryptographyPublicKey } from "@/services/cryptography";
import { cx } from "@/utils/cx";
import { useCallback, useState } from "preact/hooks";
import Icon from "./Icon";
import Dialog, { DialogBody, DialogTitle } from "@/services/dialog";
import ContactRow from "./ContactRow";
import { Contact, storageKey as contactsStorageKey, saveContact } from '@/services/contacts';
import { FormFieldLabel, FormFieldProps } from "../form/Form";
import ContactList from "./ContactList";
import { useStorage } from '@/services/storage';
import Button from '../form/Button';
import { showToast } from '@/services/notification';


export type ContactSelectorProps = FormFieldProps & {
  className?: string,
  publicKey?: CryptographyPublicKey,
  onInput?: (newPublicKey: CryptographyPublicKey) => void,
}

export default function ContactSelector({ publicKey, onInput, className, label }: ContactSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts] = useStorage<Contact[]>(contactsStorageKey);

  const handleContactClick = useCallback((selectedContact: CryptographyPublicKey) => {
    setIsOpen(false);
    if (onInput) {
      onInput(selectedContact);
    }
  }, [setIsOpen, onInput]);

  const addToContacts = useCallback((event: Event) => {
    if (publicKey) {
      event.preventDefault();
      event.stopPropagation();
      saveContact({
        public_key: publicKey,
        note: 'Added from url',
      });
      showToast('Added to your Contacts!');
    }
  }, [publicKey]);


  return (
    <>
      <FormFieldLabel label={label} />
      <div
        className={cx('x-contact-selector', 'x-input x-input-lg', className)}
        tabIndex={0}
        onClick={() => setIsOpen(true)}
        onKeyDown={(event) => event.key === 'Enter' && setIsOpen(true)}
      >
        { publicKey ? (
          <ContactRow size="sm" publicKey={publicKey} className="flex-grow" />
        ) : (
          <div className="flex-grow"> Click to Select </div>
        ) }
        <Icon name="expand_more" className="w-5 h-5" />
        { publicKey && (contacts || []).findIndex((contactItem) => contactItem.public_key === publicKey) === -1 && (
          <Button circle size="sm" theme="default" onClick={addToContacts}>
            <Icon name="person_add" className="w-5 h-5" />
          </Button>
        ) }
      </div>

      <Dialog
        isOpen={isOpen}
      >
        <DialogTitle
          title="Select Contact"
          closeButton
          onClose={() => setIsOpen(false)}
        />
        <DialogBody className="py-3">
          <ContactList
            onContactClick={handleContactClick}
            selectedContact={publicKey}
            includesMe
          />
        </DialogBody>
      </Dialog>
    </>
  );
}

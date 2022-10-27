import './ContactSelector.css'
import { CryptographyPublicKey } from "@/services/cryptography";
import { cx } from "@/utils/cx";
import { useCallback, useState } from "preact/hooks";
import Icon from "./Icon";
import Dialog, { DialogBody, DialogTitle } from "@/services/dialog";
import ContactRow from "./ContactRow";
import { Contact } from '@/services/contacts';
import { FormFieldLabel, FormFieldProps } from "../form/Form";
import ContactList from "./ContactList";


export type ContactSelectorProps = FormFieldProps & {
  className?: string,
  publicKey?: CryptographyPublicKey,
  onInput?: (newPublicKey: CryptographyPublicKey) => void,
}

export type ContactSelectorTabs = null | 'contact' | 'manual';

export default function ContactSelector({ publicKey, onInput, className, label }: ContactSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleContactClick = useCallback((selectedContact: CryptographyPublicKey) => {
    setIsOpen(false);
    if (onInput) {
      onInput(selectedContact);
    }
  }, [setIsOpen, onInput]);


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

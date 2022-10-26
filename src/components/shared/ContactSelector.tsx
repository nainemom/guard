import { CryptographyPublicKey, hash } from "@/services/cryptography";
import { cx } from "@/utils/cx";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import Avatar from "./Avatar";
import Icon from "./Icon";
import Username from "./Username";
import './ContactSelector.css'
import Dialog, { DialogBody, DialogButtons, DialogTitle } from "@/services/dialog";
import ContactRow from "./ContactRow";
import { List, ListItem } from "../common/List";
import { useStorage } from "@/services/storage";
import { Contact, storageKey as contactsStorageKey, UnSavedContact } from '@/services/contacts';
import Form, { FormFieldLabel, FormFieldProps } from "../form/Form";
import Button from "../form/Button";
import Input from "../form/Input";
import ContactList from "./ContactList";
import { TabItem, Tabs } from "../common/Tabs";


export type ContactSelectorProps = FormFieldProps & {
  className?: string,
  publicKey: CryptographyPublicKey,
  onInput?: (newPublicKey: CryptographyPublicKey) => void,
}

export type ContactSelectorTabs = null | 'contact' | 'manual';

export default function ContactSelector({ publicKey, onInput, className, label }: ContactSelectorProps) {
  const [manualContact, setManualContact] = useState<UnSavedContact>({
    public_key: publicKey,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<ContactSelectorTabs>(null);
  const [contacts] = useStorage<Contact[]>(contactsStorageKey);
  
  useEffect(() => {
    setManualContact({
      public_key: publicKey,
    });
  }, [publicKey]);

  useEffect(() => {
    if (isOpen) {
      if ((!publicKey && contacts?.length || 0 > 0) || contacts?.findIndex?.((contactItem) => contactItem.public_key === publicKey) || -1 > -1) {
        setSelectedTab('contact');
      } else {
        setSelectedTab('manual');
      }
    } else {
      setSelectedTab(null);
    }
  }, [isOpen, publicKey, contacts, setSelectedTab]);

  const handleContactClick = useCallback((selectedContact: UnSavedContact) => {
    setIsOpen(false);
    if (onInput) {
      onInput(selectedContact.public_key);
    }
  }, [setIsOpen, onInput]);

  const handleManualContactSubmit = useCallback((newManualContact: UnSavedContact) => {
    setIsOpen(false);
    if (onInput) {
      onInput(newManualContact.public_key);
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
        <div>
          <Tabs value={selectedTab} onChange={(newTab) => setSelectedTab(newTab as ContactSelectorTabs)}>
            <TabItem tabId="contact">Select From Contact List</TabItem>
            <TabItem tabId="manual">Enter Public Key</TabItem>
          </Tabs>
        </div>
        { selectedTab === 'contact' && (
          <DialogBody className="py-3">
            <ContactList
              onContactClick={handleContactClick}
            />
          </DialogBody>
        ) }
        { selectedTab === 'manual' && (
          <Form
            value={manualContact}
            onInput={(newManualContact) => setManualContact(newManualContact as UnSavedContact)}
            onSubmit={(newManualContact) => handleManualContactSubmit(newManualContact as UnSavedContact)}
          >
            <DialogBody className="p-3">
              <Input
                name="public_key"
                size="manual"
                className="h-full"
                multiLine
                placeholder="Ask Your Contact to Share His/Her Public Key with You."
              />
            </DialogBody>
            <DialogButtons>
              <Button type="submit" theme="primary">
                <Icon name="done" className="w-5 h-5" />
                Submit
              </Button>
            </DialogButtons>
          </Form>
        ) }
      </Dialog>
    </>
  );
}

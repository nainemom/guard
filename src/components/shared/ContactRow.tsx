import './ContactRow.css';
import { getContacts, UnSavedContact } from "@/services/contacts";
import { CryptographyPairKeys, CryptographyPublicKey } from "@/services/cryptography";
import { cx } from "@/utils/cx";
import { useMemo } from "react";
import Avatar from "./Avatar";
import Username from "./Username";
import { storageKey as authStorageKey } from '@/services/auth';
import { useStorage } from '@/services/storage';


export type ContactRowProps = {
  publicKey: CryptographyPublicKey,
  className?: string,
  size?: 'md' | 'sm',
}

const contactRowDefaultProps = {
  size: 'md',
};

export default function ContactRow(props: ContactRowProps) {
  const { publicKey, className, size } = { ...contactRowDefaultProps, ...props };
  const [personalKeys] = useStorage<CryptographyPairKeys>(authStorageKey);
  const contact = useMemo<UnSavedContact>(() => {
    const fromContacts = getContacts().find((contactItem) => contactItem.public_key === publicKey);
    if (fromContacts) {
      return fromContacts;
    }
    return {
      public_key: publicKey,
      note: publicKey === personalKeys.public_key ? 'Me' : '',
    };
  }, [publicKey, personalKeys]);
  
  return (
    <div className={cx('x-contact-row', `x-contact-row-${size}`, className)}>
      <Avatar publicKey={contact.public_key} className="x-contact-row-avatar" />
      <div className="x-contact-row-text">
        <h2>
          <Username publicKey={contact.public_key} />
        </h2>
        { contact.note && (
          <p>{ contact.note }</p>
        ) }
      </div>
    </div>
  );
}
import { getContacts, UnSavedContact } from "@/services/contacts";
import { CryptographyPublicKey } from "@/services/cryptography";
import { cx } from "@/utils/cx";
import { useMemo } from "preact/hooks";
import Avatar from "./Avatar";
import Username from "./Username";
import './ContactRow.css';

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
  const contact = useMemo<UnSavedContact>(() => {
    const fromContacts = getContacts().find((contactItem) => contactItem.public_key === publicKey);
    if (fromContacts) {
      return fromContacts;
    }
    return {
      public_key: publicKey,
      note: '',
    };
  }, [publicKey]);
  
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
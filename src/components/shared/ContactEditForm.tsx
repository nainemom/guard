import Button from '@/components/form/Button';
import Form, { FormErrors } from '@/components/form/Form';
import Input from '@/components/form/Input';
import { Contact, removeContact, saveContact, UnSavedContact } from '@/services/contacts';
import { DialogBody, DialogButtons, DialogTitle } from '@/services/dialog';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import Icon from './Icon';

export type ContactEditFormProps = {
  contact: Partial<Contact>,
  onSuccess?: (newContacts: Contact[]) => void,
  onClose?: () => void,
}

export default function ContactEditForm({ contact, onSuccess, onClose }: ContactEditFormProps) {
  const [formData, setFormData] = useState(contact);

  useEffect(() => {
    setFormData(contact);
  }, [contact]);

  const formValidator = useCallback((submittedFormData: Partial<Contact | UnSavedContact>) => {
    let errors: FormErrors = {};
    if ((submittedFormData?.public_key?.length || 0) < 10) {
      errors.public_key = 'Public Key is not Correct!';
    }
    return errors;
  }, []);

  const handleFormInput = useCallback((newFormData: Partial<Contact | UnSavedContact>) => {
    setFormData(newFormData);
  }, [setFormData]);

  const requestClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const handleRemoveContact = useCallback(() => {
    if (typeof contact.id !== 'string') return;
    if (!confirm(`Are you sure you want to delete this contact?`)) return;
    const removeContactResult = removeContact(contact.id);
    if (onSuccess) {
      onSuccess(removeContactResult);
    }
    requestClose();
  }, [contact]);

  const handleFormSubmit = useCallback((submittedFormData: Partial<Contact | UnSavedContact>) => {
    if (!submittedFormData) {
      return;
    }
    const saveContactResult = saveContact(submittedFormData as (Contact | UnSavedContact));
    if (onSuccess) {
      onSuccess(saveContactResult);
    }
    requestClose();
  }, [onSuccess, requestClose]);

  const title = useMemo(() => {
    return typeof contact.id === 'string' ? 'Edit Contact' : 'Add New Contact';
  }, [contact]);

  return (
    <>
      <DialogTitle title={title} closeButton onClose={requestClose} />
      <Form
        value={formData}
        onInput={handleFormInput}
        onSubmit={handleFormSubmit}
        validator={formValidator}
      >
        <DialogBody className="p-3">
          <div className="mb-3">
            <Input name="public_key" size="manual" className="h-52" multiLine placeholder="Ask Your Contact to Share His/Her Public Key with You." label="Public Key:" />
          </div>
          <div>
          <Input name="note" size="md" placeholder="Something for you to remember this contact." label="Note:" />
          </div>
        </DialogBody>
        <DialogButtons>
          { !!contact.id && (
            <Button type="button" theme="danger" onClick={handleRemoveContact}>
              <Icon name="delete" className="w-5 h-5" />
              Delete
            </Button>
          ) }
          <Button type="submit" theme="primary">
            <Icon name="save" className="w-5 h-5" />
            Save
          </Button>
        </DialogButtons>
      </Form>
    </>
  )
}

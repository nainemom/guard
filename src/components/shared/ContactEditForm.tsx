import Button from '@/components/form/Button';
import Form, { FormErrors } from '@/components/form/Form';
import Input from '@/components/form/Input';
import { Contact, removeContact, saveContact, UnSavedContact } from '@/services/contacts';
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
      <h2 className="text-center font-semibold text-base p-4">{ title }</h2>
      <Form
        value={formData}
        onInput={handleFormInput}
        onSubmit={handleFormSubmit}
        validator={formValidator}
      >
        <div className="py-2 px-4">
          <Input name="public_key" size="manual" className="h-40" multiLine placeholder="Ask Your Contact to Share His/Her Public Key with You." label="Public Key:" />
        </div>
        <div className="p-4 flex flex-row items-center gap-2">
          <div className="flex-grow">
            { !!contact.id && (
              <Button type="button" theme="danger" onClick={handleRemoveContact}>
                <Icon name="delete" className="w-4 h-4" />
                Delete
              </Button>
            ) }
          </div>
          <div class="contents">
            <Button type="button" onClick={requestClose}>
              <Icon name="close" className="w-4 h-4" />
              Close
            </Button>
            <Button type="submit" theme="primary">
              <Icon name="save" className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
      </Form>
    </>
  )
}

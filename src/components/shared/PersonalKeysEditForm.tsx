import Button from '@/components/form/Button';
import Form, { FormErrors } from '@/components/form/Form';
import Input from '@/components/form/Input';
import { saveAuth, storageKey as authStorageKey } from '@/services/auth';
import { CryptographyPairKeys, generatePairKeys } from '@/services/cryptography';
import { DialogBody, DialogButtons, DialogTitle } from '@/services/dialog';
import { useStorage } from '@/services/storage';
import { useCallback, useEffect, useState } from 'react';
import Icon from './Icon';

export type PersonalKeysEditFormProps = {
  onSuccess?: () => void,
  onClose?: () => void,
}

export default function PersonalKeysEditForm({ onSuccess, onClose }: PersonalKeysEditFormProps) {
  const [personalKeys, setPersonalKeys] = useStorage<CryptographyPairKeys>(authStorageKey);

  const [formData, setFormData] = useState<Partial<CryptographyPairKeys>>(personalKeys);
  useEffect(() => {
    setFormData(personalKeys);
  }, [personalKeys]);

  const formValidator = useCallback((submittedFormData: Partial<CryptographyPairKeys>) => {
    let errors: FormErrors = {};
    if ((submittedFormData?.public_key?.length || 0) < 10) {
      errors.public_key = 'This field is required!';
    }
    if ((submittedFormData?.private_key?.length || 0) < 10) {
      errors.private_key = 'This field is required!';
    }
    return errors;
  }, []);

  const handleFormInput = useCallback((newFormData: Partial<CryptographyPairKeys>) => {
    setFormData(newFormData);
  }, [setFormData]);

  const requestClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const regenerate = useCallback(() => {
    generatePairKeys().then(setFormData);
  }, []);

  const handleFormSubmit = useCallback((submittedFormData: Partial<CryptographyPairKeys>) => {
    if (!submittedFormData) {
      return;
    }
    if (submittedFormData.private_key !== personalKeys.private_key || submittedFormData.public_key !== personalKeys.public_key) {
      if (!confirm('You have changed your personal keys! You cannot decrypt messages encrypted by your previous public key. Are you sure you want to do this?')) {
        return;
      }
    }
    setPersonalKeys(submittedFormData as CryptographyPairKeys);
    if (onSuccess) {
      onSuccess();
    }
    requestClose();
  }, [onSuccess, requestClose]);

  return (
    <>
      <DialogTitle title="Edit Personal Keys" closeButton onClose={requestClose} />
      <Form
        value={formData}
        onInput={handleFormInput}
        onSubmit={handleFormSubmit}
        validator={formValidator}
      >
        <DialogBody className="p-3">
          <div className="mb-3">
            <Input className="h-52" name="public_key" size="manual" multiLine placeholder="Your Public Key." label="Public Key:" />
          </div>
          <div>
            <Input className="text-danger-normal h-52" name="private_key" size="manual" multiLine placeholder="Your Private Key." label="Private Key:" />
            <p className="mt-3 text-xs text-body-subtitle">Never share this value to anyone!</p>
          </div>
        </DialogBody>
        <DialogButtons>
          <Button type="button" onClick={regenerate}>
            <Icon name="magic_button" className="w-5 h-5" />
            Regenerate
          </Button>
          <Button type="submit" theme="primary">
            <Icon name="save" className="w-5 h-5" />
            Save
          </Button>
        </DialogButtons>
      </Form>
    </>
  )
}

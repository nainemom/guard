import Button from '@/components/form/Button';
import Form, { FormErrors } from '@/components/form/Form';
import Input from '@/components/form/Input';
import { saveAuth, storageKey as authStorageKey } from '@/services/auth';
import { CryptographyPairKeys, generatePairKeys } from '@/services/cryptography';
import { useStorage } from '@/services/storage';
import { useCallback, useEffect, useState } from 'preact/hooks';
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
      errors.display_name = 'This field is required!';
    }
    if ((submittedFormData?.private_key?.length || 0) < 10) {
      errors.public_key = 'This field is required!';
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
      <h2 className="text-center font-semibold text-base p-4">Edit Personal Key</h2>
      <Form
        value={formData}
        onInput={handleFormInput}
        onSubmit={handleFormSubmit}
        validator={formValidator}
      >
        <div className="py-2 px-4">
          <Input name="public_key" multiLine placeholder="Your Public Key." label="Public Key:" />
        </div>
        <div className="py-2 px-4">
          <Input className="text-danger-normal" name="private_key" multiLine placeholder="Your Private Key." label="Private Key:" />
          <p className="mt-2 text-xs text-body-subtitle">Never share this value to anyone!</p>
        </div>
        <div className="p-4 flex flex-row items-center gap-2">
          <div className="flex-grow flex flex-row items-center gap-2">
            <Button type="button" onClick={regenerate}>
              <Icon name="magic_button" className="w-4 h-4" />
              Regenerate
            </Button>
          </div>
          <div className="contents">
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

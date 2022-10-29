import { FILES_MIME_TYPE, AUTH_FILE_EXT, ENCRYPTED_FILE_EXT } from '@/constants';
import { ab2str, str2ab } from '@/utils/convert';
import { CryptographyPairKeys } from './cryptography';


export const createAuthFile = (pairKeys: CryptographyPairKeys) => new File([
  str2ab(JSON.stringify(pairKeys)),
], `guard_access_key.${AUTH_FILE_EXT}`, {
  type: FILES_MIME_TYPE,
});

export const openAuthFile = async (file: File): Promise<CryptographyPairKeys> => JSON.parse(ab2str(await file.arrayBuffer()));

export const createEncryptedFile = (
  encrypted: ArrayBuffer,
  originalFileName: string = 'message.txt',
) => new File([encrypted], `${originalFileName}.${ENCRYPTED_FILE_EXT}`, {
  type: FILES_MIME_TYPE,
});

export const openEncryptedFile = async (file: File): Promise<[ArrayBuffer, string]> => {
  const ab = await file.arrayBuffer();
  let name = ((file as File)?.name || 'unknown.file').replace(new RegExp(`\.${ENCRYPTED_FILE_EXT}$`, 'g'), '');
  return [ab, name];
}


export const exportFileToUser = (file: File): Promise<void> => new Promise((resolve) => {
  const url = URL.createObjectURL(file);
  const aTag = document.createElement('a');
  aTag.href = url;
  aTag.download = file.name;
  document.body.appendChild(aTag);
  setTimeout(() => {
    aTag.click();
    resolve();
    setTimeout(() => {
      document.body.removeChild(aTag);
      window.URL.revokeObjectURL(url);  
    }, 100);
  }, 100);
});


export const getFileFromUser = (): Promise<File> => new Promise((resolve, reject) => {

  const fileInputTag = document.createElement('input');
  fileInputTag.type='file';
  fileInputTag.name='file';
  fileInputTag.style.position = 'fixed';
  fileInputTag.style.top = '-999px';
  document.body.appendChild(fileInputTag);

  const handleChange = (event: Event) => {
    const returnValue = (event?.target as HTMLInputElement)?.files?.[0];
    if (returnValue) {
      resolve(returnValue);
    } else {
      reject();
    }
    fileInputTag.removeEventListener('change', handleChange);
    document.body.removeChild(fileInputTag);
  }
  fileInputTag.addEventListener('change', handleChange);
  setTimeout(() => {
    fileInputTag.click();
  }, 100);
  

});
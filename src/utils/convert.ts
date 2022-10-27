// https://stackoverflow.com/a/43271130
export const ubtoa = (buffer: ArrayBuffer) => btoa(new Uint8Array(buffer).reduce((p, b) => p + String.fromCharCode(b), ''));

// https://stackoverflow.com/a/43271130
export const uatob = (str: string) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0));

export const ab2str = (buf: ArrayBuffer) => new TextDecoder().decode(buf);

export const str2ab = (str: string) => new TextEncoder().encode(str);

export const str2hex = (str: string): string => {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const hex = str.charCodeAt(i).toString(16);
    result += (hex.length === 2 ? hex : '0' + hex);
  }
  return result.toUpperCase();
}

export const abs2ab = (abs: ArrayBuffer[]): ArrayBuffer => {
  const ret = new ArrayBuffer(abs.reduce((prev, current) => prev + current.byteLength, 0));
  const bufView = new Uint8Array(ret);
  abs.reduce((prevLength, currentAb) => {
    bufView.set(new Uint8Array(currentAb), prevLength);
    return prevLength + currentAb.byteLength;
  }, 0);
  return ret;
}

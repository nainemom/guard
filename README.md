# Guard
Encrypt and Decrypt Messages using RSA keys.

## Details
Sometimes you have to send sensitive data to someone, but you can't trust any messaging app (like SMS Protocol or Soroush App), even if the app using SSL protocol, the problem is that the App itself can read your message. in that case, **Guard** helps you to encrypt data using RSA keys so that only the recipient can decrypt and read data.
When you open app, You can generate a unique RSA key pair (private and public keys) for you called `Auth` and you can save it as a file (to access it from other computers or in future). For requesting other people to send you an encrypted message, just share your Guard link (your public key) and ask them to encrypt messages for your before sending. Then you can decrypt those messages using Guard (with your private key). Although Guard is like an e2e encrypted message app, it doesn't have any Signal/Messaging server and users send encrypted data to each other manually using the `share` feature on other messenger services.

## Does It Require Internet to Work?
NO. All the encryption/decryption functionalities just run inside of your browser and Guard never sends data out of your local machine.

## Credit
This project started in October 2022 after a very helpful talk with [Mohamad Mohebifar](https://github.com/mohebifar) and [Saeed Alipoor](https://github.com/saeedalipoor).

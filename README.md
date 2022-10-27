# Guard
Encrypt and Decrypt Messages

## Details
Sometimes you have to send sensitive data to someone, but you can't trust any messaging app (like SMS Protocol or Soroush App), in that case, **Guard** helps you to encrypt data so that only the recipient can decrypt and read data. When you open the Guard app for the first time, it automatically generates a unique RSA key pair for you called `Auth` and you can save it as a file (to access it from other computers). For requesting other people to send you an encrypted message, just share your guard link and ask them to send you an encrypted message. Although Guard is like an e2e encrypted message app, it doesn't have any Signal/Messaging server and users send encrypted data to each other manually using the `share` feature on other messenger services.

## Does It Require Internet to Work?
NO. All the encryption/decryption functionalities just run inside of your browser and Guard never sends data out of your local machine.

## Credit
This project started in October 2022 after a very helpful talk with @mohebifar and @saeedalipoor.

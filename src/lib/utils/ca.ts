import { readFileSync } from 'fs';
import { join } from 'path';
import { X509Certificate, cryptoProvider, PemConverter } from "@peculiar/x509";
import { Crypto } from "@peculiar/webcrypto";

export class CACert {
    cert: X509Certificate;
    key: CryptoKey
};

let caCert: CACert = undefined;

const crypto = new Crypto();
cryptoProvider.set(crypto); // Set crypto provider

const filePathCert = join(process.cwd(), 'src', 'lib', 'stores', 'cas', 'ca1-cert.pem');
const filePathKey = join(process.cwd(), 'src', 'lib', 'stores', 'cas', 'ca1-key.pem');

async function convertPrivateKey(keyPem: string) {
    return crypto.subtle.importKey(
        'pkcs8',
        PemConverter.decode(keyPem)[0],
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        true,
        ['sign']
    );
}

export async function loadCA() {
    caCert = {
        cert: new X509Certificate(
            readFileSync(filePathCert, 'utf8')
        ),
        key: await convertPrivateKey(
            readFileSync(filePathKey, 'utf8')
        )
    }
}

export function getCA() : CACert {
    return caCert;
}
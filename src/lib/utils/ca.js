import { readFileSync } from 'fs';
import { join } from 'path';
import * as x509 from "@peculiar/x509";
import { Crypto } from "@peculiar/webcrypto";

let caCert = {};

const crypto = new Crypto();
x509.cryptoProvider.set(crypto); // Set crypto provider

const filePathCert = join(process.cwd(), 'src', 'lib', 'stores', 'cas', 'ca1-cert.pem');
const filePathKey = join(process.cwd(), 'src', 'lib', 'stores', 'cas', 'ca1-key.pem');

async function convertPrivateKey(keyPem) {
    return crypto.subtle.importKey(
        'pkcs8',
        x509.PemConverter.decode(keyPem)[0],
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        true,
        ['sign']
    );
}

export async function loadCA() {
    caCert = {
        cert: new x509.X509Certificate(
            readFileSync(filePathCert, 'utf8')
        ),
        key: await convertPrivateKey(
            readFileSync(filePathKey, 'utf8')
        )
    }
}

export function getCA() {
    return caCert;
}
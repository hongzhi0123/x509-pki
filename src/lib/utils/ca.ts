import { X509Certificate, cryptoProvider, PemConverter } from "@peculiar/x509";
import { Crypto } from "@peculiar/webcrypto";
import cas from '$lib/stores/cas.json';

export class CACert {
    id: number;
    name: string;
    cn: string;
    cert: X509Certificate;
    key: CryptoKey
};

let caCerts: CACert[] = [];
let caList = cas;

const crypto = new Crypto();
cryptoProvider.set(crypto); // Set crypto provider

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
    await caList.map(async ca => {
        const cert = new X509Certificate(ca.cert);
        caCerts.push({
            id: ca.id,
            name: ca.name,
            cn: cert.subjectName.getField('CN')[0],
            cert: cert,
            key: await convertPrivateKey(ca.key)
        })
    });
}

export function getCAById(id: number) : CACert {
    return caCerts.find(ca => ca.id === id);
}

export function getCAByCn(cn: string) : CACert {
    return caCerts.find(ca => ca.cn === cn);
}
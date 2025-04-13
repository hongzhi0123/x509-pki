import { X509Certificate, cryptoProvider, PemConverter } from "@peculiar/x509";
import { Crypto } from "@peculiar/webcrypto";
import cas from '$lib/stores/cas.json';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

export class CACert {
    id: number;
    name: string;
    cn: string;
    cert: X509Certificate;
    key: CryptoKey;
    root: X509Certificate
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

let serialDB = undefined

export async function loadCASerial() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const filePath = path.join(__dirname, './data/caSerial.json');
    const adapter = new JSONFile(filePath);
    serialDB = new Low(adapter, {});
    await serialDB.read();
}

export async function getCASerial(id) {
    const item = serialDB.data.cas.find(item => item.id === id);
    item.serial++;
    await serialDB.write();
    return item.serial;
}

export async function loadCA() {
    await caList.map(async ca => {
        const cert = new X509Certificate(ca.cert);
        const root = ca.root ? new X509Certificate(ca.root) : null;
        caCerts.push({
            id: ca.id,
            name: ca.name,
            cn: cert.subjectName.getField('CN')[0],
            cert,
            key: await convertPrivateKey(ca.key),
            root
        })
    });
}

export function getCAById(id: number) : CACert {
    return caCerts.find(ca => ca.id === id);
}

export function getCAByCn(cn: string) : CACert {
    return caCerts.find(ca => ca.cn === cn);
}

export async function getCAs(): Promise<any[]> {
    if (caCerts.length === 0) {
        await loadCA();
    }

    return caCerts.map(ca => ({
        id: ca.id,
        name: ca.name
    }));
}

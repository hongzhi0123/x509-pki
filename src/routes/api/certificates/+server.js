import { json } from "@sveltejs/kit";
import { createCertificate } from "$lib/utils/certificate";
import { getCAById, getCASerial } from "$lib/utils/ca";
import { DataStore } from "$lib/utils/dataStore";
import { createP12 } from "$lib/utils/p12Export";
import { extractRoles } from "../../../lib/utils/qcStatement/qcStatementsExtension.js";

const certStore = new DataStore();
// const certificates = await certStore.getAll();

export async function GET() {
    const certificates = await certStore.getAll();
    certificates.forEach(cert => {
        // Extract roles from the certificate using the QCStatementsExtension
        if (cert != null && cert.cert) {
            cert.roles = extractRoles(cert.cert);
        }
    });
    return json(certificates);
}

export async function POST({ request }) {
    const newCertReq = await request.json();
    const certificates = await certStore.getAll();
    newCertReq.id = await getCASerial(newCertReq.caId);

    const caCert = getCAById(newCertReq.caId);
    if (!caCert) {
        return json({ error: 'CA not found' }, { status: 404 });
    }
    
    const newCertData = await createCertificate(newCertReq, caCert);

    certificates.push(newCertData);
    await certStore.add(newCertData);

    // Generate the PKCS#12 file
    const p12Buffer = createP12(
        newCertData.cert, 
        newCertData.key, 
        'changeit', 
        [
            caCert.cert.toString("pem"), 
            ...(caCert.root ? [caCert.root.toString("pem")] : [])
        ]);

    return new Response(p12Buffer, {
        headers: {
            'Content-Type': 'application/x-pkcs12',
            'Content-Disposition': 'attachment; filename="qwac-certificate.p12"',
            'Content-Length': p12Buffer.length,
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        }
    });
}
import { json } from "@sveltejs/kit";
import { createCertificate } from "$lib/utils/certificate";
import { getCAById, getCASerial } from "$lib/utils/ca";
import { DataStore } from "$lib/utils/dataStore";


const certStore = new DataStore();
// const certificates = await certStore.getAll();

export async function GET() {
    const certificates = await certStore.getAll();
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

    return json({ message: 'Certificate created successfully' });
}
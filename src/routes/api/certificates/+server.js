import { json } from "@sveltejs/kit";
import { createCertificate } from "$lib/utils/certificate.js";
import { getCA, loadCA } from "$lib/utils/ca.js";
import { DataStore } from "$lib/utils/dataStore.js";

// Load CA when the server starts
await loadCA();

const certStore = new DataStore();
const certificates = await certStore.getAll();

export async function GET() {
    return json(certificates);
}

export async function POST({ request }) {
    const newCertReq = await request.json();
    newCertReq.id = certificates.length + 1; // Assign a new ID

    const caCert = getCA();
    
    const newCertData = await createCertificate(newCertReq, caCert);

    certificates.push(newCertData);
    await certStore.add(newCertData);

    return json({ message: 'Certificate created successfully' });
}
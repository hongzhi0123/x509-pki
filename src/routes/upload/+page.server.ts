import { fail } from '@sveltejs/kit';
import { parseUploadedCerts } from '$lib/utils/certificate';
import { writeFileSync } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

export const actions = {
    default: async ({ request }) => {
        const formData = Object.fromEntries(await request.formData());

        if (
            !(formData.fileToUpload as File).name ||
            (formData.fileToUpload as File).name === 'undefined'
        ) {
            return fail(400, {
                error: true,
                message: 'You must provide a file to upload'
            });
        }

        const { fileToUpload } = formData as { fileToUpload: File };

        try {
            const text = await fileToUpload.text();
            const jsonObject = JSON.parse(text);
            
            const certList = parseUploadedCerts(jsonObject);
            // ToDo: Reset the store with the new certs
            // certStore.replaceAll(certList);

            return { success: true };
        } catch (error) {
            return fail(400, { error: 'Invalid JSON file' });
        }
    }
}
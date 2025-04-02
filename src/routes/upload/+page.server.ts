import { fail } from '@sveltejs/kit';
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

        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const filepath = path.join(__dirname, '../../lib/utils/data/db.json');
        // Write the file to the static folder
        writeFileSync(filepath, Buffer.from(await fileToUpload.arrayBuffer()));

        return {
            success: true
        };
    }
};
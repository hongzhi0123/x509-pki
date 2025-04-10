import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

export class DataStore {
    constructor() {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const filepath = path.join(__dirname, './data/db.json');
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const adapter = new JSONFile(filepath);
        this.db = new Low(adapter, {});
        this.init();
    }

    async init() {
        // Read data from JSON file, this will set db.data content
        await this.db.read();
        // If db.json doesn't exist, db.data will be null, so set default value
        this.db.data = this.db.data || { items: [] };
        if (!this.db.data.items) {
            this.db.data.items = [];
        }
        await this.db.write();
    }

    async getAll() {
        await this.db.read();
        return this.db.data.items;
    }

    async get(id) {
        await this.db.read();
        return this.db.data.items.find(item => item.id === id);
    }

    async add(item) {
        await this.db.read();
        this.db.data.items.push(item);
        await this.db.write();
    }

    async replaceAll(newItems) {
        // Ensure the newItems is an array
        if (!Array.isArray(newItems)) {
            throw new Error("Input must be an array");
        }
    
        // Read the current database state
        await this.db.read();
    
        // Replace the items array with the new array
        this.db.data.items = newItems;
    
        // Write the updated data back to the JSON file
        await this.db.write();
    }
}



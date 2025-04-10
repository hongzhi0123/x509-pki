import { loadCA, loadCASerial } from "$lib/utils/ca";
// import { DataStore } from "$lib/utils/dataStore.js";

// Load CA and current Serial number when the server starts
await loadCA();
await loadCASerial();
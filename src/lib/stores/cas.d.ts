declare module '$lib/stores/cas.json' {
    const value: Array<{
        id: number;
        name: string;
        cert: string;
        key: string;
        root: string;
    }>;
    export default value;
}
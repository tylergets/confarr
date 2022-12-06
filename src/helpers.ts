export function formatAsFields(obj: any) {
    return Object.entries(obj).map(([name, value]) => ({name, value}));
}
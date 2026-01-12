/**
 * Performs a simple fuzzy match between a query and a target string.
 * It's resilient to minor typos and matches characters in order.
 */
export const fuzzyMatch = (query: string, target: string): boolean => {
    const q = query.toLowerCase().replace(/\s/g, '');
    const t = target.toLowerCase();

    if (t.includes(q)) return true;

    let queryIdx = 0;
    let targetIdx = 0;

    while (queryIdx < q.length && targetIdx < t.length) {
        if (q[queryIdx] === t[targetIdx]) {
            queryIdx++;
        }
        targetIdx++;
    }

    return queryIdx === q.length;
};

/**
 * Searches through an array of objects for matches across multiple fields.
 */
export const fuzzySearch = <T>(
    data: T[],
    query: string,
    fields: (keyof T)[]
): T[] => {
    if (!query.trim()) return data;

    return data.filter((item) => {
        return fields.some((field) => {
            const value = item[field];
            if (typeof value === 'string') {
                return fuzzyMatch(query, value);
            }
            return false;
        });
    });
};

// Basic in-memory rate limiter
const ipMap = new Map<string, { count: number; windowStart: number }>();

export function rateLimit(ip: string, windowMs: number, maxRequests: number) {
    const now = Date.now();
    const record = ipMap.get(ip) || { count: 0, windowStart: now };

    if (now - record.windowStart > windowMs) {
        record.count = 0;
        record.windowStart = now;
    }

    record.count++;

    // clean up expired entries occasionally to prevent memory leak
    if (Math.random() < 0.01) {
        for (const [key, val] of ipMap.entries()) {
            if (now - val.windowStart > windowMs) {
                ipMap.delete(key);
            }
        }
    }

    ipMap.set(ip, record);

    return record.count <= maxRequests;
}

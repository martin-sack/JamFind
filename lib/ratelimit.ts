import { NextRequest } from "next/server";

const hits = new Map<string, { count: number; ts: number }>();

export function rateLimit(key: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const slot = hits.get(key);
  if (!slot || now - slot.ts > windowMs) {
    hits.set(key, { count: 1, ts: now });
    return true;
  }
  if (slot.count >= limit) return false;
  slot.count++;
  return true;
}

// Advanced rate limiter with checkNext method
export const rl = {
  limit: rateLimit,
  
  checkNext: (req: NextRequest, limit = 10, windowMs = 60_000) => {
    // Get identifier from request (IP or user agent)
    const identifier = req.headers.get("x-forwarded-for") || 
                      req.headers.get("x-real-ip") || 
                      req.ip || 
                      "anonymous";
    
    const key = `rate-limit:${identifier}`;
    const now = Date.now();
    const slot = hits.get(key);
    
    let remaining = limit;
    let reset = now + windowMs;
    
    if (!slot || now - slot.ts > windowMs) {
      // New window
      hits.set(key, { count: 1, ts: now });
      remaining = limit - 1;
    } else if (slot.count >= limit) {
      // Rate limit exceeded
      remaining = 0;
      reset = slot.ts + windowMs;
    } else {
      // Within limit
      slot.count++;
      remaining = limit - slot.count;
      reset = slot.ts + windowMs;
    }
    
    // Return headers object
    const headers = new Headers();
    headers.set("X-RateLimit-Limit", limit.toString());
    headers.set("X-RateLimit-Remaining", remaining.toString());
    headers.set("X-RateLimit-Reset", Math.ceil(reset / 1000).toString());
    
    return headers;
  }
};
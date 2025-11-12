// Simple SSE broadcast hub (in-memory; swap to Redis later)
type Client = { id: string; res: any };
const channels: Record<string, Map<string, any>> = {};

export function publish(channel: string, data: any) {
  const m = channels[channel];
  if (!m) return;
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of Array.from(m.values())) {
    try {
      res.write?.(msg);
    } catch (e) {
      // Client disconnected
    }
  }
}

export function subscribe(channel: string) {
  const id = crypto.randomUUID();
  if (!channels[channel]) channels[channel] = new Map();
  return { 
    id, 
    add: (res: any) => channels[channel].set(id, res), 
    remove: () => channels[channel]?.delete(id) 
  };
}

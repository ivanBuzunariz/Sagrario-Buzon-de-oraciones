export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export async function hashPin(pin: string): Promise<string> {
  if (!isValidPin(pin)) {
    throw new Error('El PIN debe tener exactamente 4 dígitos numéricos.');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(`sagrario_pin_salt_v1:${pin}`);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  if (!isValidPin(pin) || !storedHash) {
    return false;
  }
  const candidate = await hashPin(pin);
  return candidate === storedHash;
}

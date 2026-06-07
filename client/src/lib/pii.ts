// Client-side PII abstraction — strips personal identifiers before sending to API

interface PIIData {
  name: string;
  age: number;
  gender: string;
  guardianName?: string;
  guardianContact?: string;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function abstractPII(text: string, pii: PIIData | null): string {
  if (!pii) return text;
  let result = text;
  result = result.replace(new RegExp(`\\b${escapeRegex(pii.name)}\\b`, 'gi'), '[PATIENT]');
  result = result.replace(new RegExp(`\\b${pii.age}\\b`, 'g'), '[AGE]');
  result = result.replace(new RegExp(`\\b${escapeRegex(pii.gender)}\\b`, 'gi'), '[GENDER]');
  if (pii.guardianName) {
    result = result.replace(new RegExp(`\\b${escapeRegex(pii.guardianName)}\\b`, 'gi'), '[GUARDIAN]');
  }
  if (pii.guardianContact) {
    result = result.replace(new RegExp(`\\b${escapeRegex(pii.guardianContact)}\\b`, 'gi'), '[GUARDIAN_CONTACT]');
  }
  return result;
}

export function rehydratePII(text: string, pii: PIIData | null): string {
  if (!pii) return text;
  let result = text;
  result = result.replace(/\[PATIENT\]/g, pii.name || '[PATIENT]');
  result = result.replace(/\[AGE\]/g, String(pii.age || '[AGE]'));
  result = result.replace(/\[GENDER\]/g, pii.gender || '[GENDER]');
  if (pii.guardianName) {
    result = result.replace(/\[GUARDIAN\]/g, pii.guardianName || '[GUARDIAN]');
  }
  return result;
}

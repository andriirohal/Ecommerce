export function getSecret(key: string): string {
  const secret = process.env[key];

  if (!secret) {
    throw new Error(`${key} must be set`);
  };

  return secret;
};
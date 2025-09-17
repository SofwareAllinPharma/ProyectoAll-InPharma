import jwt, { SignOptions } from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? '';
if (!SECRET) throw new Error('JWT_SECRET no definido');

const EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '1h';

export function signAccessToken(sub: string) {
  return jwt.sign({ sub }, SECRET, { expiresIn: EXPIRES_IN });
}

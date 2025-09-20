import jwt, { SignOptions } from 'jsonwebtoken';

//En este archivo se maneja la firma de los tokens JWT
//primero se obtiene el el jwt secreto y el tiempo de expiración desde las variables de entorno

const SECRET = process.env.JWT_SECRET ?? '';
if (!SECRET) throw new Error('JWT_SECRET no definido');

const EXPIRES_TIME: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']);

  //la función signAccessToken recibe un subject (sub) que generalmente es el identificador del usuario (en este caso el mail) y 
  // retorna un token firmado con el sub y las opciones de expiración definidas
export function signAccessToken(sub: string) {
  return jwt.sign({ sub }, SECRET, { expiresIn: EXPIRES_TIME });
}

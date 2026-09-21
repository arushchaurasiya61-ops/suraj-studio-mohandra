import crypto from 'crypto';import {cookies} from 'next/headers';
const secret=()=>process.env.GALLERY_ACCESS_SECRET||process.env.DRIVE_TOKEN_ENCRYPTION_KEY||'';
export function hashPassword(password:string,salt:string){return crypto.scryptSync(password,salt,32).toString('hex')}
export function verifyPassword(password:string,salt:string,hash:string){const a=Buffer.from(hash,'hex');const b=crypto.scryptSync(password,salt,a.length);return a.length===b.length&&crypto.timingSafeEqual(a,b)}
export function accessToken(eventId:string){const exp=Date.now()+12*60*60*1000;const data=`${eventId}.${exp}`;const sig=crypto.createHmac('sha256',secret()).update(data).digest('base64url');return `${data}.${sig}`}
export function verifyAccessToken(token:string,eventId:string){const [id,exp,sig]=token.split('.');if(id!==eventId||Number(exp)<Date.now())return false;const expect=crypto.createHmac('sha256',secret()).update(`${id}.${exp}`).digest('base64url');return sig.length===expect.length&&crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expect))}
export async function hasGalleryAccess(eventId:string,passwordProtected:boolean){if(!passwordProtected)return true;const token=(await cookies()).get(`gallery_access_${eventId}`)?.value;return !!token&&verifyAccessToken(token,eventId)}

import "server-only";
const cookieName="casecraft_demo_user";
export function requestIdentity(request:Request){
 const match=request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${cookieName}=([a-f0-9-]{36})(?:;|$)`));
 if(match)return {id:match[1],setCookie:null};
 const id=crypto.randomUUID();return {id,setCookie:`${cookieName}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${process.env.NODE_ENV==="production"?"; Secure":""}`};
}
export function attachIdentity(response:Response,identity:ReturnType<typeof requestIdentity>){if(identity.setCookie)response.headers.append("set-cookie",identity.setCookie);return response}
export function assertMutationRequest(request:Request){
 const length=Number(request.headers.get("content-length")??0);if(length>16_384)throw new Error("Request body is too large");
 const origin=request.headers.get("origin");if(origin&&new URL(origin).host!==new URL(request.url).host)throw new Error("Cross-origin mutation rejected");
}

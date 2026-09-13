import "server-only";
import { FrozenCaseSession } from "./case-engine";

// Credential-free demo adapter. Production replaces this module with the
// CaseSession repository backed by the schema in prisma/schema.prisma.
type OwnedSession={ownerId:string;session:FrozenCaseSession};
const globalStore=globalThis as typeof globalThis&{__caseCraftSessions?:Map<string,OwnedSession>};
const sessions=globalStore.__caseCraftSessions??new Map<string,OwnedSession>();
if(process.env.NODE_ENV!=="production")globalStore.__caseCraftSessions=sessions;

export function saveCaseSession(ownerId:string,session:FrozenCaseSession){sessions.set(session.id,{ownerId,session});return session}
export function readCaseSession(ownerId:string,id:string){const owned=sessions.get(id);return owned?.ownerId===ownerId?owned.session:undefined}
export function deleteCaseSession(id:string){sessions.delete(id)}

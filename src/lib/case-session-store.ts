import "server-only";
import { FrozenCaseSession } from "./case-engine";

// Credential-free demo adapter. Production replaces this module with the
// CaseSession repository backed by the schema in prisma/schema.prisma.
const globalStore=globalThis as typeof globalThis&{__caseCraftSessions?:Map<string,FrozenCaseSession>};
const sessions=globalStore.__caseCraftSessions??new Map<string,FrozenCaseSession>();
if(process.env.NODE_ENV!=="production")globalStore.__caseCraftSessions=sessions;

export function saveCaseSession(session:FrozenCaseSession){sessions.set(session.id,session);return session}
export function readCaseSession(id:string){return sessions.get(id)}
export function deleteCaseSession(id:string){sessions.delete(id)}

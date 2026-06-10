// Resolve a guest identity that is SIGNED wherever possible, so the
// sign-up migrate can later prove possession of the guest id rather than
// merely knowing it (spec/04 — guest ids leak via DTOs / presence, so
// "knows the id" must not be enough to claim its data).
//
// States handled:
//   - Already signed ({id, sig} both stored): use it, no network.
//   - Legacy unsigned id (or no id): mint a server-signed id. If the
//     worker actually signs (GUEST_ID_HMAC_SECRET set) AND there was an
//     existing id with data, migrate that data onto the new signed id
//     first, then adopt it. If the migrate fails, keep the old id and
//     retry next load rather than orphaning data.
//   - Offline / mint fails / worker signing disabled: fall back to a
//     local unsigned id — today's behaviour. The guest still works; they
//     just can't prove possession until a later online bootstrap signs
//     them (the migrate then refuses, which is the safe failure).

import {
  ensureGuestSelfId,
  getGuestSelfId,
  getGuestSelfSig,
  setGuestIdentity,
} from './local-identity';
import { apiMintGuestId, apiUpgradeGuestId } from './api/self';
import { track } from './telemetry';

export async function ensureSignedGuestIdentity(): Promise<{ id: string; sig: string | null }> {
  const existingId = getGuestSelfId();
  const existingSig = getGuestSelfSig();
  if (existingId && existingSig) return { id: existingId, sig: existingSig };
  // No id at all → this browser has never had a participant: the
  // daily new-visitors signal (spec/22). Emitted per adopted branch
  // below rather than up here so the offline fallback doesn't double
  // count (ensureGuestSelfId fires its own event when IT mints).
  const isNewVisitor = !existingId;

  const minted = await apiMintGuestId();
  if (!minted) {
    // Offline / error: keep any existing id, else mint a local UUID.
    return { id: existingId ?? ensureGuestSelfId(), sig: null };
  }
  if (!minted.ownerSig) {
    // Worker signing disabled: keep an existing id (don't churn it), else
    // adopt the freshly generated (unsigned) one.
    const id = existingId ?? minted.ownerId;
    setGuestIdentity(id, null);
    if (isNewVisitor) track('Participant', 'Created');
    return { id, sig: null };
  }
  // Worker returned a SIGNED id. Upgrade legacy data onto it if needed.
  if (existingId && existingId !== minted.ownerId) {
    const upgraded = await apiUpgradeGuestId(existingId, minted.ownerId, minted.ownerSig);
    if (!upgraded) {
      // Couldn't move the old data — keep using the old (unsigned) id so
      // nothing is orphaned; a later load retries the upgrade.
      return { id: existingId, sig: existingSig };
    }
  }
  setGuestIdentity(minted.ownerId, minted.ownerSig);
  if (isNewVisitor) track('Participant', 'Created');
  return { id: minted.ownerId, sig: minted.ownerSig };
}

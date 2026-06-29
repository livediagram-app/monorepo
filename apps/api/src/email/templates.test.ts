import { describe, expect, it } from 'vitest';
import type { Env } from '../types';
import {
  accountDeletedEmail,
  teamInviteEmail,
  week1Email,
  week2Email,
  welcomeEmail,
} from './templates';

const env = { APP_BASE_URL: 'https://app.test' } as unknown as Env;

describe('email templates', () => {
  it('welcome has a subject + links to /new', () => {
    const e = welcomeEmail(env);
    expect(e.subject).toMatch(/welcome/i);
    expect(e.html).toContain('https://app.test/new');
  });

  it('week 1 links to the explorer', () =>
    expect(week1Email(env).html).toContain('https://app.test/explorer'));

  it('week 2 links to teams', () =>
    expect(week2Email(env).html).toContain('https://app.test/explorer/team'));

  it('team invite links to the invites page + names the team', () => {
    const e = teamInviteEmail(env, 'Acme');
    expect(e.html).toContain('https://app.test/explorer/invites');
    expect(e.html).toContain('Acme');
    expect(e.subject).toContain('Acme');
  });

  it('account-deleted confirms the deletion', () =>
    expect(accountDeletedEmail(env).subject).toMatch(/deleted/i));

  it('escapes a malicious team name (no raw markup in the body)', () => {
    const e = teamInviteEmail(env, '<script>alert(1)</script>');
    expect(e.html).not.toContain('<script>');
    expect(e.html).toContain('&lt;script&gt;');
  });

  it('falls back gracefully on a null team name', () =>
    expect(teamInviteEmail(env, null).html).toContain('a team'));
});

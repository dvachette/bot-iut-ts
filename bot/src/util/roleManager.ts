import type { Guild, GuildMember, Role } from 'discord.js';
import { evaluateSelector, parseSelector, type SelectorNode } from './roleParser';

export class UnknownRoleError extends Error {
    public readonly roleId: string;

    public constructor(roleId: string) {
        super(`Rôle inconnu ou supprimé : ${roleId}`);
        this.name = 'UnknownRoleError';
        this.roleId = roleId;
    }
}

export type RoleAction = 'add' | 'remove';

export interface RoleUpdateFailure {
    readonly memberId: string;
    readonly memberUsername: string;
    readonly reason: string;
}

export interface ApplySelectorResult {
    readonly matchedCount: number;
    readonly succeededCount: number;
    readonly failures: readonly RoleUpdateFailure[];
}

function collectRoleIds(node: SelectorNode, acc: Set<string>): void {
    switch (node.kind) {
        case 'role':
            acc.add(node.roleId);
            return;
        case 'not':
            collectRoleIds(node.child, acc);
            return;
        case 'and':
        case 'or':
            collectRoleIds(node.left, acc);
            collectRoleIds(node.right, acc);
            return;
    }
}

function assertRolesExist(guild: Guild, node: SelectorNode): void {
    const roleIds = new Set<string>();
    collectRoleIds(node, roleIds);

    for (const roleId of roleIds) {
        if (!guild.roles.cache.has(roleId)) {
            throw new UnknownRoleError(roleId);
        }
    }
}

function extractReason(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

async function applyToMember(
    member: GuildMember,
    action: RoleAction,
    targetRole: Role,
): Promise<{ readonly ok: true } | { readonly ok: false; readonly reason: string }> {
    try {
        if (action === 'add') {
            await member.roles.add(targetRole);
        } else {
            await member.roles.remove(targetRole);
        }
        return { ok: true };
    } catch (error) {
        return { ok: false, reason: extractReason(error) };
    }
}

export async function applyRoleSelector(
    guild: Guild,
    action: RoleAction,
    targetRole: Role,
    selectorInput: string,
): Promise<ApplySelectorResult> {
    const ast = parseSelector(selectorInput);
    assertRolesExist(guild, ast);

    const members = await guild.members.fetch();

    const matched: GuildMember[] = [];
    for (const member of members.values()) {
        const memberRoleIds = new Set(member.roles.cache.keys());
        if (evaluateSelector(ast, memberRoleIds)) {
            matched.push(member);
        }
    }

    const toProcess = matched.filter((member) => {
        const alreadyHasRole = member.roles.cache.has(targetRole.id);
        return action === 'add' ? !alreadyHasRole : alreadyHasRole;
    });

    let succeededCount = 0;
    const pendingRetry: GuildMember[] = [];

    for (const member of toProcess) {
        const result = await applyToMember(member, action, targetRole);
        if (result.ok) {
            succeededCount += 1;
        } else {
            pendingRetry.push(member);
        }
    }

    const finalFailures: RoleUpdateFailure[] = [];

    for (const member of pendingRetry) {
        const result = await applyToMember(member, action, targetRole);
        if (result.ok) {
            succeededCount += 1;
        } else {
            finalFailures.push({
                memberId: member.id,
                memberUsername: member.user.username,
                reason: result.reason,
            });
        }
    }

    return {
        matchedCount: matched.length,
        succeededCount,
        failures: finalFailures,
    };
}
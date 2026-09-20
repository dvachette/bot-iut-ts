export type SelectorNode =
    | { readonly kind: 'role'; readonly roleId: string }
    | { readonly kind: 'not'; readonly child: SelectorNode }
    | { readonly kind: 'and'; readonly left: SelectorNode; readonly right: SelectorNode }
    | { readonly kind: 'or'; readonly left: SelectorNode; readonly right: SelectorNode };

export class SelectorSyntaxError extends Error {
    public readonly position: number;

    public constructor(message: string, position: number) {
        super(`${message} (position ${position})`);
        this.name = 'SelectorSyntaxError';
        this.position = position;
    }
}

interface Token {
    readonly type: 'ROLE' | 'AND' | 'OR' | 'NOT' | 'LPAREN' | 'RPAREN';
    readonly value: string;
    readonly position: number;
}

const ROLE_MENTION_PATTERN = /^<@&(\d+)>/;

function tokenize(input: string): readonly Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < input.length) {
        const char = input[i];

        if (char === ' ' || char === '\t' || char === '\n') {
            i += 1;
            continue;
        }
        if (char === '(') {
            tokens.push({ type: 'LPAREN', value: '(', position: i });
            i += 1;
            continue;
        }
        if (char === ')') {
            tokens.push({ type: 'RPAREN', value: ')', position: i });
            i += 1;
            continue;
        }
        if (char === '!') {
            tokens.push({ type: 'NOT', value: '!', position: i });
            i += 1;
            continue;
        }
        if (char === '&' && input[i + 1] === '&') {
            tokens.push({ type: 'AND', value: '&&', position: i });
            i += 2;
            continue;
        }
        if (char === '|' && input[i + 1] === '|') {
            tokens.push({ type: 'OR', value: '||', position: i });
            i += 2;
            continue;
        }

        const roleMatch = ROLE_MENTION_PATTERN.exec(input.slice(i));
        if (roleMatch !== null) {
            tokens.push({ type: 'ROLE', value: roleMatch[1], position: i });
            i += roleMatch[0].length;
            continue;
        }

        throw new SelectorSyntaxError(`Caractère inattendu '${char}'`, i);
    }

    return tokens;
}

class SelectorParser {
    private readonly tokens: readonly Token[];
    private cursor: number;

    public constructor(tokens: readonly Token[]) {
        this.tokens = tokens;
        this.cursor = 0;
    }

    public parse(): SelectorNode {
        const node = this.parseOr();
        if (this.cursor < this.tokens.length) {
            const token = this.tokens[this.cursor];
            throw new SelectorSyntaxError(`Token inattendu '${token.value}'`, token.position);
        }
        return node;
    }

    private parseOr(): SelectorNode {
        let left = this.parseAnd();
        while (this.check('OR')) {
            this.cursor += 1;
            const right = this.parseAnd();
            left = { kind: 'or', left, right };
        }
        return left;
    }

    private parseAnd(): SelectorNode {
        let left = this.parseUnary();
        while (this.check('AND')) {
            this.cursor += 1;
            const right = this.parseUnary();
            left = { kind: 'and', left, right };
        }
        return left;
    }

    private parseUnary(): SelectorNode {
        if (this.check('NOT')) {
            this.cursor += 1;
            const child = this.parseUnary();
            return { kind: 'not', child };
        }
        return this.parsePrimary();
    }

    private parsePrimary(): SelectorNode {
        const token = this.peek();
        if (token === undefined) {
            throw new SelectorSyntaxError('Fin de expression inattendue', this.endPosition());
        }

        if (token.type === 'ROLE') {
            this.cursor += 1;
            return { kind: 'role', roleId: token.value };
        }

        if (token.type === 'LPAREN') {
            this.cursor += 1;
            const node = this.parseOr();
            if (!this.check('RPAREN')) {
                throw new SelectorSyntaxError('Parenthèse fermante attendue', this.peek()?.position ?? this.endPosition());
            }
            this.cursor += 1;
            return node;
        }

        throw new SelectorSyntaxError(`Token inattendu '${token.value}'`, token.position);
    }

    private check(type: Token['type']): boolean {
        return this.peek()?.type === type;
    }

    private peek(): Token | undefined {
        return this.tokens[this.cursor];
    }

    private endPosition(): number {
        const last = this.tokens[this.tokens.length - 1];
        return last === undefined ? 0 : last.position + last.value.length;
    }
}

export function parseSelector(input: string): SelectorNode {
    const tokens = tokenize(input);
    if (tokens.length === 0) {
        throw new SelectorSyntaxError('Expression vide', 0);
    }
    return new SelectorParser(tokens).parse();
}

export function evaluateSelector(node: SelectorNode, memberRoleIds: ReadonlySet<string>): boolean {
    switch (node.kind) {
        case 'role':
            return memberRoleIds.has(node.roleId);
        case 'not':
            return !evaluateSelector(node.child, memberRoleIds);
        case 'and':
            return evaluateSelector(node.left, memberRoleIds) && evaluateSelector(node.right, memberRoleIds);
        case 'or':
            return evaluateSelector(node.left, memberRoleIds) || evaluateSelector(node.right, memberRoleIds);
    }
}
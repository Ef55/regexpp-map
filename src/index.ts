import { AST } from "@eslint-community/regexpp"

/**
 * The visitor to map an AST.
 */
export class RegExpMapper<T, U> {
    private readonly _handlers: RegExpMapper.Mappers<T, U>

    /**
     * Initialize this visitor.
     * @param handlers Callbacks for each node.
     */
    public constructor(handlers: RegExpMapper.Mappers<T, U>) {
        this._handlers = handlers
    }

    /**
     * Visit a given node and descendant nodes.
     * @param node The root node to visit tree.
     */
    // eslint-disable-next-line complexity
    public visit(node: AST.Node): T {
        switch (node.type) {
            case "Alternative":
                return this.visitAlternative(node);
            case "Assertion":
                return this.visitAssertion(node);
            case "Backreference":
                return this.visitBackreference(node);
            case "CapturingGroup":
                return this.visitCapturingGroup(node);
            case "Character":
                return this.visitCharacter(node);
            case "CharacterClass":
                return this.visitCharacterClass(node);
            case "CharacterClassRange":
                return this.visitCharacterClassRange(node);
            case "CharacterSet":
                return this.visitCharacterSet(node);
            case "ClassIntersection":
                return this.visitClassIntersection(node);
            case "ClassStringDisjunction":
                return this.visitClassStringDisjunction(node);
            case "ClassSubtraction":
                return this.visitClassSubtraction(node);
            case "ExpressionCharacterClass":
                return this.visitExpressionCharacterClass(node);
            case "Group":
                return this.visitGroup(node);
            case "Pattern":
                return this.visitPattern(node);
            case "Quantifier":
                return this.visitQuantifier(node);
            case "RegExpLiteral":
                return this.visitRegExpLiteral(node);
            case "StringAlternative":
                return this.visitStringAlternative(node);
            default:
                throw new Error(
                    `Unknown type: ${(node as Pick<AST.Node, "type">).type}`,
                )
        }
    }

    private visitRange(node: AST.ClassRangesCharacterClassElement): U {
        switch (node.type) {
            case "Character":
                return this.visitClassCharacter(node);
            case "CharacterClassRange":
                return this.visitClassCharacterClassRange(node);
            case "CharacterSet":
                return this.visitClassCharacterSet(node);
        }
    }

    private visitSet(node: AST.UnicodeSetsCharacterClassElement): U {
        switch (node.type) {
            case "Character":
                return this.visitClassCharacter(node);
            case "CharacterClassRange":
                return this.visitClassCharacterClassRange(node);
            case "CharacterSet":
                return this.visitClassCharacterSet(node);
            // case "CharacterClass":
            //     return this.visitClassCharacterClass(node);
            // case "ClassStringDisjunction":
            //     return this.visitClassClassStringDisjunction(node);
            // case "ExpressionCharacterClass":
            //     return this.visitClassExpressionCharacterClass(node);
            default:
                throw new Error(
                    `Unicode sets (v flag) not yet supported: ${(node as Pick<AST.Node, "type">).type}`,
                )
}
    }

    // Regexes

    private visitAlternative(node: AST.Alternative): T {
        let elements = node.elements.map(alternative => this.visit(alternative))
        return this._handlers.onAlternative(node, elements);
    }

    private visitAssertion(node: AST.Assertion): T {
        if (node.kind === "lookahead" || node.kind === "lookbehind") {
            let alternatives = node.alternatives.map(alternative => this.visit(alternative))
            return this._handlers.onLookaroundAssertion(node, alternatives);
        }
        else {
            return this._handlers.onBoundaryAssertion(node);
        }
    }

    private visitBackreference(node: AST.Backreference): T {
        return this._handlers.onBackreference(node);
    }

    private visitCapturingGroup(node: AST.CapturingGroup): T {
        let alternatives = node.alternatives.map(alternative => this.visit(alternative))
        return this._handlers.onCapturingGroup(node, alternatives);
    }

    private visitCharacter(node: AST.Character): T {
        return this._handlers.onCharacter(node);
    }

    private visitCharacterClass(node: AST.CharacterClass): T {
        if (node.unicodeSets) {
            let elements = node.elements.map(element => this.visitSet(element))
            return this._handlers.onCharacterClass(node, elements);
        }
        else {
            let elements = node.elements.map(element => this.visitRange(element))
            return this._handlers.onCharacterClass(node, elements);
        }
    }

    private visitCharacterClassRange(node: AST.CharacterClassRange): T {
        let min = this.visit(node.min);
        let max = this.visit(node.max);
        return this._handlers.onCharacterClassRange(node, min, max);
    }

    private visitCharacterSet(node: AST.CharacterSet): T {
        return this._handlers.onCharacterSet(node);
    }

    private visitClassIntersection(node: AST.ClassIntersection): T {
        let l = this.visit(node.left);
        let r = this.visit(node.right);
        return this._handlers.onClassIntersection(node, l , r);
    }

    private visitClassStringDisjunction(node: AST.ClassStringDisjunction): T {
        let alternatives = node.alternatives.map(alternative => this.visitStringAlternative(alternative))
        return this._handlers.onClassStringDisjunction(node, alternatives);
    }

    private visitClassSubtraction(node: AST.ClassSubtraction): T {
        let l = this.visit(node.left);
        let r = this.visit(node.right);
        return this._handlers.onClassSubtraction(node, l , r);
    }

    private visitExpressionCharacterClass(node: AST.ExpressionCharacterClass): T {
        return this._handlers.onExpressionCharacterClass(node, this.visit(node.expression));
    }

    private visitGroup(node: AST.Group): T {
        let alternatives = node.alternatives.map(alternative => this.visitAlternative(alternative))
        return this._handlers.onGroup(node, alternatives);
    }

    private visitPattern(node: AST.Pattern): T {
        let alternatives = node.alternatives.map(alternative => this.visitAlternative(alternative))
        return this._handlers.onPattern(node, alternatives);
    }

    private visitQuantifier(node: AST.Quantifier): T {
        return this._handlers.onQuantifier(node, this.visit(node.element));
    }

    private visitRegExpLiteral(node: AST.RegExpLiteral): T {
        let pattern = this.visitPattern(node.pattern);
        return this._handlers.onRegExpLiteral(node, pattern);
    }

    private visitStringAlternative(node: AST.StringAlternative): T {
        let elements = node.elements.map(element => this.visitCharacter(element));
        return this._handlers.onStringAlternative(node, elements);
    }

    // Character classes

    private visitClassCharacter(node: AST.Character): U {
        return this._handlers.onRangeCharacter(node);
    }

    private visitClassCharacterClassRange(node: AST.CharacterClassRange): U {
        return this._handlers.onRangeCharacterClassRange(node);
    }

    private visitClassCharacterSet(node: AST.CharacterSet): U {
        return this._handlers.onRangeCharacterSet(node);
    }

    // private visitClassCharacterClass(node: AST.UnicodeSetsCharacterClass): U {
    //     let element = node.elements.map(element => this.visitSet(element));
    //     return this._handlers.onClassCharacterClass(node, elements);
    // }

    // private visitClassClassStringDisjunction(node: AST.ClassStringDisjunction): U {
    //     let elements = node.elements.map(element => this.visitCharacter(element));
    //     return this._handlers.onStringAlternative(node, elements);
    // }

    // private visitClassExpressionCharacterClass(node: AST.ExpressionCharacterClass): U {
        
    // }
}

export namespace RegExpMapper {
    export interface Mappers<T, U> {
        onAlternative: (node: AST.Alternative, elements: T[]) => T
        onBoundaryAssertion: (node: AST.BoundaryAssertion) => T
        onLookaroundAssertion: (node: AST.LookaroundAssertion, elements: T[]) => T
        onBackreference: (node: AST.Backreference) => T
        onCapturingGroup: (node: AST.CapturingGroup, alternatives: T[]) => T
        onCharacter: (node: AST.Character) => T
        onCharacterClass: (node: AST.CharacterClass, elements: U[]) => T
        onCharacterClassRange: (node: AST.CharacterClassRange, min: T, max: T) => T
        onCharacterSet: (node: AST.CharacterSet) => T
        onClassIntersection: (node: AST.ClassIntersection, l: T, r: T) => T
        onClassStringDisjunction: (node: AST.ClassStringDisjunction, alternatives: T[]) => T
        onClassSubtraction: (node: AST.ClassSubtraction, l: T, r: T) => T
        onExpressionCharacterClass: (node: AST.ExpressionCharacterClass, inner: T) => T
        onGroup: (node: AST.Group, alternatives: T[]) => T
        onPattern: (node: AST.Pattern, alternatives: T[]) => T
        onQuantifier: (node: AST.Quantifier, inner: T) => T
        onRegExpLiteral: (node: AST.RegExpLiteral, pattern: T) => T
        onStringAlternative: (node: AST.StringAlternative, elements: T[]) => T

        onRangeCharacter: (node: AST.Character) => U
        onRangeCharacterClassRange: (node: AST.CharacterClassRange) => U
        onRangeCharacterSet: (node: AST.CharacterSet) => U
    }

    export function map<T, U> (
        r: AST.Node,
        onAlternative: (node: AST.Alternative, elements: T[]) => T,
        onBoundaryAssertion: (node: AST.BoundaryAssertion) => T,
        onLookaroundAssertion: (node: AST.LookaroundAssertion, elements: T[]) => T,
        onBackreference: (node: AST.Backreference) => T,
        onCapturingGroup: (node: AST.CapturingGroup, alternatives: T[]) => T,
        onCharacter: (node: AST.Character) => T,
        onCharacterClass: (node: AST.CharacterClass, elements: U[]) => T,
        onCharacterClassRange: (node: AST.CharacterClassRange, min: T, max: T) => T,
        onCharacterSet: (node: AST.CharacterSet) => T,
        onClassIntersection: (node: AST.ClassIntersection, l: T, r: T) => T,
        onClassStringDisjunction: (node: AST.ClassStringDisjunction, alternatives: T[]) => T,
        onClassSubtraction: (node: AST.ClassSubtraction, l: T, r: T) => T,
        onExpressionCharacterClass: (node: AST.ExpressionCharacterClass, inner: T) => T,
        onGroup: (node: AST.Group, alternatives: T[]) => T,
        onPattern: (node: AST.Pattern, alternatives: T[]) => T,
        onQuantifier: (node: AST.Quantifier, inner: T) => T,
        onRegExpLiteral: (node: AST.RegExpLiteral, pattern: T) => T,
        onStringAlternative: (node: AST.StringAlternative, elements: T[]) => T,

        onRangeCharacter: (node: AST.Character) => U,
        onRangeCharacterClassRange: (node: AST.CharacterClassRange) => U,
        onRangeCharacterSet: (node: AST.CharacterSet) => U,
    ): T {
        return new RegExpMapper({
            onAlternative,
            onBoundaryAssertion,
            onLookaroundAssertion,
            onBackreference,
            onCapturingGroup,
            onCharacter,
            onCharacterClass,
            onCharacterClassRange,
            onCharacterSet,
            onClassIntersection,
            onClassStringDisjunction,
            onClassSubtraction,
            onExpressionCharacterClass,
            onGroup,
            onPattern,
            onQuantifier,
            onRegExpLiteral,
            onStringAlternative,
            onRangeCharacter,
            onRangeCharacterClassRange,
            onRangeCharacterSet,
        }).visit(r);
    }
}

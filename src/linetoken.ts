import * as vscode from 'vscode';

// Symbol Types
export enum Symbol {
    function = "function",
    class = "class",
    if = "if",
    else = "else",
    elif = "elif",
    for = "for",
    while = "while",
    try = "try",
    except = "except",
    with = "with",
    indent = "INDENT", // indent token, default if not EOF, only contains indent information
    eof = "EOF"
}

// LineToken represents a line in a Python file
//
// Each line at it's core is a Symbol type, and an indentation level.
// The Symbol types are the high-level constructs in Python (function/class
// definitions, for/while loops, if/else), as defined above. Additionally
// there is the 'INDENT' type, which represents a non-empty, non-whitespace
// line. These are lines which do not contain a a construct token, but are
// significant for indentation, and so must be kept track of.
export class LineToken {

    constructor(
        public readonly type: Symbol,
        public readonly linenr: number,
        public readonly indentLevel: number,
        public readonly attr?: any // Any additional things a token might need (class name, control conidition)
    ) { }

    toString(): string {
        return this.type + ", linenr:" + (this.linenr+1) + ", indentLevel: " + this.indentLevel + ", attr: " + this.attr;
    }
}
// Token constants
const EOFTOKEN = new LineToken(Symbol.eof, -1, -1);
export { EOFTOKEN };
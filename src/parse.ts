import * as vscode from 'vscode';
import { EOFTOKEN, LineToken, Symbol } from './linetoken';
import { Lexer } from './lex';
import { Node } from './node';

export class Parser {
    private lexer: Lexer;
    private root: Node; // Root of syntax tree

    constructor (text: string | undefined) {
        this.lexer = new Lexer(text);
        this.root = new Node("root", vscode.TreeItemCollapsibleState.None);
    }

    // Public facing _parse, always starts from the bottom
    parse(): Node[] {
        this.root.adopt(this._parse());
        if (this.root.children() === undefined) {
            return [];
        }
        this.root = this.root.prune();
        return this.root.children()!;
    }

    // Returns the next indented block
    // as a tree of significant tokens
    private _parse(indentLevel: number = 0): Node[] {
        let ret: Node[] = [];

        let token: LineToken = this.lexer.currToken();
        while (token !== EOFTOKEN) {
            if (token.indentLevel < indentLevel) {
                // 2 because after returning token will be advanced again
                this.lexer.retract(2);
                return ret;
            }

            if (token.type !== Symbol.indent) {
                // parse new block
                let blockRoot: Node = new Node(token.type + (token.attr === undefined ? "" : " " + token.attr), vscode.TreeItemCollapsibleState.Collapsed, token);
                token = this.lexer.next();
                blockRoot.adopt(this._parse(indentLevel+1)); // recursively parse all descendants
                ret.push(blockRoot);

            }
            token = this.lexer.next();
        }
        return ret;
    }
}
import * as vscode from 'vscode';
import { EOFTOKEN, LineToken, Symbol } from './linetoken';
import { Lexer } from './lex';
import { LexNode } from './lexNode';

export class Parser {
  private lexer: Lexer;
  private root: LexNode; // Root of syntax tree

  constructor (text?: string, tabFmt?: {size?: number, hard?: boolean}) {
    this.lexer = new Lexer(text, tabFmt);
    this.root = new LexNode("root", vscode.TreeItemCollapsibleState.None, undefined, undefined, null);
  }

  // Public facing _parse, always starts from the bottom
  parse(): LexNode[] {
    this.root.adopt(this._parse(0, this.root));
    this.root = this.root.prune();

    if (this.root.children() === undefined ) {
      return [];
    } else {
      return this.root.children()!;
    }
  }

  // Returns the next indented block
  // as a tree of significant tokens
  private _parse(indentLevel: number = 0, parent?: LexNode): LexNode[] {
    let ret: LexNode[] = [];

    let token: LineToken = this.lexer.currToken();
    while (token !== EOFTOKEN) {
      if (token.indentLevel < indentLevel) {
        // 2 because after returning token will be advanced again
        this.lexer.retract(2);
        return ret;
      }

      if (token.type !== Symbol.indent) {
        // parse new block
        let blockRoot: LexNode = new LexNode(token.type + (token.attr === undefined ? "" : " " + token.attr), vscode.TreeItemCollapsibleState.Collapsed, token, undefined, parent);
        token = this.lexer.next();
        blockRoot.adopt(this._parse(indentLevel+1, blockRoot)); // recursively parse all descendants
        ret.push(blockRoot);
      }
      token = this.lexer.next();
    }
    return ret;
  }
}
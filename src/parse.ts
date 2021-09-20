import * as vscode from 'vscode';
import { EOFTOKEN, LineToken, Symbol } from './linetoken';
import { Lexer } from './lex';
import { LexNode } from './lexNode';

export class Parser {
  private lexer: Lexer;
  private root: LexNode; // Root of syntax tree

  constructor (private text?: string, private tabFmt?: {size?: number, hard?: boolean}) {}

  // Public facing _parse, always starts from the bottom
  parse(text?: string, tabFmt?: {size?: number, hard?: boolean}): LexNode[] {
    if (text === undefined) {
      // default to this.text
      // this might still be undefined
      text = this.text;
    } else {
      // save text
      this.text = text;
    }

    if (tabFmt === undefined) {
      // default to this.tabFmt
      // this might still be undefined
      tabFmt = this.tabFmt;
    } else {
      // save tabFmt
      this.tabFmt = tabFmt;
    }

    this.lexer = new Lexer(this.text, this.tabFmt);
    this.root = new LexNode("root", vscode.TreeItemCollapsibleState.None, undefined, undefined, null);

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

  // Returns an array of LexNodes, representing the path
  // between the LexNode that contains the specified line number
  // and the root of the tree.
  context(lineNumber: number): LexNode[] {
    if (!this.root.hasChildren()) {
      return [];
    }

    let find = (root: LexNode): LexNode | undefined => {
      let prevChild: LexNode;
      for (var child of root.children()!) {
        if (lineNumber < child.token!.linenr) {
          if (prevChild!.hasChildren()) {
            return find(prevChild!);
          } else {
            return prevChild!;
          }
        } else {
          prevChild = child;
        }
      }
    };

    let target = find(this.root);
    return target!.rootPath();
  }
}

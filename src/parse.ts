import * as vscode from 'vscode';
import { EOFTOKEN, LineToken, Symbol } from './linetoken';
import { Lexer } from './lex';
import { LexNode } from './lexNode';

export class Parser {
  private lexer: Lexer;
  private currIndent: number;
  private root: LexNode; // Root of syntax tree

  constructor (private text?: string, private tabFmt?: {size?: number, hard?: boolean}) {}

  // Public facing _parse, always starts from the bottom
  parse(text?: string, tabFmt?: {size?: number, hard?: boolean}): LexNode {
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

    this.currIndent = 0;
    this.root.adopt(this._parse(this.root));
    return this.root.prune();
  }

  // Returns the next indented block
  // as a tree of significant tokens
  private _parse(parent?: LexNode): LexNode[] {
    let ret: LexNode[] = [];

    while (this.lexer.currToken() !== EOFTOKEN) {
      if (this.lexer.currToken().indentLevel < this.currIndent) {
        // End of indented block
        //
        // Unravel recursion until indentation is equal
        this.currIndent--;
        if (this.currIndent > this.lexer.currToken().indentLevel) {
          this.lexer.retract(); // re-read this token, need to to higher in tree
        }
        return ret;
      }

      if (this.lexer.currToken().type === Symbol.indent) {
        this.lexer.next();
        continue;
      }

      // parse new block
      let blockRoot: LexNode = new LexNode(this.lexer.currToken().type + (this.lexer.currToken().attr === undefined ? "" : " " + this.lexer.currToken().attr),
                                           vscode.TreeItemCollapsibleState.Collapsed, this.lexer.currToken(), undefined, parent);
      this.lexer.next();
      this.currIndent++;
      blockRoot.adopt(this._parse(blockRoot)); // recursively parse all descendants
      ret.push(blockRoot);
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

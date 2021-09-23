import { notDeepStrictEqual } from 'assert';
import * as vscode from 'vscode';

import { LexNode } from './lexNode';
import { Parser } from './parse';

export class LexNodeProvider implements vscode.TreeDataProvider<LexNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<LexNode | undefined | void> = new vscode.EventEmitter<LexNode | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<LexNode | undefined | void> = this._onDidChangeTreeData.event;

  private parser: Parser;
  private document: LexNode; // All top-level constructs (indent 0) will be children of this object

  constructor (private text?: string) {
    this.parser = new Parser();
    this.refresh(this.text);
  }

  // Change the text to parse, then reset and re-parse
  private reset(text: string, tabFmt?: { size?: number, hard?: boolean }, documentLabel: string = "root") {
    this.document = this.parser.parse(text, tabFmt); // Construct parse tree with document as root

    let expand = (node: LexNode): LexNode => {
      let newChildren: LexNode[] | undefined;
      if (node.hasChildren()) {
        // Expand all children
        newChildren = node.children()!.map((node) => {
          return expand(node);
        });
        return new LexNode(node.label, vscode.TreeItemCollapsibleState.Expanded, node.token, newChildren, node.parent());
      } else {
        return node;
      }
    };
    this.document = expand(this.document);
  }

  refresh(text?: string, tabFmt?: { size?: any, hard?: any}): void {
    if (text === undefined ) {
      if (vscode.window.activeTextEditor === undefined) {
        vscode.window.showErrorMessage('No text provided and no active text editor');
        return;
      }

      // Use current active editor by default
      text = vscode.window.activeTextEditor.document.getText();

      if (tabFmt === undefined) {
        // Get tab settings
        //
        // Types are 'any' because tabSize and insertSpaces will
        // always return the right type when getting options from
        // an editor (size: number, hard: boolean)
        tabFmt = {
          size: vscode.window.activeTextEditor.options.tabSize,
          hard: !vscode.window.activeTextEditor.options.insertSpaces
        };
      }
    }

    this.text = text;
    this.reset(text, tabFmt);
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(node: LexNode): vscode.TreeItem {
    return node;
  }

  // Returns top level children if node is specified,
  // otherwise returns children of node
  getChildren(node?: LexNode) {
    if (node !== undefined) {
      return Promise.resolve(node.children());
    }

    return Promise.resolve([this.document]);
  }
}
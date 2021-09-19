import * as vscode from 'vscode';

import { LineToken } from './linetoken';
import { Parser } from './parse';

export class LexNodeProvider implements vscode.TreeDataProvider<Node> {
  private _onDidChangeTreeData: vscode.EventEmitter<Node | undefined | void> = new vscode.EventEmitter<Node | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<Node | undefined | void> = this._onDidChangeTreeData.event;

  private parser: Parser;
  private document: Node; // All top-level constructs (indent 0) will be children of this object

  constructor (private text?: string) {
    if (this.text === undefined ) {
      // Use current active editor by default
      this.text = vscode.window.activeTextEditor?.document.getText();
    }

    if (this.text !== undefined) {
      this.reset(this.text);
    } else {
      vscode.window.showErrorMessage('No text provided and no active text editor');
    }
  }

  // Change the text to parse, then reset and re-parse
  private reset(text: string, documentLabel: string = "root") {
    this.parser = new Parser(text);
    this.document = new Node(documentLabel, vscode.TreeItemCollapsibleState.None);
    this.document.adopt(this.parser.parse()); // Construct parse tree with document as root
  }

  refresh(text?: string): void {
    if (text === undefined) {
      // Use current editor if no text is provided
      this.text = vscode.window.activeTextEditor?.document.getText();
    } else {
      this.text = text;
    }

    if (this.text !== undefined ) {
      this.reset(this.text);
      this._onDidChangeTreeData.fire();
    } else {
      vscode.window.showErrorMessage('No text provided and no active text editor');
    }
  }

  getTreeItem(node: Node): vscode.TreeItem {
    return node;
  }

  // Returns top level children if node is specified,
  // otherwise returns children of node
  getChildren(node?: Node) {
    if (node !== undefined) {
      return Promise.resolve(node.children());
    }

    return Promise.resolve(this.document.children());
  }
}

// Tree node definition
export class Node extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly token?: LineToken,
    private _children?: Node[] | undefined,
    private _parent?: Node | undefined
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label;
    if (this.token && this.token.linenr >= 0) {
      this.tooltip += `: ${this.token.linenr+1}`;
    }
  }

  // Get this Node's children
  children(): Node[] | undefined {
    return this._children;
  }

  // Return whether or not this child has any children.
  hasChildren(): boolean {
    return this._children !== undefined && this._children.length > 0;
  }

  // Adopt one or more child nodes
  adopt(child: Node): void;
  adopt(child: Node[]): void;
  adopt(child: any): void {
    // Are there any other children?
    if (this._children === undefined) {
      // No....
      if (Array.isArray(child)) {
        this._children = child;
      } else {
        this._children = [child];
      }
    } else {
      // Yes...
      if (Array.isArray(child)) {
        this._children.concat(child);
      } else {
        this._children.push(child);
      }
    }
  }

  // Prune the leaves of this Node and all descendants.
  //
  // Does NOT edit in place, returns a copy of the current
  // node with all leaves pruned. Use as in:
  //
  //     node = node.prune()
  //
  prune(): Node {
    if (this.hasChildren()) {
      // Internal node
      for (var [index, _] of this._children!.entries()) {
        // Prune each child
        this._children![index] = this._children![index].prune();
      }
      return new Node(this.label, vscode.TreeItemCollapsibleState.Collapsed, this.token, this._children!);
    } else {
      // Leaf node, return copy with collapsible state none ("prune")
      return new Node(this.label, vscode.TreeItemCollapsibleState.None, this.token);
    }
  }
}
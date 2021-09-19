import * as vscode from 'vscode';

import { LineToken } from './linetoken';

// Tree node definition
export class LexNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly token?: LineToken,
    private _children?: LexNode[] | undefined,
    private _parent?: LexNode | undefined
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label;
    if (this.token && this.token.linenr >= 0) {
      this.tooltip += `: ${this.token.linenr+1}`;
    }
  }

  // Get this LexNode's children
  children(): LexNode[] | undefined {
    return this._children;
  }

  // Return whether or not this child has any children.
  hasChildren(): boolean {
    return this._children !== undefined && this._children.length > 0;
  }

  // Adopt one or more child nodes
  adopt(child: LexNode): void;
  adopt(child: LexNode[]): void;
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
        this._children = this._children.concat(child);
      } else {
        this._children.push(child);
      }
    }
  }

  // Prune the leaves of this LexNode and all descendants.
  //
  // Does NOT edit in place, returns a copy of the current
  // node with all leaves pruned. Use as in:
  //
  //     node = node.prune()
  //
  prune(): LexNode {
    if (this.hasChildren()) {
      // Internal node
      for (var [index, _] of this._children!.entries()) {
        // Prune each child
        this._children![index] = this._children![index].prune();
      }
      return new LexNode(this.label, vscode.TreeItemCollapsibleState.Collapsed, this.token, this._children!);
    } else {
      // Leaf node, return copy with collapsible state none ("prune")
      return new LexNode(this.label, vscode.TreeItemCollapsibleState.None, this.token);
    }
  }
}
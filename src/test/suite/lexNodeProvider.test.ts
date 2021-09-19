import * as assert from 'assert';
import * as vscode from 'vscode';
import { after } from 'mocha';

import { LineToken, Symbol } from '../../linetoken';
import { LexNode } from '../../lexNode';
import { LexNodeProvider } from '../../lexNodeProvider';

suite('LexNodeProvider Test Suite', () => {
  after(() => {
    vscode.window.showInformationMessage('All tests passed!');
  });

  test('refresh() from uninitialized', () => {
    let l: LexNodeProvider = new LexNodeProvider();

    let lines1: string[] = [
      'if u_like_cheese:',
      '    throw_party("Cheese Party", "9PM")',
    ];

    l.refresh(lines1.join('\n'));

    let reference: LexNode = new LexNode('if u_like_cheese',
      vscode.TreeItemCollapsibleState.None,
      new LineToken(Symbol.if, 0, 0, 'u_like_cheese')
    );

    assert.deepStrictEqual(l.getChildren(), Promise.resolve(reference));
  });

  test('refresh() from existing', () => {
    let lines1: string[] = [
      'if going_to_collide():',
      '    dont()'
    ];
    let l: LexNodeProvider = new LexNodeProvider(lines1.join('\n'));

    let lines2: string[] = [
      'if u_like_cheese:',
      '    throw_party("Cheese Party", "9PM")',
    ];
    let reference: LexNode = new LexNode('if u_like_cheese',
      vscode.TreeItemCollapsibleState.None,
      new LineToken(Symbol.if, 0, 0, 'u_like_cheese')
    );

    assert.deepStrictEqual(l.getChildren(), Promise.resolve(reference));
  });
});
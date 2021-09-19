import * as assert from 'assert';
import * as vscode from 'vscode';
import { after } from 'mocha';

import { LineToken, Symbol } from '../../linetoken';
import { LexNode } from '../../lexNode';

suite('LexNode Test Suite', () => {
  after(() => {
    vscode.window.showInformationMessage('All tests passed!');
  });

  test('children() of leaf', () => {
    let n: LexNode = new LexNode('leafLexNode', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.indent, 0, 0));
    assert.strictEqual(n.children(), undefined);
  });

  test('children() of internal node', () => {
    let children: LexNode[] = [
      new LexNode('leafLexNode1', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 2, 1)),
      new LexNode('leafLexNode2', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 3, 1)),
      new LexNode('leafLexNode3', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 4, 1)),
      new LexNode('leafLexNode4', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 5, 1)),
      new LexNode('leafLexNode5', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 6, 1))
    ];

    let parent: LexNode = new LexNode(
      'internalLexNode',
      vscode.TreeItemCollapsibleState.Collapsed,
      new LineToken(Symbol.function, 0, 0, 'foobar'),
      children
    );

    assert.notStrictEqual(parent.children(), undefined);
    assert.notStrictEqual(parent.children(), []);
    assert.strictEqual(parent.children()!.length, children.length);
    for (var i = 0; i < children.length; i++) {}
      assert.strictEqual(parent.children()![i], children[i]);
    }
  );

  test('hasChildren() of leaf', () => {
    let n: LexNode = new LexNode('leafLexNode', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.indent, 0, 0));
    assert.strictEqual(n.hasChildren(), false);
  });

  test('hasChildren() of internal node', () => {
    let children: LexNode[] = [
      new LexNode('leafLexNode1', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 2, 1)),
      new LexNode('leafLexNode2', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 3, 1)),
    ];

    let parent: LexNode = new LexNode(
      'internalLexNode',
      vscode.TreeItemCollapsibleState.Collapsed,
      new LineToken(Symbol.function, 0, 0, 'foobar'),
      children
    );

    assert.strictEqual(parent.hasChildren(), true);
  });

  test('adopt() add 1 to empty', () => {
    let child: LexNode = new LexNode('leafLexNode1', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 2, 1));

    let testParent: LexNode = new LexNode(
      'internalLexNode',
      vscode.TreeItemCollapsibleState.Collapsed,
      new LineToken(Symbol.function, 1, 0, 'foobar')
    );

    let referenceParent: LexNode = new LexNode(
      'internalLexNode',
      vscode.TreeItemCollapsibleState.Collapsed,
      new LineToken(Symbol.function, 1, 0, 'foobar'),
      [child]
    );

    testParent.adopt(child);

    assert.deepStrictEqual(testParent, referenceParent);
  });

  test('adopt() add >1 to empty', () => {
    let children: LexNode[] = [
      new LexNode('leafLexNode1', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 2, 1)),
      new LexNode('leafLexNode2', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 3, 1)),
      new LexNode('leafLexNode3', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 4, 1)),
      new LexNode('leafLexNode4', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 5, 1)),
      new LexNode('leafLexNode5', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 6, 1))
    ];

    let testParent: LexNode = new LexNode(
      'internalLexNode',
      vscode.TreeItemCollapsibleState.Collapsed,
      new LineToken(Symbol.function, 1, 0, 'foobar')
    );

    let referenceParent: LexNode = new LexNode(
      'internalLexNode',
      vscode.TreeItemCollapsibleState.Collapsed,
      new LineToken(Symbol.function, 1, 0, 'foobar'),
      children
    );

    testParent.adopt(children);

    assert.deepStrictEqual(testParent, referenceParent);
  });

  test('adopt() add 1 to !empty', () => {
    let child1: LexNode = new LexNode('leafLexNode1', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 2, 1));
    let child2: LexNode = new LexNode('leafLexNode2', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 3, 1));

    let testParent: LexNode = new LexNode(
      'internalLexNode',
      vscode.TreeItemCollapsibleState.Collapsed,
      new LineToken(Symbol.function, 1, 0, 'foobar'),
      [child1]
    );

    let referenceParent: LexNode = new LexNode(
      'internalLexNode',
      vscode.TreeItemCollapsibleState.Collapsed,
      new LineToken(Symbol.function, 1, 0, 'foobar'),
      [child1, child2]
    );

    testParent.adopt(child2);

    assert.deepStrictEqual(testParent, referenceParent);
  });

  test('adopt() add >1 to !empty', () => {
    let children1: LexNode[] = [
      new LexNode('leafLexNode1', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 2, 1)),
    ];

    let children2: LexNode[] = [
      new LexNode('leafLexNode2', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 3, 1)),
      new LexNode('leafLexNode3', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 4, 1)),
    ];

    let testParent: LexNode = new LexNode(
      'internalLexNode',
      vscode.TreeItemCollapsibleState.Collapsed,
      new LineToken(Symbol.function, 1, 0, 'foobar'),
      children1,
    );

    let referenceParent: LexNode = new LexNode(
      'internalLexNode',
      vscode.TreeItemCollapsibleState.Collapsed,
      new LineToken(Symbol.function, 1, 0, 'foobar'),
      children1.concat(children2),
    );

    testParent.adopt(children2);

    assert.deepStrictEqual(testParent, referenceParent);
  });

  test('prune() leaf node', () => {
    let testLexNode: LexNode = new LexNode(
      'leafLexNode',
      vscode.TreeItemCollapsibleState.Collapsed
    );

    let referenceLexNode: LexNode = new LexNode(
      'leafLexNode',
      vscode.TreeItemCollapsibleState.None
    );

    assert.deepStrictEqual(testLexNode.prune(), referenceLexNode);
  });

  test('prune() internal node', () => {
      let testParent: LexNode = new LexNode(
        'internalLexNode',
        vscode.TreeItemCollapsibleState.Collapsed,
        new LineToken(Symbol.function, 1, 0, 'foobar'),
        [
          new LexNode('leafLexNode1', vscode.TreeItemCollapsibleState.Collapsed, new LineToken(Symbol.while, 2, 1)),
          new LexNode('leafLexNode2', vscode.TreeItemCollapsibleState.Collapsed, new LineToken(Symbol.while, 3, 1)),
          new LexNode('leafLexNode3', vscode.TreeItemCollapsibleState.Collapsed, new LineToken(Symbol.while, 4, 1)),
          new LexNode('leafLexNode4', vscode.TreeItemCollapsibleState.Collapsed, new LineToken(Symbol.while, 5, 1)),
          new LexNode('leafLexNode5', vscode.TreeItemCollapsibleState.Collapsed, new LineToken(Symbol.while, 6, 1))
        ]
      );

    let referenceParent: LexNode = new LexNode(
      'internalLexNode',
      vscode.TreeItemCollapsibleState.Collapsed,
      new LineToken(Symbol.function, 1, 0, 'foobar'),
      [
        new LexNode('leafLexNode1', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 2, 1)),
        new LexNode('leafLexNode2', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 3, 1)),
        new LexNode('leafLexNode3', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 4, 1)),
        new LexNode('leafLexNode4', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 5, 1)),
        new LexNode('leafLexNode5', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 6, 1))
      ]
    );

    assert.deepStrictEqual(testParent.prune(), referenceParent);
  });

  test('tooltip without line number', () => {
    let testTooltip: string | vscode.MarkdownString | undefined = new LexNode('leafLexNode', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, -1, -11)).tooltip;
    let referenceTooltip: string = "leafLexNode";
    assert.notStrictEqual(testTooltip, undefined);
    assert.strictEqual(testTooltip, referenceTooltip);
  });

  test('tooltip with line number', () => {
    let testTooltip: string | vscode.MarkdownString | undefined = new LexNode('leafLexNode', vscode.TreeItemCollapsibleState.None, new LineToken(Symbol.while, 6, 1)).tooltip;
    let referenceTooltip: string = "leafLexNode: 7"; // 7 because it's 0 indexed in memory, but editor lines start at 1
    assert.notStrictEqual(testTooltip, undefined);
    assert.strictEqual(testTooltip, referenceTooltip);
  });
});

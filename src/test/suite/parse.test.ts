import * as assert from 'assert';
import * as vscode from 'vscode';
import { after } from 'mocha';

import { Parser } from '../../parse';
import { LexNode } from '../../lexNode';
import { LineToken, Symbol } from '../../linetoken';

// Recursively link children and parents
// This is needed to properly enumerate the
// output
function parentify(nodes: LexNode[], parent: LexNode): LexNode[] {
  nodes.forEach((node, index, nodes) => {
    let newChildren: LexNode[];
  });
return nodes;
}

var tests: { name: string, input: string[], output: LexNode[] }[] = [
  {
    name: 'No Input',
    input: [ ],
    output: [ ]
  },

  {
    name: 'Single line without construct',
    input: [ 'foo = "Yellow M&Ms make me angry >:(' ],
    output: [ ]
  },

  {
    name: 'Single line with construct',
    input: [ 'for x of y:' ],
    output: [
      new LexNode('for x of y',
               vscode.TreeItemCollapsibleState.None,
               new LineToken(Symbol.for, 0, 0, 'x of y'))
    ]
  },

  {
    name: 'Sequential lines, without construct',
    input: [
      'bar = "Blue M&Ms make me happy <:)"',
      'reba = "A hard working gal"'
    ],
    output: [ ]
  },

  {
    name: 'Sequential lines, with, then without construct',
    input: [
      'if radioshack:',
      '    print radioshack.hours',
      'billy = "Scrubbly Bubbles!"'
    ],
    output: [
      new LexNode('if radioshack',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.if, 0, 0, 'radioshack'))
    ]
  },

  {
    name: 'Sequential lines, without, then with construct',
    input: [
      'billy = "Scrubbly Bubbles!"',
      'if radioshack:',
      '    print radioshack.hours'
    ],
    output: [
      new LexNode('if radioshack',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.if, 1, 0, 'radioshack'))
    ]
  },

  {
    name: 'Sequential lines with constructs',
    input: [
      'if yummy:',
      '    print("HOoray!")',
      'elif just_ok:',
      '    print("Do you have anything else?")',
      'else:',
      '    print("You really eat this?")',
    ],
    output: [
      new LexNode('if yummy',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.if, 0, 0, 'yummy')),
      new LexNode('elif just_ok',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.elif, 2, 0, 'just_ok')),
      new LexNode('else',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.else, 4, 0)),
    ]
  },

  {
    name: 'Singly Nested Block',
    input: [
      'if yummy:',
      '    if in_my_tummy:',
      '        exclaim("Scrumdiddlyumptious!")'
    ],
    output: [
      new LexNode('if yummy',
        vscode.TreeItemCollapsibleState.Collapsed,
        new LineToken(Symbol.if, 0, 0, 'yummy'),
        [
          new LexNode('if in_my_tummy',
            vscode.TreeItemCollapsibleState.None,
            new LineToken(Symbol.if, 1, 1, 'in_my_tummy'))
        ]
      )
    ]
  },

  {
    name: 'Singly Nested Block, then Block',
    input: [
      'if yummy:',
      '    if in_my_tummy:',
      '        exclaim("Scrumdiddlyumptious!")',
      'else:',
      '    exclaim("DAESGUSTEN~)"'
    ],
    output: [
      new LexNode('if yummy',
        vscode.TreeItemCollapsibleState.Collapsed,
        new LineToken(Symbol.if, 0, 0, 'yummy'),
        [
          new LexNode('if in_my_tummy',
            vscode.TreeItemCollapsibleState.None,
            new LineToken(Symbol.if, 1, 1, 'in_my_tummy'))
        ]
      ),
        new LexNode('else',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.else, 3, 0),
      )
    ]
  },

  {
    name: 'Doubly Nested Block',
    input: [
      'if yummy:',
      '    if in_my_tummy:',
      '        if looks_like_a_mummy:',
      '            print("you have a spot on your tummy"',
      'else:',
      '    print("Food is food...")'
    ],
    output: [
      new LexNode('if yummy',
        vscode.TreeItemCollapsibleState.Collapsed,
        new LineToken(Symbol.if, 0, 0, 'yummy'),
        [
          new LexNode('if in_my_tummy',
            vscode.TreeItemCollapsibleState.Collapsed,
            new LineToken(Symbol.if, 1, 1, 'in_my_tummy'),
            [
              new LexNode('if looks_like_a_mummy',
                vscode.TreeItemCollapsibleState.None,
                new LineToken(Symbol.if, 2, 2, 'looks_like_a_mummy'))
            ]
          )
        ]
      ),
        new LexNode('else',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.else, 4, 0),
      )
    ]
  },

  {
    name: 'Doubly Nested Block, with multiple indent resets',
    input: [
      'if yummy:',
      '    if in_my_tummy:',
      '        if looks_like_a_mummy:',
      '            print("you have a spot on your tummy"',
      '        else:',
      '            print("eek! a zombie!)',
      '    elif in_my_mouth:',
      '        print("ill be in my tummy soon!"',
      'else:',
      '    print("Food is food...")'
    ],
    output: [
      new LexNode('if yummy',
        vscode.TreeItemCollapsibleState.Collapsed,
        new LineToken(Symbol.if, 0, 0, 'yummy'),
        [
          new LexNode('if in_my_tummy',
            vscode.TreeItemCollapsibleState.Collapsed,
            new LineToken(Symbol.if, 1, 1, 'in_my_tummy'),
            [
              new LexNode('if looks_like_a_mummy',
                vscode.TreeItemCollapsibleState.None,
                new LineToken(Symbol.if, 2, 2, 'looks_like_a_mummy')),
              new LexNode('else',
                vscode.TreeItemCollapsibleState.None,
                new LineToken(Symbol.else, 4, 2))
            ]
          ),
          new LexNode('elif in_my_mouth',
            vscode.TreeItemCollapsibleState.None,
            new LineToken(Symbol.elif, 6, 1, 'in_my_mouth'))
        ]
      ),
        new LexNode('else',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.else, 8, 0)
      )
    ]
  }
];

suite('Parser Test Suite', () => {
  after(() => {
    vscode.window.showInformationMessage('All tests passed!');
  });

  for (var t of tests) {
    let currTest = t; // without this, all test calls get the last test
    test(currTest.name, () => {
      let result: LexNode = new Parser(currTest.input.join('\n')).parse();

      let checkEq = (result: LexNode[], reference: LexNode[]) => {
        if (reference.length === 0) {
          assert.deepStrictEqual(result, reference);
          return;
        }

        for (var i = 0; i < result.length, i < reference.length; i++) {
          if (!reference[i].hasChildren()) {
            // TODO FIXME: somehow "parentify" these nodes
            // have to deparent this because I can't infinitely
            // enumerate the required recursion...
            assert.deepStrictEqual(
              new LexNode(
                result[i].label, result[i].collapsibleState, result[i].token, result[i].children(), undefined
              ),
              new LexNode(
                reference[i].label, reference[i].collapsibleState, reference[i].token, reference[i].children(), undefined
              ),
            );
          } else {
            assert.strict(result[i].hasChildren());
            checkEq(result[i].children()!, reference[i].children()!);
          }
        }

        // Catches the case where reference is a proper subset
        // of result
        assert.strict(result.length === reference.length);
      };

      if (result.hasChildren()) {
        // check children sans parent
        checkEq(result.children()!, currTest.output);
      } else {
        // check that output is supposed to be nothing
        assert.deepStrictEqual([], currTest.output);
      }
    });
  }
});
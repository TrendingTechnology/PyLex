import * as assert from 'assert';
import * as vscode from 'vscode';
import { after } from 'mocha';

import { Lexer } from '../../lex';
import { EOFTOKEN, LineToken, Symbol} from '../../linetoken';

suite('Lexer Test Suite', () => {
  after(() => {
    vscode.window.showInformationMessage('All tests passed!');
  });

  test('Empty String', () => {
    let l: Lexer = new Lexer(undefined);
    assert.deepStrictEqual(l.currToken(), EOFTOKEN);
  });

  test('Undefined', () => {
    let l: Lexer = new Lexer('');
    assert.deepStrictEqual(l.currToken(), EOFTOKEN);
  });

  test('Whitespace', () => {
    let l: Lexer = new Lexer('  \t\t'.repeat(4).repeat(4));
    assert.deepStrictEqual(l.currToken(), EOFTOKEN);
  });

  test('Non-Whitespace with no construct', () => {
    let l: Lexer = new Lexer('foobar');
    assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.indent, 0, 0));
  });

  test('getIndent() accuracy, spaces', () => {
    for (var i = 0; i < 100; i++) {
      let l: Lexer = new Lexer('    '.repeat(i) + 'foobar');
      assert.strictEqual(l.currToken().indentLevel, i);
    }
  });

  test('getIndent() accuracy, tabs', () => {
    for (var i = 0; i < 100; i++) {
      let l: Lexer = new Lexer('\t'.repeat(i) + 'foobar', {hard: true});
      assert.strictEqual(l.currToken().indentLevel, i);
    }
  });

  test('getIndent() accuracy, spaces with incomplete tab', () => {
    for (var i = 0; i < 100; i++) {
      for (var j = 1; j <= 3; j++) {
        let l: Lexer = new Lexer('    '.repeat(i) + ' '.repeat(j) + 'foobar');
        assert.strictEqual(l.currToken().indentLevel, i+1);
      }
    }
  });

  test('class definition', () => {
    let l: Lexer = new Lexer('class Foobar(object):');
    assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.class, 0, 0, 'Foobar'));
  });

  test('function definition', () => {
    let l: Lexer = new Lexer('def Barbaz(this, that, andTheOther):');
    assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.function, 0, 0, 'Barbaz'));
  });

  test('if statement', () => {
    let l: Lexer = new Lexer('if True and bar == baz:');
    assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.if, 0, 0, 'True and bar == baz'));
  });

  test('elif statement', () => {
    let l: Lexer = new Lexer('elif name == "bar" and True:');
    assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.elif, 0, 0, 'name == "bar" and True'));
  });

  test('else statement', () => {
    let l: Lexer = new Lexer('else:');
    assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.else, 0, 0));
  });

  test('for loop', () => {
    let l: Lexer = new Lexer('for pickle in pickleJars:');
    assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.for, 0, 0, 'pickle in pickleJars'));
  });

  test('while loop', () => {
    let l: Lexer = new Lexer('while numCookies < capacity:');
    assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.while, 0, 0, 'numCookies < capacity'));
  });

  test('try statement', () => {
    let l: Lexer = new Lexer('try:');
    assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.try, 0, 0));
  });

  test('except statement with attr', () => {
    let l: Lexer = new Lexer('except NameError:');
    assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.except, 0, 0, 'NameError'));
  });

  test('except statement with no attr', () => {
    let l: Lexer = new Lexer('except:');
    assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.except, 0, 0));
  });

  test('finally statement', () => {
    let l: Lexer = new Lexer('finally:');
    assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.finally, 0, 0));
  });

  test('with statement', () => {
    let l: Lexer = new Lexer('with open(file) as f:');
    assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.with, 0, 0, 'open(file) as f'));
  });

  test('restart()', () => {
    let l: Lexer = new Lexer('with open(file as f:');
    l.restart('if is_old():');
    assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.if, 0, 0, 'is_old()'));
  });

  // tests involving multiple lines need to go here,
  // that way they can be tested with all three line endings
  for (var lineEnding of ['\n', '\r\n', '\r']) {
    let toStr = (x: string) => {
      switch(x) {
        case '\n': return 'LF';
        case '\r\n': return 'CRLF';
        case '\r': return 'CR';
      }
    };

    let currEnding = lineEnding;
    suite(toStr(currEnding) + ' Tests', () => {
      test('next() ignores empty lines', () => {
        let lines: string[] = [
          'if wurst_available():',
          '',
          '    eat_wurst()'
        ];
        let l: Lexer = new Lexer(lines.join(currEnding));

        l.next();

        assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.indent, 2, 1));
      });

      test('retract() ignores empty lines', () => {
        let lines: string[] = [
          'if wurst_available():',
          '',
          '    eat_wurst()'
        ];
        let l: Lexer = new Lexer(lines.join(currEnding));

        l.next();

        l.retract();

        assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.if, 0, 0, 'wurst_available()'));
      });

      test('next() ignores whitespace lines', () => {
        let lines: string[] = [
          'if wurst_available():',
          ' \t \t   ',
          '    eat_wurst()'
        ];
        let l: Lexer = new Lexer(lines.join(currEnding));

        l.next();

        assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.indent, 2, 1));
      });

      test('retract() ignores whitespace lines', () => {
        let lines: string[] = [
          'if wurst_available():',
          ' \t . \t',
          '    eat_wurst()'
        ];
        let l: Lexer = new Lexer(lines.join(currEnding));

        l.next();

        l.retract();

        assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.if, 0, 0, 'wurst_available()'));
      });

      test('next() ignores comment lines', () => {
        let lines: string[] = [
          'if wurst_available():',
          ' \t # I hate testing \t',
          '    eat_wurst()'
        ];
        let l: Lexer = new Lexer(lines.join(currEnding));

        l.next();

        assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.indent, 2, 1));
      });

      test('retract() ignores comment lines', () => {
        let lines: string[] = [
          'if wurst_available():',
          ' \t . \t',
          '    eat_wurst()'
        ];
        let l: Lexer = new Lexer(lines.join(currEnding));

        l.next();

        l.retract();

        assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.if, 0, 0, 'wurst_available()'));
      });

      test('retract() out of range', () => {
        let l: Lexer = new Lexer('class Platypus:');
        try {
          l.retract();
        } catch (err) {
          assert.strict(err instanceof RangeError);
        }
      });

      test('retract() validate argument', () => {
        let l: Lexer = new Lexer('if test1:' + currEnding + '    if test2:');

        // Negative
        try {
          l.retract(-1);
        } catch (err) {
          assert.strict(err instanceof RangeError);
        }

        // Zero, it doesn't make sense to retract 0 :P
        try {
          l.retract(0);
        } catch (err) {
          assert.strict(err instanceof RangeError);
        }

      });

      test('retract() 1-100', () => {
        let lines: string[] = Array.from(Array(100), (_, i) => 'line' + i);
        let reference: LineToken[] = lines.map((_, i) => {
          return new LineToken(Symbol.indent, i, 0);
        });

        for (var i = 0; i < 100; i++) {
          let l: Lexer = new Lexer(lines.join(currEnding));

          // advance to EOF
          do {} while (l.next() !== EOFTOKEN);

          // try retract
          l.retract(i+1);

          assert.deepStrictEqual(l.currToken(), reference[99-i]);
        }
      });

      test('2 full lex and retract passes', () => {
        let lines: string[] = Array.from(Array(100), (_, i)=> 'line' + i);
        let reference: LineToken[] = lines.map((_, i) => {
          return new LineToken(Symbol.indent, i, 0);
        });

        let l: Lexer = new Lexer(lines.join(currEnding));

        // Twice
        for (var n of [0,1]) {
          // advance to EOF
          for (var i = 0; i < lines.length; i++) {
            assert.deepStrictEqual(l.currToken(), reference[i]);
            l.next();
          }

          // retract to start
          for (var i = lines.length - 1; i >= 0; i--) {
            l.retract();
            assert.deepStrictEqual(l.currToken(), reference[i]);
          }
        }
      });
    });
  }
});
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
});
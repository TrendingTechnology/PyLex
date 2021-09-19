import { LineToken, Symbol, EOFTOKEN } from './linetoken';

// List of recognition patterns, in order of priority
//
// The first item is a recognition pattern, used to recognize the token
// the second item is the token type
var rules: {pattern: RegExp, type: Symbol}[] = [
  {
    pattern: /^\s*def\s+(?<attr>[a-zA-Z_][a-zA-Z0-9_]*)\(/,
    type: Symbol.function
  },
  {
    pattern: /^\s*class\s+(?<attr>[a-zA-Z_][a-zA-Z0-9_]*)/,
    type: Symbol.class
  },
  {
    pattern: /^\s*if\s+(?<attr>[^:]+):\s*/,
    type: Symbol.if
  },
  {
    pattern: /^\s*elif\s+(?<attr>[^:]+):\s*$/,
    type: Symbol.elif
  },
  {
    pattern: /^\s*else\s*:/,
    type: Symbol.else
  },
  {
    pattern: /^\s*for\s+(?<attr>[^:]+):\s*$/,
    type: Symbol.for
  },
  {
    pattern: /^\s*while\s+(?<attr>[^:]+):\s*$/,
    type: Symbol.while
  },
  {
    pattern: /^\s*try\s*:/,
    type: Symbol.try
  },
  {
    pattern: /^\s*except(\s*(?<attr>[^:]+))?:\s*$/,
    type: Symbol.except
  },
  {
    pattern: /^\s*finally\s*:\s*$/,
    type: Symbol.finally
  },
  {
    pattern: /^\s*with\s+(?<attr>[^:]+):\s*$/,
    type: Symbol.with
  },
];

export class Lexer {
  private textLines: string[] = []; // array of text lines
  private pos: number = 0;
  private _currToken: LineToken = EOFTOKEN;

  constructor(text: string | undefined) {
    this.restart(text);
  }

  // Restart lexer with new text
  restart(text: string | undefined): void {
    this.textLines = [];
    this.pos = 0;
    this._currToken = EOFTOKEN;
    if (text !== undefined) {
      // Try carriage return AND linefeed (CRLF, Windows)
      this.textLines = text.split('\r\n');
      if (this.textLines.length > 1) {
        // filter out whitespace only lines
        this.textLines = this.textLines.filter(line => !/^\s*$/.test(line));
        this.next();
        return;
      }

      // Try ONLY linefeed (LF, Unix)
      this.textLines = text.split('\n');
        if (this.textLines.length > 1) {
        this.textLines = this.textLines.filter(line => !/^\s*$/.test(line));
        this.next();
        return;
      }

      // Try ONLY carriage return (CF, other)
      this.textLines = text.split('\r');
      this.textLines = this.textLines.filter(line => !/^\s*$/.test(line));
      this.next();
    }
  }

  currToken(): LineToken { return this._currToken; }

  next(): LineToken {
    // Until a LineToken is found, or EOF
    while (this.pos < this.textLines.length) {
      let line: string = this.textLines[this.pos];
      let indent: number = this.getIndent(line, 4);
      let token: LineToken;
      for (var r of rules) {
        // Does line match pattern?
        let match: RegExpMatchArray | null = line.match(r.pattern);
        if (match !== null) {
          // Yes...
          // TODO FIXME match tabstop settings?
          if (match.groups !== undefined) {
            token = new LineToken(r.type, this.pos, indent, match.groups["attr"]);
          } else {
            token = new LineToken(r.type, this.pos, indent);
          }

          this._currToken = token;
          this.pos++;
          return this.currToken();
        }
      }

      // No rules matched, save INDENT token
      token = new LineToken(Symbol.indent, this.pos, indent);
      this._currToken = token;
      this.pos++;
      return this.currToken();
    }

    // Didn't return, must be EOF
    this._currToken = EOFTOKEN;
    return this.currToken();
  }

  // Retracts current token n positions
  retract(n: number = 1): void {
    this.pos -= (n + 1); // +1 required so that next() lands on correct token
    this.next();
  }

  // Calculates indentation level for
  // a line. rounds up (so, 5 spaces is
  // 2 levels, 9 is 3, etc.)
  getIndent(text: string, tabstop: number) {
    let indent: number = 0;
    while (text.startsWith(' '.repeat(tabstop * (indent+1)))) {
      indent++;
    }

    // Might miss incomplete tab (<4 space characters),
    // be nice and don't break, even though you're wrong >:(
    if (text[tabstop * indent]  === ' ') {
      indent++;
    }

    return indent;
  }
}
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

  constructor(text?: string, private tabFmt: {size?: number, hard?: boolean} = {}) {
    if (this.tabFmt.size === undefined) {
      this.tabFmt.size = 4;
    }

    if (this.tabFmt.hard === undefined) {
      this.tabFmt.hard = false;
    }
    this.restart(text);
  }

  // Restart lexer with new text
  restart(text?: string): void {
    this.textLines = [];
    this.pos = 0;
    this._currToken = EOFTOKEN;
    if (text !== undefined) {
      // Try carriage return AND linefeed (CRLF, Windows)
      this.textLines = text.split('\r\n');
      if (this.textLines.length > 1) {
        this.next();
        return;
      }

      // Try ONLY linefeed (LF, Unix)
      this.textLines = text.split('\n');
      if (this.textLines.length > 1) {
        this.next();
        return;
      }

      // Try ONLY carriage return (CF, other)
      this.textLines = text.split('\r');
      this.next();
    }
  }

  currToken(): LineToken { return this._currToken; }

  next(): LineToken {
    // Until a LineToken is found, or EOF
    while (this.pos < this.textLines.length) {
      let line: string = this.textLines[this.pos];
      let indent: number = this.getIndent(line, this.tabFmt);
      let token: LineToken;
      for (var r of rules) {
        // Does line match pattern?
        let match: RegExpMatchArray | null = line.match(r.pattern);
        if (match !== null) {
          // Yes...
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
      // No rules matched

      // Skip this line if it is whitespace, comment, or empty
      if (/^\s*(#.*)?$/.test(line)) {
        this.pos++;
        continue;
      }

      // This is an INDENT token
      token = new LineToken(Symbol.indent, this.pos, indent);
      this._currToken = token;
      this.pos++;
      return this.currToken();
    }

    // Didn't return, must be EOF
    this._currToken = EOFTOKEN;
    this.pos++;
    return this.currToken();
  }

  // Retracts current token n positions
  retract(n: number = 1): void {
    if (this.pos - 1 - n < 0) {
      // -1 because this.pos is currently on the next token
      throw new RangeError('Cannot retract past start');
    }

    if (n <= 0) {
      throw new RangeError('Retract distance must be positive');
    }

    if (this.pos - n === 0) {
      // just restart
      this.pos = 0;
      this.next();
      return;
    }

    let c = n + 1;
    while (c > 0) {
      this.pos--;
      while (/^\s*(#.*)?$/.test(this.textLines[this.pos])) {
        // Skip empty lines
        this.pos--;
      }
      c--;
    }
    this.next();
  }

  // Calculates indentation level for
  // a line. if using soft tabs, indent
  // level rounds up (so, tabSize+1 spaces is
  // 2 levels, 2*tabSize+1 is 3, etc.)
  getIndent(text: string, tabFmt: {size?: number, hard?: boolean}) {
    let leadingSpace: number = text.length - text.trimLeft().length;
    let indent: number;
    if (tabFmt.hard) {
      // used tabs
      indent = leadingSpace;
    } else {
      // use spaces
      indent = Math.ceil(leadingSpace/tabFmt.size!);
    }

    return indent;
  }
}
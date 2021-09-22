# PyLex
Implements a Parser class for modeling the high-level control functions of Python programs.

---

The high level structure of a Python file can be represented as a parse tree.
Consider the following snippet of Python code:

```python
class Bot(object):
    def __init__(self, id):
        this.name = id

    def work():
        print("Beep, Boop .-.");

b = Bot()
while True:
    b.work()
```

This can be imagined as the following parse tree, where each node is enclosed in a box:

![Parse tree for the above code sample. Indentation represents a parent-child relationship](/media/sample_tree.png?raw=true)

Calling the `parse()` function of an initialized Parser returns such a
syntax-tree of the control flow of a Python program. A Parser can be
initialized at instantiation, or when calling the `parse()` method. The Parser
accepts two optional arguments when initializing:

- `text: string`: The text string to parse.
- `tabFmt: {size?: number, hard?: boolean}`: The type of tab to use.
  `tabFmt.size` is the number 
  of spaces to use, and `tabFmt.hard` indicates whether to use hard or soft
  tabs. Both are optional.

When an argument is omitted, the previously passed value for that field will be
used. If there is no previous field, `text` defaults to `undefined`, and
`tabFmt` defaults to `{size: 4, hard: false}`.

By preserving the state this way, `parse()` can be called repeatedly without
arguments to get the same tree more than once, and any new text passed without
a `tabFmt` will be assumed to use the same format.

---

Once a Parser object has been initialized, calling its `context(lineNumber: number)`
method will return a path of nodes from the leaf node containing the specified line
number to the root.  Take for example, the `print()` statement inside of
`work()`. The returned context would be

![Context Path: "while True" inside of "def work()" inside of "class Bot"](/media/sample_context.png?raw=true)

and can be read as:

> The line `print("Beep, boop .-.")` is inside the function `work()` inside the
> class `Bot` inside the root of the document

**NOTE**: It is important to recognize that the print statement is not an
actual node in practice, but nonetheless it is helpful to think of it being
"inside" the leaf.

---

This repository also implements a TreeNodeProvider to allow visualization of
the LexNode tree.

## Dependencies
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/)

See ["Your First
Extension"](https://code.visualstudio.com/api/get-started/your-first-extension)
API page if you need more help.

## Cloning & Setup
Use the following to set up the extension for development.

    git clone https://github.com/SingleSemesterSnobs/PyLex.git
    cd PyLex
    npm install

While inside the repository do

    code .

to open the cloned repository in VS Code.

Then, use "Run > Start Debugging" on the menu bar to start the [Extension
Development Host](https://code.visualstudio.com/api/advanced-topics/extension-host)
(<kbd>F5</kbd> by default).

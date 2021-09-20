# PyLex
Implements a Parser class that can parse Python files in VS code and return a
tree representing high-level constructs (class/function definition, try/catch,
etc.). Once a Parser object has been initialized, calling
`Parser.context(lineNumber: number)` will return a path of nodes from the leaf
node containing the specified line number to the root. This can be thought of
as

```
  "this" inside "that" inside ... inside root
```

where root is the the root of the syntax tree.

This repository also implements a TreeNodeProvider to allow visualization of
the LexNode tree.

## Dependencies
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/)

See ["Your First Extension"](https://code.visualstudio.com/api/get-started/your-first-extension) API page if you need more help.

## Cloning & Setup
Use the following to set up the extension for development.

    git clone https://github.com/SingleSemesterSnobs/PyLex.git
    cd PyLex
    npm install

While inside the repository do

    code .

to open the cloned repository in VS Code.

Then, use "Run > Start Debugging" on the menu bar to start the [Extension Development Host](https://code.visualstudio.com/api/advanced-topics/extension-host) (<kbd>F5</kbd> by default).

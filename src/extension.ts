import * as vscode from 'vscode';

import { LexNodeProvider } from './node';

export function activate(context: vscode.ExtensionContext) {

	// Register and setup provider
	var provider = new LexNodeProvider();
	vscode.window.registerTreeDataProvider('lexNodes', provider);
	vscode.commands.registerCommand('lexNodes.refreshEntry', () => {
		provider.refresh();
	});

	// Update when necessary
	vscode.workspace.onDidChangeTextDocument((editor) => {
		vscode.commands.executeCommand('lexNodes.refreshEntry');
	});

	vscode.window.onDidChangeActiveTextEditor((editor) => {
		vscode.commands.executeCommand('lexNodes.refreshEntry');
	});
}

export function deactivate() {}

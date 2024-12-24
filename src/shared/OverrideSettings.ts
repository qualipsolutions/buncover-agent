import * as vscode from "vscode"
import * as path from "path"
import { TEST_CASE_PROMPT } from "../core/prompts/testCase"

export const extensionName = "BunCover"
export const extensionThemeIcon = new vscode.ThemeIcon("bug")

// located at src/assets/icons/
export const extensionLightIconName = "robot_panel_light.png"
export const extensionDarkIconName = "robot_panel_dark.png"

export type WorkspaceSettings = {
	buncoverProjectId?: string
	testNamePattern?: string
	testFilter?: string
}

export const generateTestsCommand = (params: {
	filePath: string
	accessKey: string
	projectId: string
	uncoveredLines: number[]
}) => {
	return TEST_CASE_PROMPT({
		filePath: params.filePath,
		accessKey: params.accessKey,
		projectId: params.projectId,
		uncoveredLines: params.uncoveredLines,
	})
}

export const autoApproveCommands = ["buncover"]

export const bunCoverRunCommand = (params: { accessKey: string; workspaceSettings?: WorkspaceSettings }) => {
	let runCommand = `buncover run --no-fs --token ${params.accessKey} --env dev --project-id ${params.workspaceSettings?.buncoverProjectId}`

	if (params.workspaceSettings?.testNamePattern) {
		runCommand += ` -- --test-name-pattern ${params.workspaceSettings.testNamePattern}`
	}

	if (params.workspaceSettings?.testFilter) {
		runCommand += ` -- ${params.workspaceSettings.testFilter}`
	}

	return `Run "${runCommand}" to generate coverage report and show the following test coverage report summary. The results are displayed on the terminal output.

Test Coverage Report Summary:

Overall Coverage:

• Functions: <All files % Funcs>
• Lines: <All files % Lines>

Key Metrics:

• Total Tests: <number>
• Files Tested: <number>
• Test Duration: <ms>
• Expect Calls: <number>
• All tests passed successfully: <Yes/No>

Areas Needing Attention:

1. Files with Low Coverage:

• <path> (<% Lines> lines, <% Funcs> functions)

2. Files with Uncovered Lines:

• <path>: Lines <Uncovered Lines>

Write a concise summary of the coverage report and provide recommendations for improving coverage.`
}

interface FileLink extends vscode.TerminalLink {
	filePath: string
	uncoveredLines: string
}

export class BunCoverTerminalLinkProvider implements vscode.TerminalLinkProvider {
	provideTerminalLinks(context: vscode.TerminalLinkContext): vscode.TerminalLink[] {
		const regex = /\s*([\w\/\-\.]+\.(?:ts|js))\s*\|\s*[\d\.]+\s*\|\s*[\d\.]+\s*\|\s*([\d\-,\s]+)?/
		const matches = context.line.match(regex)

		if (matches) {
			const [_, filePath, uncoveredLines] = matches
			return [
				{
					startIndex: context.line.indexOf(filePath),
					length: filePath.length,
					tooltip: "Open file and highlight uncovered lines",
					// Store the data as properties of the link
					filePath,
					uncoveredLines,
				} as FileLink,
			]
		}
		return []
	}

	handleTerminalLink(link: vscode.TerminalLink): vscode.ProviderResult<void> {
		const fileLink = link as FileLink

		// Get the workspace folders
		const workspaceFolders = vscode.workspace.workspaceFolders
		if (!workspaceFolders) {
			vscode.window.showErrorMessage("No workspace folder is opened")
			return
		}

		// Try to find the file in the workspace
		const workspaceRoot = workspaceFolders[0].uri.fsPath
		const absolutePath = vscode.Uri.file(
			path.isAbsolute(fileLink.filePath) ? fileLink.filePath : path.join(workspaceRoot, fileLink.filePath),
		)

		// Open the file and highlight uncovered lines
		vscode.workspace.openTextDocument(absolutePath).then(
			(doc) => {
				vscode.window.showTextDocument(doc).then((editor) => {
					if (fileLink.uncoveredLines) {
						highlightUncoveredLines(editor, fileLink.uncoveredLines)
					}
				})
			},
			(error) => {
				vscode.window.showErrorMessage(`Failed to open file: ${error.message}`)
			},
		)
	}
}
function highlightUncoveredLines(editor: vscode.TextEditor, lineNumbers: string) {
	// Parse the line numbers (handling ranges like "16,18-20,22,24-25,27-33")
	const lines = lineNumbers.split(",").flatMap((part) => {
		if (part.includes("-")) {
			const [start, end] = part.split("-").map(Number)
			return Array.from({ length: end - start + 1 }, (_, i) => start + i)
		}
		return [Number(part)]
	})

	// Create decorations for uncovered lines
	const decorationType = vscode.window.createTextEditorDecorationType({
		backgroundColor: "rgba(255, 0, 0, 0.2)", // Light red with 20% opacity
		isWholeLine: true,
		overviewRulerColor: new vscode.ThemeColor("errorForeground"),
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		color: "inherit", // Ensures text color remains unchanged
		fontWeight: "normal",
	})

	// Apply decorations
	const decorationsArray = lines.map(
		(line) => new vscode.Range(new vscode.Position(line - 1, 0), new vscode.Position(line - 1, Number.MAX_VALUE)),
	)

	editor.setDecorations(decorationType, decorationsArray)

	// Scroll to first uncovered line
	if (lines.length > 0) {
		const firstLine = lines[0]
		editor.revealRange(new vscode.Range(firstLine - 1, 0, firstLine - 1, 0), vscode.TextEditorRevealType.AtTop)
	}
}

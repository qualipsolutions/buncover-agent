import * as vscode from "vscode"

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

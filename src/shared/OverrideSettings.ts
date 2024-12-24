export const autoApproveCommands = ["buncover"]

export const bunCoverRunCommand = (accessKey: string, projectId: string) => {
	return `Run "buncover run --no-fs --token ${accessKey} --env dev --project-id ${projectId}" to generate coverage report and show the following test coverage report summary. The results are displayed on the terminal output.

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

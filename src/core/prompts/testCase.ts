// Types for test generation
export interface TestRunnerConfig {
	imports: string[]
	mockingExamples: MockingExample[]
	extraInstructions?: string[]
}

interface MockingExample {
	title: string
	code: string
	description?: string
}

// Test runner configurations
export const TEST_RUNNERS = {
	bun: {
		imports: ["beforeEach", "afterEach", "describe", "expect", "test", "mock", "spyOn", "it"],
		mockingExamples: [
			{
				title: "Module Mocking",
				code: `mock.module('./userService', () => ({
  getUser: () => ({ id: 1, name: 'Test User' })
}));`,
				description: "Mock an entire module and its exports",
			},
			{
				title: "Function Mocking",
				code: `const fn = mock((name: string) => 'Hello');
fn.mockReturnValue('Mocked response');`,
				description: "Mock a single function with return value",
			},
			{
				title: "Async Function Mocking",
				code: `const asyncFn = mock(async () => {
  return { data: 'result' }
});`,
				description: "Mock an async function with Promise return",
			},
		],
		extraInstructions: [
			"Use mock() and spyOn() instead of jest.mock() and jest.spyOn()",
			"For NextJS API routes, import HTTP methods explicitly",
			"Create TypeScript interfaces for missing types",
		],
	},
} as const

export type TestRunner = keyof typeof TEST_RUNNERS

interface PromptContext {
	accessKey: string
	projectId: string
	filePath: string
	uncoveredLines: number[]
}

const generateImportsSection = (testRunner: TestRunner): string => {
	const imports = TEST_RUNNERS[testRunner].imports.map((imp) => imp.trim()).join(", ")
	return `import { ${imports} } from 'bun:test';`
}

const generateMockingGuide = (testRunner: TestRunner): string => {
	const { mockingExamples } = TEST_RUNNERS[testRunner]
	return mockingExamples.map((example, index) => `${index + 1}. ${example.title}:\n${example.code}`).join("\n\n")
}

const generateTestingGuidelines = (): string => `
Key Testing Guidelines:
1. Mock patterns:
   - Use correct mocking syntax for each test runner
   - Mock at module level when needed
   - Type all mocks properly

2. Response validation:
   - Match exact response structures
   - Validate status codes
   - Test success and error paths

3. Test organization:
   - Create reusable test setup
   - Clean mocks between tests
   - Group related test cases

4. Error handling:
   - Test expected/unexpected errors
   - Validate error messages
   - Verify status codes

5. Type safety:
   - Define interfaces for test data
   - Type mock responses
   - Ensure type coverage

When writing tests using Bun Test Runner, mocks do not automatically reset between test cases. Always include explicit mock cleanup in the \`beforeEach\` block for any mocked functions to ensure test isolation. Otherwise, mock call history will persist between tests and cause false positives/negatives.

Key points:
- Call \`mock.clear()\` on each mock in \`beforeEach\`
- This applies to both function and module mocks  
- Unlike Jest, Bun does not automatically reset mock state
- Mock cleanup should happen before setting up new test state

Example mock cleanup:
\`\`\`typescript
beforeEach(() => {
  // Clear all mocks first
  mockFunction1.mockClear();
  mockFunction2.mockClear();
  mockedModule.someFunction.mockClear();

  // Then set up test state
  testData = {
    prop1: 'value1'
  };
});
\`\`\`
`

export const TEST_CASE_PROMPT = ({ filePath, uncoveredLines, accessKey, projectId }: PromptContext): string => {
	const imports = generateImportsSection("bun")
	const mockingGuide = generateMockingGuide("bun")
	const guidelines = generateTestingGuidelines()

	let runCommand = `buncover run --no-fs --token ${accessKey} --env dev --project-id ${projectId}`
	runCommand += ` -- ${filePath}`

	return `
Generate comprehensive test cases for ${filePath} covering lines: ${uncoveredLines.join(", ")}. Create the test case file is one is not already created at location "tests/buncover/${filePath}".

${imports}

Mocking Examples:
${mockingGuide}

${guidelines}

Requirements:
1. Match existing test patterns
2. Cover specified uncovered lines
3. Test edge cases and errors
4. Use proper types
5. Write descriptive names
6. Mock external dependencies
7. Follow project conventions

When the test generation is complete, run command "${runCommand}" to generate coverage report and fix any failed tests.
`
}

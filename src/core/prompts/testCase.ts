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

const mongooseMockingGuide = `
# Mongoose Mocking Guide

## 1. **Check for Existing Mongoose Mock Patterns**

- **Before writing new mocks**, look for existing tests (or helper files) in your repository that already **mock Mongoose**.  
- If a project-standard approach or a utility is used (e.g., a \`mockMongoose\` helper function, or a custom \`MockedModel\` class), **reuse** that method to maintain consistency.

---

## 2. **Mocking the Mongoose Model**

When you have a Mongoose model (e.g., \`UserModel\`), your domain code might import it like:

\`\`\`js
import UserModel from './models/User'; // Example path
\`\`\`

To **mock** this import using Bun’s test runner:

\`\`\`ts
import { beforeEach, describe, test, expect, mock } from 'bun:test';

// Example: Mocking the entire Mongoose model module
mock.module('./models/User', () => ({
  // Use the same name as the real model export
  default: {
    // Mock the static methods you need. For instance:
    find: mock(async () => {
      return [
        { _id: 'fake1', name: 'John Doe' },
        { _id: 'fake2', name: 'Jane Doe' },
      ];
    }),
    findOne: mock(async (query) => {
      return query._id === 'fake1' ? { _id: 'fake1', name: 'John Doe' } : null;
    }),
    create: mock(async (userData) => {
      return { _id: 'newFakeId', ...userData };
    }),
    // etc.
  },
}));
\`\`\`

### **Key Points**:

- **Replicate** only the methods used by the domain code. If the domain code calls \`UserModel.find()\`, \`findOne()\`, and \`create()\`, mock just those.  
- Return **fake data** that resembles the shape of real Mongoose documents (e.g., \`_id\`, \`name\`, etc.).  
- For **type safety**, define TypeScript interfaces (if applicable) or ensure your mocks return objects consistent with real code usage.

---

## 3. **Mocking the Mongoose Document**

If your domain code calls **document instance methods**, such as:

- \`doc.save()\`
- \`doc.remove()\`
- \`doc.toJSON()\`
- \`doc.populate()\`

...you’ll need to **mock those document methods** as well. Depending on how your code obtains the document, you might:

1. **Mock them on the returned object** from the model’s static method (e.g., \`findOne\`, \`create\`).  
2. Or create a **custom class** or **plain object** that simulates a Mongoose document:

\`\`\`ts
class MockedUserDoc {
  _id: string;
  name: string;

  constructor({ _id, name }: { _id: string; name: string }) {
    this._id = _id;
    this.name = name;
  }

  // Example document methods
  save = mock(async () => {
    // Simulate saving logic
    return this;
  });

  toJSON = mock(() => {
    return {
      _id: this._id,
      name: this.name,
    };
  });
}

// Usage in the mock
mock.module('./models/User', () => ({
  default: {
    findOne: mock(async (query) => {
      if (query._id === 'fake1') {
        return new MockedUserDoc({ _id: 'fake1', name: 'John Doe' });
      }
      return null;
    }),
  },
}));
\`\`\`

### **Key Points**:

- Return an **instance** of \`MockedUserDoc\` (or your custom mock class) in place of a real Mongoose document.  
- Stub **only** the methods your code calls. If the domain code never calls \`.\`remove\` or \`.\`populate\`\`, there’s no need to mock them.

---

## 4. **Manually Reset Mocks in Bun Tests**

Because **Bun does not automatically reset** mocks between tests, always ensure you **reset/clear** them in \`beforeEach\`:

\`\`\`ts
import { beforeEach, afterEach, describe, expect, test, mock } from 'bun:test';

let findMock;
let createMock;

describe('User Service Tests', () => {
  beforeEach(() => {
    if (findMock) findMock.mockClear();
    if (createMock) createMock.mockClear();
  });

  test('should return a list of users', async () => {
    // Suppose findMock is referencing the mock for \`UserModel.find\`
    // ...
  });
});
\`\`\`

This ensures **each test** starts with a fresh mock state, preventing **cross-test contamination**.

---

## 5. **Handling Connections & Other Mongoose-Specific Logic**

If your domain code **initializes** a Mongoose connection (e.g., \`mongoose.connect()\`), you generally don’t want real connections in unit tests.  
- If a dedicated **database connection** function is imported in your domain code, consider **mocking** that function or the entire Mongoose library.  
- If you already see other tests that handle DB connections (e.g., via \`beforeAll\`/\`afterAll\` hooks), **match** that pattern instead of introducing new logic.

---

## 6. **Avoid Real DB Calls in Unit Tests**

- The **core rationale** for mocking Mongoose is to **avoid** testing the database itself.  
- **Integration tests** or **end-to-end tests** might use an in-memory database (like \`mongodb-memory-server\`), but do **not** install new packages if your project does not already use them.  
- Stick to **faked** or **mocked** Mongoose operations for **fast, isolated** unit tests.

---

## 7. **Align with Existing Project Conventions**

- If you see **utilities** like \`jest.mock('mongoose')\` or a similar approach for Bun, **follow** that.  
- If you see a preloader that sets up a \`MockMongoose\` or a \`sandbox\`, **use** it. Don’t reinvent the wheel.
- Always respect the project’s constraints:
  - **No new package installations**  
  - **No modifications** to existing domain code  
  - **Maintain** the same folder structures and naming conventions

---

## 8. **Example Test Snippet**

Here’s a simplified example (TypeScript-ish) that shows how you might test a function using a Mongoose \`UserModel\`:

\`\`\`ts
// userService.test.ts
import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { getUserById } from '../../domain/user/userService'; // Example domain code

let findOneMock;

mock.module('../../domain/user/models/UserModel', () => ({
  default: {
    findOne: mock(async (query) => {
      if (query._id === 'fakeUserId') {
        return {
          _id: 'fakeUserId',
          name: 'Test User',
          toJSON: () => ({ _id: 'fakeUserId', name: 'Test User' }),
        };
      }
      return null;
    }),
  },
}));

describe('getUserById()', () => {
  beforeEach(() => {
    // Clear mocks before each test
    if (findOneMock) findOneMock.mockClear();
  });

  test('should return a user if the ID exists', async () => {
    const user = await getUserById('fakeUserId');
    expect(user).toEqual({ _id: 'fakeUserId', name: 'Test User' });
  });

  test('should return null if the user does not exist', async () => {
    const user = await getUserById('nonExistentId');
    expect(user).toBeNull();
  });
});
\`\`\`

**Notes**:

- We mock the entire \`UserModel\` module via \`mock.module(...)\`.  
- Inside \`mock.module\`, we return an object that **matches** the shape of the **real** \`export\`.  
- We manually call \`.\`mockClear\`\` in \`beforeEach\`.

---

### **Wrapping Up**

By following these guidelines:

1. You’ll **avoid real DB** calls and keep tests fast and deterministic.  
2. You’ll ensure your **mock** methods and **document** instances reflect the actual domain code usage.  
3. You’ll stay consistent with **Bun’s** mocking approach by clearing mocks in \`beforeEach\`.  
4. You’ll **respect** the “no code modifications” and “no new packages” constraints, relying solely on **existing** Mongoose and test patterns in your codebase.  

Always remember to **mirror existing test patterns** for Mongoose (or any database) within your project to maintain a coherent, maintainable test suite.
`

const promptV1 = (
	filePath: string,
	uncoveredLines: number[],
	imports: string,
	mockingGuide: string,
	guidelines: string,
	runCommand: string,
	runCommandWithPreloader: string,
): string => {
	return `
  Generate comprehensive test cases for ${filePath} covering lines: ${uncoveredLines.join(", ")}.
  
  When generating test cases files, please follow these specific organization requirements:
  
  1. Create all test files within a "buncover" folder
  2. Place the "buncover" folder inside the project's existing test directory
  3. Mirror the exact subfolder structure of the domain code being tested
  4. IMPORTANT: Never modify the domain code - even if tests are failing
     - Your task is to write tests that work with the existing code
     - If you encounter difficulties, focus on understanding the current implementation
     - Do not suggest or make changes to the domain code itself
  5. IMPORTANT: Do not install or suggest installing any new packages
     - All required packages are already installed in the project
     - If you find yourself wanting to install a package, this indicates you're trying to use the wrong package
     - Use only the existing packages and imports available in the project
     - If you need a specific functionality, check the existing codebase for similar tests to see which packages are being used
  6. For Preloader Requirements:
     - First search the entire test directory and its subfolders for existing "preloader.ts", "preloader.js", "preloader.test.ts", or "preloader.test.js"
     - If found:
       * DO NOT modify any existing code in the preloader file
       * Other tests depend on the existing preloader code
       * Only add new code required for your specific tests
       * Place new code at the end of the appropriate sections
     - If not found, create a new "preloader.test.{ts,js}" file using the appropriate extension that matches the project's setup
     - Place the new preloader file in the appropriate location based on existing project conventions
  7. IMPORTANT: Study Existing Test Patterns:
     - Before writing new tests, examine existing test files in the project
     - Understand and follow the project's established testing patterns for:
       * Mock implementation approaches
       * Common testing utilities and helpers
       * Assertion styles and patterns
       * Setup and teardown conventions
     - Use the same mocking libraries and techniques as other tests in the project
     - Follow similar patterns for handling dependencies and external services
  8. IMPORTANT: Coverage Run Requirements:
     - Always run full coverage without any test file filters
     - Do not specify individual test files or patterns in the buncover run command
     - Each run should analyze coverage for the entire test suite
     
  For example, if the domain code structure is:
  src/
    domain/
      user/
        UserService.js
      auth/
        AuthService.js
    tests/
  
  Then organize the test files as:
  src/
    tests/
      buncover/
        domain/
          user/
            UserService.test.js
          auth/
            AuthService.test.js
  
  Please ensure that:
  - Each test file name matches its corresponding domain file with ".test" added before the extension
  - All subfolder names and hierarchy exactly match the domain code structure
  - Test files are placed in corresponding subfolders that match their domain code location
  - You work within the constraints of the existing domain code implementation
  - You only use packages that are already installed in the project
  - You properly handle preloader file requirements by first checking for existing files and never modifying existing code
  - You follow the project's established testing patterns and conventions
  - You run full coverage analysis without file filters
  
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
  
  When the test generation is complete, run command "${runCommand}" to generate coverage report and fix any failed tests. If you don't see the command output, try to run the command again.
  
  If you need run with the preload option, use command "${runCommandWithPreloader}" to generate coverage report and fix any failed tests.
  `
}

const promptV2 = (filePath: string, runCommand: string, runCommandWithPreloader: string): string => {
	return `
  Generate **comprehensive, high-quality test cases** for '${filePath}', adhering to the following requirements and best practices. All tests will be run using the **Bun Test Runner**.

When the test generation is complete, run command "${runCommand}" to generate coverage report and fix any failed tests. If you don't see the command output, try to run the command again.

If you need run with the preload option, use command "${runCommandWithPreloader}" to generate coverage report and fix any failed tests.

1. **File/Folder Organization**  
   - **All test files** must be created in a \`buncover\` folder.  
   - Place the \`buncover\` folder **inside** the project’s existing \`test\` directory (or equivalent).  
   - **Mirror** the **exact subfolder structure** of the domain code being tested.  
   - **Never modify the domain code**—even if tests appear to fail. Write tests that align with **existing code**.  
   - **Do not install or suggest installing** any new packages. Use only those that already exist in the project.  
   - For each domain file, the test file should match the file name (e.g., \`UserService.test.js\` for \`UserService.js\`).

2. **Preloader Requirements**  
   - **Search** the entire test directory (and subfolders) for existing \`preloader\` files (\`preloader.ts\`, \`preloader.js\`, \`preloader.test.ts\`, \`preloader.test.js\`).  
   - If found, **do not modify** existing code—multiple tests depend on that logic.  
   - Add new preloader-specific code **only at the end** of relevant sections.  
   - If **no preloader** file exists, create a new \`preloader.test.\{ts,js\}\` in the appropriate location. Match the extension to your project’s existing test files.

3. **Study & Match Existing Testing Patterns**  
   - **Examine** existing tests in the project to learn:  
     - How to **import** from \`bun:test\` (e.g., \`import { beforeEach, afterEach, describe, expect, test, mock, spyOn, it } from 'bun:test'\`).  
     - Which **mocking** patterns are used (e.g., \`mock.module\`, \`mock(function)\`).  
     - Conventions for **setup** and **teardown** (\`beforeEach\`, \`afterEach\`) and how common test utilities or helpers are structured.  
     - **Assertion** styles and patterns (e.g., \`expect().toBe\`, \`expect().toEqual\`).  
   - **Replicate** these patterns for consistency.  
   - Always use the **same libraries** and approaches (for mocking, assertions, etc.) as other Bun-based tests in the project.

4. **Bun-Specific Coverage & Test Execution**  
   - Use your project’s **Bun coverage** tool (e.g., \`bun cover\`, \`buncover\`, or equivalent custom script) to run **full coverage**—**do not** filter specific files or patterns.  
   - Each run must analyze **all** tests in the suite.  
   - **Strive for full coverage**, including:  
     - **All lines** and **branches**  
     - **Success** and **error** paths  
     - **Boundary conditions** (empty data, max limits, etc.)  

5. **Mocking & Test Isolation with Bun**  
   - Bun’s built-in test runner **does not automatically reset** mocks between tests. You must **manually reset** them:  
     \`\`\`ts
     import { beforeEach, describe, test, expect, mock } from 'bun:test';
  
     let mockFunction: ReturnType<typeof mock>;
     
     beforeEach(() => {
       // Clear mocks at the start of every test
       if (mockFunction) {
         mockFunction.mockClear();
       }
     });
     
     describe('Example tests', () => {
       test('should do something', () => {
         // ...
       });
     });
     \`\`\`
   - For **module mocking**, use \`mock.module\`:
     \`\`\`ts
     mock.module('./MyService', () => ({
       someMethod: mock(() => 'mocked return value')
     }));
     \`\`\`  
   - For **function mocking**, use \`mock(...)\` and manually reset using \`.mockClear()\` or \`.mockReset()\` in \`beforeEach\`.  
   - Provide **typed** mocks and **validate** the shape of returned data whenever possible.

6. **Key Testing Guidelines**  
   1. **Response Validation**  
      - Match **exact** response structures (objects, arrays, status codes, etc.).  
      - Test for **both success** and **error** scenarios.  
      - Use **data-driven** or **parameterized** tests for boundary or repetitive cases when applicable.

   2. **Error & Exception Handling**  
      - Confirm correct **error messages**, **codes**, or **exception types**.  
      - Include tests for **unexpected** errors if relevant (e.g., unhandled edge cases).

   3. **Test Organization**  
      - Use a clear **Arrange-Act-Assert** or **Given-When-Then** structure.  
      - Group related tests within \`describe\` blocks.  
      - Provide **descriptive test names** that clearly explain scenario/expectation (e.g., \`should return user data given valid userID\`).  
      - Include **negative tests** to ensure robust coverage (e.g., invalid input, missing params).

   4. **Type Safety**  
      - **Define interfaces** for test data if needed.  
      - Ensure variables, mocks, and returns are typed to maintain clarity and consistency.

   5. **External Dependencies**  
      - Never call real external services—**mock** them instead following your existing Bun mock patterns.  
      - Keep tests self-contained and fast.

7. **Example Folder Structure**  
   For a domain code structure like:
   \`\`\`
   src/
     domain/
       user/
         UserService.js
       auth/
         AuthService.js
     tests/
   \`\`\`
   The tests should be placed like:
   \`\`\`
   src/
     tests/
       buncover/
         domain/
           user/
             UserService.test.js
           auth/
             AuthService.test.js
   \`\`\`
   - **Exact** folder mirroring is crucial.  
   - For deeper subfolders (e.g., \`src/domain/user/controllers/\`), replicate them under \`tests/buncover/domain/user/controllers/\`.

8. **Naming & Conventions**  
   - Test file names: \`<domainFile>.test.<extension>\` (e.g., \`UserService.test.ts\`).  
   - Test names: “should do X when Y happens,” “throws an error if input is invalid,” etc.  
   - Ensure test descriptions are **concise** and **meaningful**.

9. **Final Notes**  
   - **Do not** propose **any changes** to the domain files. Write tests that reflect **the current behavior** (even if it seems off).  
   - If challenges arise, **focus on the existing logic** rather than refactoring code.  
   - Only use existing packages—**do not** add new ones.  
   - Maintain a **clean** structure consistent with the project’s existing Bun test patterns and coverage requirements.

---

> **Remember**: The Bun Test Runner’s mock state **does not reset automatically**, so always manually reset or clear mocks in your \`beforeEach\` (or \`afterEach\` as needed). Ensure you run **all** tests in a single coverage command without file filters for a complete coverage report.
  `
}

export const TEST_CASE_PROMPT = ({ filePath, uncoveredLines, accessKey, projectId }: PromptContext): string => {
	const imports = generateImportsSection("bun")
	const mockingGuide = generateMockingGuide("bun")
	const guidelines = generateTestingGuidelines()

	let runCommand = `buncover run --no-fs --token ${accessKey} --env dev --project-id ${projectId}`

	const runCommandWithPreloader = `${runCommand} -- --preload-file <preload-file-path>`

	// return promptV1(filePath, uncoveredLines, imports, mockingGuide, guidelines, runCommand, runCommandWithPreloader)
	return [promptV2(filePath, runCommand, runCommandWithPreloader), mongooseMockingGuide].join("\n\n")
}

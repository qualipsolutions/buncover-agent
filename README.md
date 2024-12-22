# BunCover VSCode Extension

<p align="center">
  <img src="assets/docs/demo.gif" width="100%" />
</p>

<div align="center">
<table>
<tbody>
<td align="center">
<a href="https://marketplace.visualstudio.com/items?itemName=buncover" target="_blank"><strong>Download on VS Marketplace</strong></a>
</td>
<td align="center">
<a href="https://buncover.dev" target="_blank"><strong>Visit BunCover</strong></a>
</td>
<td align="center">
<a href="https://discord.gg/buncover" target="_blank"><strong>Join Discord</strong></a>
</td>
</tbody>
</table>
</div>

The official VS Code extension for [BunCover](https://buncover.dev) - Your intelligent test coverage companion for Bun projects. This extension provides seamless integration with BunCover's platform, allowing you to view and analyze your test coverage directly in VS Code.

## Features

### 🔍 Coverage Analytics in Your Editor
- View project-wide coverage statistics
- See file-level coverage metrics
- Track uncovered lines and functions
- Monitor coverage trends over time
- Visualize coverage distribution

### 💻 Source Code Integration
- Interactive source code viewer with coverage highlighting
- Line-by-line coverage details
- Quick navigation to uncovered sections
- AI-powered test suggestions
- Real-time updates as you code

### 📊 Project Management
- Switch between multiple projects
- Access historical coverage data
- View project analytics dashboard
- Track coverage goals and progress

### 🎯 AI-Powered Testing Assistant
- Generate test cases for uncovered code
- Get intelligent suggestions for improving coverage
- Analyze test patterns and recommend improvements
- Automated test maintenance and updates

### 🔄 Real-Time Updates
- Live coverage updates as you run tests
- Instant feedback on coverage changes
- Seamless sync with BunCover platform
- Team collaboration features

### 🤖 Advanced AI Integration
- Multiple AI provider support:
  - OpenRouter
  - Anthropic Claude
  - OpenAI
  - Google Gemini
  - AWS Bedrock
  - Azure OpenAI
  - GCP Vertex
- Local model support via LM Studio/Ollama
- Claude 3.5 Sonnet's agentic capabilities
- Token usage and cost tracking
- Model Context Protocol (MCP) support

### ⚡ Development Tools
- Intelligent file creation and editing
- Large project exploration and analysis
- Terminal command execution (with permission)
- Proactive error monitoring and fixing
- Headless browser testing capabilities
- Screenshot-based bug fixing
- Mockup-to-code conversion

### 🎨 Enhanced User Experience
- Flexible interface:
  - Sidebar view
  - Tab view
  - Split view support
- Task history tracking
- Settings management
- MCP server integration
- Human-in-the-loop approval system
- VS Code shell integration

## Getting Started

1. Sign up for a BunCover account at [buncover.dev](https://buncover.dev)
2. Install the BunCover VS Code extension
3. Configure your API key in the extension settings
4. Run your tests with Bun's coverage enabled:
   ```bash
   bun test --coverage
   ```
5. View your coverage data directly in VS Code!

## Requirements

- VS Code 1.84.0 or higher
- Bun runtime installed
- Active BunCover subscription
- Internet connection for syncing with BunCover platform
- (Optional) AI provider API keys for enhanced features

## Extension Settings

This extension contributes the following settings:

### Coverage Settings
* `buncover.apiKey`: Your BunCover API key
* `buncover.endpoint`: BunCover API endpoint (defaults to https://api.buncover.dev)
* `buncover.autoSync`: Enable/disable automatic syncing of coverage data
* `buncover.showCoverage`: Enable/disable inline coverage highlighting
* `buncover.notifications`: Enable/disable coverage update notifications

### AI Integration Settings
* `buncover.ai.provider`: Selected AI provider (OpenRouter/Anthropic/OpenAI/etc.)
* `buncover.ai.apiKey`: API key for selected AI provider
* `buncover.ai.costTracking`: Enable/disable AI cost tracking
* `buncover.ai.localModel`: Local model configuration for LM Studio/Ollama

### Development Settings
* `buncover.terminal.autoApprove`: Auto-approve safe terminal commands
* `buncover.browser.headless`: Enable/disable headless browser features
* `buncover.mcp.servers`: Custom MCP server configurations

## Commands

### Coverage Commands
* `BunCover: Sign In` - Sign in to your BunCover account
* `BunCover: View Coverage Report` - Open the coverage report panel
* `BunCover: Generate Tests` - Generate tests for selected code
* `BunCover: Sync Coverage Data` - Manually sync coverage data
* `BunCover: Open in Browser` - Open current file in BunCover web interface

### AI & Development Commands
* `BunCover: Configure AI` - Set up AI provider settings
* `BunCover: Track Costs` - View AI usage and costs
* `BunCover: Manage MCP` - Configure MCP servers
* `BunCover: Terminal History` - View command execution history
* `BunCover: Browser Tools` - Access headless browser features

## Tips & Tricks

> [!TIP]
> - Use `CMD/CTRL + Shift + P` to open the command palette
> - Type "BunCover: " to see all available commands
> - Use the sidebar for quick access to coverage reports
> - Enable auto-sync for real-time coverage updates
> - Configure AI providers for enhanced test generation
> - Use MCP servers to extend functionality

## Contributing

We welcome contributions! Please see our [contributing guidelines](https://github.com/buncover/buncover-agent/CONTRIBUTING.md) for more details.

## Support

- Documentation: [docs.buncover.dev](https://docs.buncover.dev)
- Issues: [GitHub Issues](https://github.com/buncover/buncover-agent/issues)
- Discord: [Join our community](https://discord.gg/buncover)
- Email: support@buncover.dev

## License

[Apache 2.0 2024 BunCover Inc.](./LICENSE)

import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { memo } from "react"
// import VSCodeButtonLink from "./VSCodeButtonLink"
// import { getOpenRouterAuthUrl } from "./ApiOptions"
// import { vscode } from "../utils/vscode"

interface AnnouncementProps {
	version: string
	hideAnnouncement: () => void
}
/*
You must update the latestAnnouncementId in BunCoverProvider for new announcements to show to users. This new id will be compared with whats in state for the 'last announcement shown', and if it's different then the announcement will render. As soon as an announcement is shown, the id will be updated in state. This ensures that announcements are not shown more than once, even if the user doesn't close it themselves.
*/
const Announcement = ({ version, hideAnnouncement }: AnnouncementProps) => {
	const minorVersion = version.split(".").slice(0, 2).join(".") // 2.0.0 -> 2.0
	return (
		<div
			style={{
				backgroundColor: "var(--vscode-editor-inactiveSelectionBackground)",
				borderRadius: "3px",
				padding: "12px 16px",
				margin: "5px 15px 5px 15px",
				position: "relative",
				flexShrink: 0,
			}}>
			<VSCodeButton
				appearance="icon"
				onClick={hideAnnouncement}
				style={{ position: "absolute", top: "8px", right: "8px" }}>
				<span className="codicon codicon-close"></span>
			</VSCodeButton>
			<h3 style={{ margin: "0 0 8px" }}>
				🎉{"  "}New in v{minorVersion}
			</h3>
			<ul style={{ margin: "0 0 8px", paddingLeft: "12px" }}>
				<li>
					<b>Test Coverage Analysis:</b> BunCover now provides detailed test coverage analysis for your Bun
					projects, helping you identify untested code paths and improve test quality.
				</li>
				<li>
					<b>AI-Powered Test Generation:</b> Automatically generate test cases for your Bun projects with
					intelligent analysis of your codebase.
				</li>
				<li>
					<b>.buncoverrules:</b> Add a root-level <code>.buncoverrules</code> file to specify custom test
					coverage rules and patterns for your project.
				</li>
			</ul>
			<p style={{ margin: "5px 0px", fontWeight: "bold" }}>Latest Updates:</p>
			<ul style={{ margin: "0 0 8px", paddingLeft: "12px" }}>
				<li>
					<b>Real-time Coverage Updates:</b> Watch your test coverage improve in real-time as you write tests
					or let BunCover generate them for you.
				</li>
				<li>
					<b>Coverage Insights:</b> Get detailed insights into your test coverage, including branch, line, and
					function coverage metrics.
				</li>
				<li>
					<b>Custom Rules:</b> Define custom coverage rules and thresholds for different parts of your
					codebase using the .buncoverrules file.
				</li>
			</ul>
			<div
				style={{
					height: "1px",
					background: "var(--vscode-foreground)",
					opacity: 0.1,
					margin: "8px 0",
				}}
			/>
			<p style={{ margin: "0" }}>
				Visit
				<VSCodeLink style={{ display: "inline" }} href="https://buncover.dev">
					buncover.dev
				</VSCodeLink>
				for documentation and updates!
			</p>
		</div>
	)
}

export default memo(Announcement)

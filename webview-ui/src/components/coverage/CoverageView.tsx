import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { vscode } from "../../utils/vscode"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { useCallback } from "react"

type CoverageViewProps = {
	onDone: () => void
}

const CoverageView = ({ onDone }: CoverageViewProps) => {
	const errorColor = "var(--vscode-errorForeground)"

	const { apiConfiguration, workspaceSettings } = useExtensionState()

	const accessKey = apiConfiguration?.buncoverAccessKey
	const projectId = workspaceSettings?.buncoverProjectId

	const handleRunTests = useCallback(() => {
		if (!accessKey || !projectId) {
			return
		}
		vscode.postMessage({ type: "runTests" })
		onDone()
	}, [accessKey, projectId, onDone])

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: "flex",
				flexDirection: "column",
			}}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "10px 17px 10px 20px",
				}}>
				<h3 style={{ color: "var(--vscode-foreground)", margin: 0 }}>Coverage</h3>
				<VSCodeButton onClick={onDone}>Done</VSCodeButton>
			</div>

			<div style={{ flex: 1, overflow: "auto", padding: "0 20px" }}>
				<div
					style={{
						color: "var(--vscode-foreground)",
						fontSize: "13px",
						marginBottom: "20px",
						marginTop: "5px",
					}}>
					Run tests to generate a coverage report. Go to{" "}
					<VSCodeLink href="https://buncover.dev" style={{ display: "inline" }}>
						buncover.dev
					</VSCodeLink>{" "}
					to view your analytics and historical reports.
				</div>

				{!accessKey ||
					(!projectId && (
						<div style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
							<span className="codicon codicon-error" style={{ color: errorColor }}></span>
							<span style={{ color: errorColor, fontWeight: "bold", marginLeft: "2px" }}>
								Please set your BunCover credentials and project ID in the settings.
							</span>
						</div>
					))}

				{/* Run Coverage Report Button */}
				<div style={{ marginTop: "10px", width: "100%" }}>
					<VSCodeButton
						disabled={!accessKey || !projectId}
						appearance="secondary"
						style={{ width: "100%" }}
						onClick={handleRunTests}>
						<span className="codicon codicon-run-coverage" style={{ marginRight: "6px" }}></span>
						Run Tests
					</VSCodeButton>
				</div>

				{/* Bottom padding */}
				<div style={{ height: "20px" }} />
			</div>
		</div>
	)
}

export default CoverageView

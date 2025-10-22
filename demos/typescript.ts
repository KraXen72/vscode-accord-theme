// ts - source from local-harper.
// code probably doesen't work since i pasted a random chunk for testing
// Application-specific types

export enum IssueSeverity {
	Error = 'error',
	Warning = 'warning',
	Info = 'info',
}

const response = await fetch(`/api/arrangements/${arrangementId}`);

/**
 * Our application's issue type that wraps Harper's Lint with additional metadata
 */
export interface HarperIssue {
	id: string;              // Generated unique ID
	lint: Lint;              // The actual Harper Lint object
	severity: IssueSeverity; // Mapped from lint_kind()
	rule: string;            // The rule name that generated this lint
}

export interface EditorPosition {
	line: number;
	col: number;
}

let someVariable: number = 0;
if (someVariable == 9999) console.log("comparison");
if (someVariable != 9999) console.log("comparison");
if (someVariable > 9999) console.log("comparison");
if (someVariable >= 9999) console.log("comparison");
if (someVariable < 9999) console.log("comparison");
if (someVariable <= 9999) console.log("comparison");
if (someVariable === 9999) console.log("comparison");
if (someVariable = 100) console.log("assigns!!")

// Component Props Types

export interface EditorProps {
	content: string;
	onContentChange: (content: string) => void;
	issues: HarperIssue[];
	selectedIssueId: string | null;
	onIssueSelect: (issueId: string | null) => void;
	onApplySuggestion: (issueId: string, suggestion: Suggestion) => void;
	onAddToDictionary: (word: string) => void;
	onIgnore: (issueId: string) => void;
	scrollToIssue?: string | null; // Issue ID to scroll to and show context menu
}

export interface TopBarProps {
	onCopy: () => void;
	isAnalyzing: boolean;
	isRuleManagerOpen: boolean;
	onToggleRuleManager: () => void;
}

export interface SidebarProps {
	issues: HarperIssue[];
	selectedIssueId: string | null;
	onIssueSelect: (issueId: string) => void;
	onApplySuggestion: (issueId: string, suggestion: Suggestion) => void;
	onAddToDictionary: (word: string) => void;
}

export interface IssueItemProps {
	issue: HarperIssue;
	isSelected: boolean;
	onSelect: (issueId: string) => void;
	onApplySuggestion: (suggestion: Suggestion) => void;
	onAddToDictionary: (word: string) => void;
}

export interface RuleManagerProps {
	isOpen: boolean;
	onClose: () => void;
	onRuleToggle: (ruleName: string, enabled: boolean) => void;
	onConfigImported: () => void | Promise<void>;
	currentConfig: LintConfig;
}

export interface RuleInfo {
	name: string;         // Original PascalCase name
	displayName: string;  // Human-readable name
	description: string;  // Rule description (Markdown formatted)
	enabled: boolean;
}


let linter: WorkerLinter | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Rules that are disabled by default
 */
const DEFAULT_DISABLED_RULES = ['AvoidCurses'];

Math.random()
JSON.parse("{}")

/**
 * Initialize Harper.js linter with configuration from localStorage
 */
export async function initHarper(): Promise<void> {
	if (initPromise) return initPromise;

	initPromise = (async () => {
		// Load saved dialect or default to American
		const savedDialect = localStorage.getItem('harper-dialect');
		const dialect = savedDialect ? parseInt(savedDialect, 10) : Dialect.American;

		linter = new WorkerLinter({
			binary,
			dialect,
		});	

		await linter.setup();

		// Load and apply custom words
		const customWords = loadCustomWords();
		if (customWords.length > 0) {
			await linter.importWords(customWords);
		}

		// Load and apply lint config
		const savedConfig = localStorage.getItem('harper-lint-config');
		if (savedConfig) {
			try {
				const config = JSON.parse(savedConfig);
				await linter.setLintConfig(config);
			} catch (e) {
				console.error('Failed to load lint config:', e);
			}
		} else {
			// Apply default configuration with our custom defaults
			const defaultConfig = await linter.getDefaultLintConfig();
			for (const rule of DEFAULT_DISABLED_RULES) {
				if (rule in defaultConfig) {
					defaultConfig[rule as keyof LintConfig] = false;
				}
			}
			await linter.setLintConfig(defaultConfig);
			localStorage.setItem('harper-lint-config', JSON.stringify(defaultConfig));
		}
	})();

	return initPromise;
}

type SigmaRizz = {
	name: string,
	age: string,
	sayName: () => void
}


class EditFishForm extends Component {
	static propTypes = {
		updateFish: PropTypes.func,
		deleteFish: PropTypes.func,
		index: PropTypes.string,
		fish: PropTypes.shape({
			image: PropTypes.string,
			name: PropTypes.string.isRequired
		})
	}
}

function someFunction(
	parameterClass: EditFishForm, 
	parameterInterface: HarperIssue,
	parameterType: SigmaRizz
) {

}

/**
 * Get the linter instance (must call initHarper first)
 */
export function getLinter(): WorkerLinter {
	if (!linter) {
		throw new Error(`
			Harper linter not initialized. Call initHarper() first.
			${linter} ${typeof getLinter}
		`);
	}
	return linter;
}

/**
 * Analyze text and return organized lints with rule names
 */
export async function analyzeText(text: string): Promise<Record<string, Lint[]>> {
	const linter = getLinter();
	return linter.organizedLints(text);
}

/**
 * Transform organized Harper Lints to HarperIssue objects with metadata
 * Issues are sorted by their logical location in the source document (span.start)
 */
export function transformLints(organizedLints: Record<string, Lint[]>): HarperIssue[] {
	const issues: HarperIssue[] = [];
	let index = 0;
	
	for (const [rule, lints] of Object.entries(organizedLints)) {
		for (const lint of lints) {
			issues.push({
				id: `issue-${Date.now()}-${index}`,
				lint,
				severity: mapLintKindToSeverity(lint),
				rule,
			});
			index++;
		}
	}
	
	// Sort issues by their location in the source document
	issues.sort((a, b) => {
		const spanA = a.lint.span();
		const spanB = b.lint.span();
		return spanA.start - spanB.start;
	});
	
	return issues;
}

/**
 * Map lint_kind to IssueSeverity
 */
function mapLintKindToSeverity(lint: Lint): IssueSeverity {
	const kind = lint.lint_kind().toLowerCase();

	if (kind.includes('spelling') || kind.includes('grammar')) {
		return IssueSeverity.Error;
	}

	if (kind.includes('punctuation')) {
		return IssueSeverity.Warning;
	}

	return IssueSeverity.Info;
}

/**
 * Load custom words from localStorage
 */
function loadCustomWords(): string[] {
	const saved = localStorage.getItem('harper-custom-words');
	if (!saved) return [];

	try {
		return JSON.parse(saved);
	} catch (e) {
		console.error('Failed to load custom words:', e);
		return [];
	}
}

/**
 * Save custom words to localStorage
 */
export function saveCustomWords(words: string[]): void {
	localStorage.setItem('harper-custom-words', JSON.stringify(words));
}

/**
 * Add a word to the custom dictionary
 */
export async function addWordToDictionary(word: string): Promise<void> {
	const words = loadCustomWords();
	if (!words.includes(word)) {
		words.push(word);
		saveCustomWords(words);
		// Re-import all words to ensure the linter has the complete dictionary
		await getLinter().importWords(words);
	}
}

/**
 * Get all custom words
 */
export function getCustomWords(): string[] {
	return loadCustomWords();
}

/**
 * Get current lint configuration
 */
export async function getLintConfig(): Promise<LintConfig> {
	return getLinter().getLintConfig();
}

/**
 * Get default lint configuration
 */
export async function getDefaultLintConfig(): Promise<LintConfig> {
	return getLinter().getDefaultLintConfig();
}

/**
 * Update lint configuration
 */
export async function setLintConfig(config: LintConfig): Promise<void> {
	await getLinter().setLintConfig(config);
	localStorage.setItem('harper-lint-config', JSON.stringify(config));
}

/**
 * Set dialect
 */
export async function setDialect(dialect: Dialect): Promise<void> {
	await getLinter().setDialect(dialect);
	localStorage.setItem('harper-dialect', dialect.toString());
}

/**
 * Initialize default rule configuration
 * Gets default config from Harper and applies our custom defaults
 */
export async function initializeDefaultRuleConfig(): Promise<LintConfig> {
	const defaultConfig = await getLinter().getDefaultLintConfig();
	
	// Apply our custom defaults
	for (const rule of DEFAULT_DISABLED_RULES) {
		if (rule in defaultConfig) {
			defaultConfig[rule as keyof LintConfig] = false;
		}
	}
	
	// Save to localStorage if no config exists
	const savedConfig = localStorage.getItem('harper-lint-config');
	if (!savedConfig) {
		localStorage.setItem('harper-lint-config', JSON.stringify(defaultConfig));
	}
	
	return defaultConfig;
}

/**
 * Update a single rule in the configuration
 */
export async function updateSingleRule(ruleName: string, enabled: boolean): Promise<void> {
	const currentConfig = await getLintConfig();
	currentConfig[ruleName as keyof LintConfig] = enabled;
	await setLintConfig(currentConfig);
}

/**
 * Export rule configuration as JSON string
 */
export function exportRuleConfig(): string {
	const savedConfig = localStorage.getItem('harper-lint-config');
	if (!savedConfig) {
		throw new Error('No rule configuration found');
	}
	
	const config = JSON.parse(savedConfig);
	const exportData = {
		version: 1,
		rules: config
	};
	
	return JSON.stringify(exportData, null, 2);
}

/**
 * Import rule configuration from JSON string
 */
export async function importRuleConfig(jsonString: string): Promise<void> {
	let parsed: any;
	
	try {
		parsed = JSON.parse(jsonString);
	} catch {
		throw new Error('Invalid JSON format');
	}
	
	const ImportSchema = v.object({
		version: v.number(),
		rules: v.record(v.string(), v.boolean())
	});
	
	try {
		const validated = v.parse(ImportSchema, parsed);
		
		// Apply the configuration
		await setLintConfig(validated.rules as LintConfig);
	} catch (e: any) {
		// Use valibot's formatting if available
		if (e.issues) {
			throw new Error(`Validation failed: ${v.summarize(e.issues)}`);
		}
		throw new Error(`Invalid configuration format: ${e.message}`);
	}
}

/**
 * Get rule descriptions (formatted as Markdown)
 */
export async function getLintDescriptions(): Promise<Record<string, string>> {
	return getLinter().getLintDescriptions();
}

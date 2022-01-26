import { App, Editor, MarkdownPostProcessor, MarkdownPostProcessorContext, MarkdownRenderChild, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

interface CBLSettings {
	showLanguageAsLabel: boolean;
}

const DEFAULT_SETTINGS: CBLSettings = {
	showLanguageAsLabel: true,
}

const REGEX_CODEBLOCK_LABEL = /^```(?<lang>[^\s]+)?\s*(?:{(?<label>[^}]+)})?/

export default class CBLPlugin extends Plugin {
	settings: CBLSettings;

	async onload() {
		await this.loadSettings();

		// filename => (position, cbTop)
		var cache: Map<string, {}>;

		this.registerMarkdownPostProcessor((el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			var section = ctx.getSectionInfo(el);
			if (section == null) { return; }

			// Get the text that corresponds to this section
			var lines = section.text.split("\n").map(s => s.trim());
			var raw = lines.slice(section.lineStart, section.lineEnd + 1);

			// Check if this is a code block, and if not return early
			if (raw.length < 2 || !raw[0].startsWith("```") || !raw.last().endsWith("```")) { return; }

			// Look for a label on the first line
			var match = raw[0].match(REGEX_CODEBLOCK_LABEL);
			if (match == null) { return; }

			// Get capture groups
			var lang = match.groups["lang"];
			var label = match.groups["label"];

			console.log(`Code block: ${lang} -- ${label}`);

			// Determine what to show in the label
			var labelText = null;
			// Prefer to show an explicitly set label
			if (label != null) { labelText = label; }
			// Otherwise, if the showLanguageAsLabel setting is set, use the language if specified
			else if (lang != null && this.settings.showLanguageAsLabel) { labelText = lang; }

			// Return early if there's no label to show
			if (labelText == null) { return; }

			// Add a label element
			var labelEl = document.createElement("p");
			labelEl.setText(labelText);
			labelEl.addClass("codeblock-label");
			el.prepend(labelEl);
			ctx.addChild(new MarkdownRenderChild(labelEl));
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new CBLSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class CBLSettingTab extends PluginSettingTab {
	plugin: CBLPlugin;

	constructor(app: App, plugin: CBLPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Code Block Label Settings' });

		new Setting(containerEl)
			.setName('Show Language as Label')
			.setDesc('If no label is given but there is a set highlight language show that language as the label.')
			.addToggle(tgl => tgl
				.setValue(this.plugin.settings.showLanguageAsLabel)
				.onChange(async (value) => {
					this.plugin.settings.showLanguageAsLabel = value;
					await this.plugin.saveSettings();
				}));
	}
}

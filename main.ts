import { App, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
declare module "obsidian" {
    interface WorkspaceLeaf {
        containerEl: HTMLElement;
    }
}
const pluginName = 'Murf Sample Plugin for Testing';

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;
    ribbonIconTitle: string;

	async onload() {
        console.log("loading plugin: " + pluginName);
		console.log('testing this from github.dev');

		await this.loadSettings();

        this.ribbonIconTitle = 'Murf Sample Plugin';
        this.addRibbonIcon('dice', this.ribbonIconTitle, () => {
			new Notice('This is a notice!');
		});

		this.addStatusBarItem().setText('Status Bar Text');

		this.addCommand({
			id: 'open-sample-modal',
			name: 'Open Sample Modal',
			// callback: () => {
			// 	console.log('Simple Callback');
			// },
			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {
						new SampleModal(this.app).open();
					}
					return true;
				}
				return false;
			}
		});

		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			console.log('codemirror', cm);
		});

		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

        this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

        //onLayoutReady should wait until Obsidian loads all plugins on startup
        this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
    }

    onLayoutReady(): void {
        console.log('running after everything is loaded on startup');
        const myRibbonIcon = document.querySelector(`.side-dock-ribbon-action[aria-label="${this.ribbonIconTitle}`) as HTMLElement;
        if (myRibbonIcon) {
            this.registerDomEvent(myRibbonIcon, 'contextmenu', (evt: MouseEvent) => {
                evt.preventDefault();
                console.log('right click ribbon icon');
            });
        }
    }

	onunload() {
        console.log("Unloading plugin: " + pluginName);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue('')
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}

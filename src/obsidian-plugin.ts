import {
    Plugin,
    Notice,
    WorkspaceLeaf,
    ItemView,
    addIcon,
    PluginSettingTab,
    App,
    Setting,
    Platform,
} from 'obsidian';
import { jumpToWord } from './utils/utils.ts';
import { createRoot } from 'react-dom/client';
import * as React from 'react';
import MainApp from './MainApp';
import { MarkdownWordStorage, WordHelper } from './MarkdownWordStorage';
import type { Word } from './MarkdownWordStorage';
import { formatTimestamp } from './utils/date';

const VIEW_TYPE_WORD_MANAGER = 'word-manager-view';

// 插件设置接口
interface LanguageAssistantSettings {
    wordsFilePath: string; // 单词文件路径
}

// 默认设置
const DEFAULT_SETTINGS: LanguageAssistantSettings = {
    wordsFilePath: 'words.md', // 默认在根目录
};

// 添加一个简单的图标（可自定义 SVG）
addIcon(
    'word-book',
    '<svg viewBox="0 0 100 100" width="100" height="100"><rect x="15" y="20" width="70" height="60" rx="10" fill="#a78bfa"/><rect x="25" y="30" width="50" height="40" rx="5" fill="#fff"/></svg>',
);

export default class LanguageAssistantPlugin extends Plugin {
    settings!: LanguageAssistantSettings;
    async onload() {
        console.log('Language Assistant Obsidian 插件已加载');

        try {
            // 加载设置
            await this.loadSettings();
        } catch (error) {
            console.error('加载设置失败:', error);
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            new Notice(`加载插件设置失败: ${errorMessage}，将使用默认设置`);
            this.settings = { ...DEFAULT_SETTINGS };
        }

        this.registerView(
            VIEW_TYPE_WORD_MANAGER,
            // NOTE: WordManagerView 创建的位置
            (leaf) => new WordManagerView(leaf, this),
        );

        // 添加设置选项卡
        this.addSettingTab(new LanguageAssistantSettingTab(this.app, this));
        this.addCommand({
            id: 'roll-dice',
            name: 'Roll a Dice',
            callback: () => {
                const result = Math.floor(Math.random() * 6) + 1;
                new Notice(`你掷出了：${result}`);
            },
        });
        this.addCommand({
            id: 'open-word-manager',
            name: '打开单词管理页面',
            callback: () => this.openWordManagerLeaf(),
        });
        // 添加 ribon 按钮
        this.addRibbonIcon('word-book', '单词管理', () => {
            this.openWordManagerLeaf();
        });
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        );
    }
    async saveSettings() {
        try {
            await this.saveData(this.settings);
        } catch (error) {
            console.error('保存设置失败:', error);
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            new Notice(`保存插件设置失败: ${errorMessage}`);
            throw error;
        }
    }

    onunload() {
        console.log('Language Assistant Obsidian 插件已卸载');
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_WORD_MANAGER);
    }

    async openWordManagerLeaf() {
        const existingLeaf =
            this.app.workspace.getLeavesOfType(VIEW_TYPE_WORD_MANAGER)[0];
        if (existingLeaf) {
            this.app.workspace.revealLeaf(existingLeaf);
            if (existingLeaf.view instanceof WordManagerView) {
                await existingLeaf.view.refreshWords();
            }
            return;
        }

        const leaf = Platform.isMobile
            ? this.app.workspace.getLeaf(true)
            : this.app.workspace.getRightLeaf(false);
        if (leaf) {
            await leaf.setViewState({
                type: VIEW_TYPE_WORD_MANAGER,
                active: true,
            });
            this.app.workspace.revealLeaf(leaf);
        }
    }
}

export class WordManagerView extends ItemView {
    root: ReturnType<typeof createRoot> | null = null;
    private wordStorage: MarkdownWordStorage;
    private words: Word[] = [];
    private renderKey: number = 0; // 添加渲染键用于强制刷新
    private plugin: LanguageAssistantPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: LanguageAssistantPlugin) {
        super(leaf);
        this.plugin = plugin;
        // 使用插件设置中的文件路径初始化 Markdown 存储器
        this.wordStorage = new MarkdownWordStorage(
            this.app.vault,
            plugin.settings.wordsFilePath,
        );
    }

    // 更新存储文件路径
    public updateStoragePath(newPath: string) {
        console.log(
            `更新存储路径: ${this.plugin.settings.wordsFilePath} → ${newPath}`,
        );
        this.wordStorage = new MarkdownWordStorage(this.app.vault, newPath);
        // 重新加载数据
        this.onOpen();
    }

    // 生成 UUID
    private generateId(): string {
        return (
            'word-' +
            Math.random().toString(36).substr(2, 9) +
            '-' +
            Date.now().toString(36)
        );
    }

    // 跳转到单词文件中的指定单词位置
    // NOTE: 重构该方法
    private async jumpToWordInMarkdown(wordId: string): Promise<void> {
        jumpToWord.bind(this, wordId)();
    }

    getViewType() {
        return VIEW_TYPE_WORD_MANAGER;
    }

    getDisplayText() {
        return '单词管理';
    }

    public async refreshWords(): Promise<void> {
        console.log('刷新已打开的单词管理视图...');
        try {
            const parseResult =
                await this.wordStorage.loadWordsWithDuplicateInfo();
            this.words = parseResult.words;
            this.renderComponent();
        } catch (error) {
            console.error('刷新单词管理视图失败:', error);
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            new Notice(`刷新单词管理视图失败: ${errorMessage}`);
        }
    }

    async onOpen() {
        console.log('正在加载单词数据...');
        try {
            // 从 words.md 文件加载现有单词数据，包含重复信息
            const parseResult =
                await this.wordStorage.loadWordsWithDuplicateInfo();
            // NOTE: words 从这里加载
            this.words = parseResult.words;
            console.log(`成功加载 ${this.words.length} 个单词`);

            // 显示重复信息给用户
            if (parseResult.duplicates.length > 0) {
                const duplicateNames = parseResult.duplicates
                    .map((d) => `"${d.name}"`)
                    .join(', ');
                new Notice(
                    `发现重复单词: ${duplicateNames}。已自动去重，保留了最新版本。`,
                    8000,
                );
                console.warn(
                    `发现 ${parseResult.duplicates.length} 个重复单词，详细信息请查看控制台`,
                );
            }

            if (this.words.length === 0) {
                new Notice('未找到单词数据，您可以开始添加新单词！');
            } else {
                const message =
                    parseResult.duplicates.length > 0
                        ? `加载了 ${this.words.length} 个单词 (已去重)`
                        : `加载了 ${this.words.length} 个单词`;
                new Notice(message);
            }
        } catch (error) {
            console.error('加载单词失败:', error);
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            new Notice(`加载单词失败: ${errorMessage}`);
            this.words = [];
        }

        this.root = createRoot(this.containerEl);
        this.renderComponent();
    }
    private renderComponent() {
        // 增加渲染键以确保组件重新渲染
        this.renderKey++;
        if (this.root) {
            this.root.render(
                React.createElement(MainApp, {
                    key: this.renderKey, // 添加key强制重新渲染
                    words: [...this.words], // 创建新数组引用确保React检测到变化
                    onAdd: this.handleAddWord.bind(this),
                    onEdit: this.handleEditWord.bind(this),
                    onDelete: this.handleDeleteWord.bind(this),
                    onBatchUpdate: this.handleBatchUpdateWords.bind(this), // 新增批量更新方法
                    onJumpToSource: this.jumpToWordInMarkdown.bind(this),
                }),
            );
            console.log(
                `界面已重新渲染 (key: ${this.renderKey}, words: ${this.words.length})`,
            );
        }
    } // 静默渲染：仅更新数据，不改变 key，保持UI状态
    private renderComponentSilently() {
        if (this.root) {
            this.root.render(
                React.createElement(MainApp, {
                    key: this.renderKey, // 保持相同的 key，不重置组件状态
                    words: [...this.words], // 创建新数组引用确保React检测到变化
                    onAdd: this.handleAddWord.bind(this),
                    onEdit: this.handleEditWord.bind(this),
                    onDelete: this.handleDeleteWord.bind(this),
                    onBatchUpdate: this.handleBatchUpdateWords.bind(this),
                    onJumpToSource: this.jumpToWordInMarkdown.bind(this),
                }),
            );
            console.log(
                `静默更新数据 (key: ${this.renderKey}, words: ${this.words.length})`,
            );
        }
    }

    // 强制刷新界面的辅助方法（会重置UI状态）
    private forceRefreshUI() {
        console.log('强制刷新UI...');
        this.renderComponent();

        // 使用 setTimeout 确保在下一个事件循环中再次刷新
        setTimeout(() => {
            console.log('延迟刷新UI...');
            this.renderComponent();
        }, 100);
    }
    private async handleAddWord(word: Word) {
        console.log('尝试添加新单词:', word.name);
        try {
            // 检查是否已存在同名单词
            const existingIndex = this.words.findIndex(
                (w) => w.name === word.name,
            );
            if (existingIndex >= 0) {
                new Notice(
                    `单词 "${word.name}" 已存在！请使用编辑功能或选择不同名称`,
                );
                return;
            } // 如果没有ID，生成一个新的
            if (!WordHelper.getId(word)) {
                WordHelper.setId(word, this.generateId());
                console.log('🆔 为新单词生成ID:', WordHelper.getId(word));
            }

            // 添加到本地数组
            this.words.push(word);
            console.log('单词已添加到本地数组，正在保存到文件...'); // 立即更新界面显示新数据
            this.forceRefreshUI();

            // 保存到 words.md 文件
            await this.wordStorage.saveWords(this.words);
            console.log('已保存到 words.md 文件');

            // 保存成功后再次确保界面更新
            this.forceRefreshUI();

            new Notice(`成功添加单词 "${word.name}" 并保存到 words.md`);
        } catch (error) {
            console.error('添加单词失败:', error);
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            new Notice(`添加单词失败: ${errorMessage}`);
            // 如果保存失败，从数组中移除
            this.words = this.words.filter((w) => w.name !== word.name);
            this.renderComponent();
        }
    }
    // NOTE: handleEditWord 的定义位置
    private async handleEditWord(
        editedWord: Word,
        originalWord?: Word,
        silent: boolean = false,
    ) {
        console.log('尝试编辑单词:', editedWord.name);
        try {
            // 如果提供了原始单词信息，使用原始单词名称查找
            const searchName = originalWord
                ? originalWord.name
                : editedWord.name;
            const index = this.words.findIndex((w) => w.name === searchName);

            if (index >= 0) {
                // 如果单词名称发生变化，检查新名称是否重复
                if (originalWord && editedWord.name !== originalWord.name) {
                    const nameExists = this.words.some(
                        (w) =>
                            w.name.toLowerCase() ===
                            editedWord.name.toLowerCase(),
                    );
                    if (nameExists) {
                        new Notice(
                            `单词 "${editedWord.name}" 已存在！请选择不同的名称`,
                        );
                        return;
                    }
                } // 更新本地数组
                const existingWord = this.words[index];
                const wordToSave: Word = silent
                    ? editedWord
                    : {
                          ...editedWord,
                          itemMeta: {
                              ...existingWord.itemMeta,
                              ...editedWord.itemMeta,
                              id:
                                  editedWord.itemMeta?.id ||
                                  existingWord.itemMeta.id,
                              createAt:
                                  editedWord.itemMeta?.createAt ||
                                  existingWord.itemMeta.createAt,
                              lastUpdate: formatTimestamp(),
                          },
                      };

                this.words[index] = wordToSave;
                console.log('单词已更新到本地数组，正在保存到文件...'); // 保存到文件
                await this.wordStorage.saveWords(this.words);
                console.log('已保存到 words.md 文件');

                // 非静默模式：强制刷新UI（重置状态），显示通知
                if (!silent) {
                    this.forceRefreshUI();
                    new Notice(
                        `成功编辑单词 "${editedWord.name}" 并保存到 words.md`,
                    );
                } else {
                    // 静默模式：仅更新数据，不重置UI状态
                    console.log(
                        '静默更新模式：已保存到文件和内存，仅更新数据不重置UI状态',
                    );
                    this.renderComponentSilently();
                }
            } else {
                new Notice(`未找到要编辑的单词 "${searchName}"`);
            }
        } catch (error) {
            console.error('编辑单词失败:', error);
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            new Notice(`编辑单词失败: ${errorMessage}`);
            // 发生错误时也要刷新界面，恢复原始状态
            this.forceRefreshUI();
        }
    }

    // 批量更新单词（用于元数据管理等操作）
    private async handleBatchUpdateWords(updatedWords: Word[]) {
        console.log(`批量更新 ${updatedWords.length} 个单词...`);
        try {
            // 更新本地数组中的单词
            updatedWords.forEach((updatedWord) => {
                const index = this.words.findIndex(
                    (w) => w.name === updatedWord.name,
                );
                if (index >= 0) {
                    this.words[index] = updatedWord;
                    console.log(`更新单词: ${updatedWord.name}`);
                }
            });

            // 立即更新界面
            this.forceRefreshUI();

            // 保存到文件
            await this.wordStorage.saveWords(this.words);
            console.log('批量更新已保存到 words.md 文件');

            // 保存成功后再次确保界面更新
            this.forceRefreshUI();

            new Notice(
                `已批量更新 ${updatedWords.length} 个单词并保存到文档`,
            );
        } catch (error) {
            console.error('批量更新单词失败:', error);
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            new Notice(`批量更新单词失败: ${errorMessage}`);
            // 发生错误时也要刷新界面
            this.forceRefreshUI();
            throw error;
        }
    }

    private async handleDeleteWord(wordName: string) {
        console.log('尝试删除单词:', wordName);
        try {
            const originalLength = this.words.length;

            // 从本地数组中移除
            this.words = this.words.filter((w) => w.name !== wordName);

            if (this.words.length < originalLength) {
                console.log('单词已从本地数组移除，正在保存到文件...'); // 立即更新界面显示删除后的数据
                this.forceRefreshUI();

                // 保存到文件
                await this.wordStorage.saveWords(this.words);
                console.log('已保存到 words.md 文件');

                // 保存成功后再次确保界面更新
                this.forceRefreshUI();

                new Notice(`成功删除单词 "${wordName}" 并更新 words.md`);
            } else {
                new Notice(`未找到要删除的单词 "${wordName}"`);
            }
        } catch (error) {
            console.error('删除单词失败:', error);
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            new Notice(`删除单词失败: ${errorMessage}`);
            // 发生错误时也要刷新界面
            this.forceRefreshUI();
        }
    }

    async onClose() {
        console.log('关闭单词管理界面');
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
    }
}

// 设置选项卡类
class LanguageAssistantSettingTab extends PluginSettingTab {
    plugin: LanguageAssistantPlugin;

    constructor(app: App, plugin: LanguageAssistantPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        // 标题
        containerEl.createEl('h2', { text: 'Language Assistant 设置' }); // 存储位置设置（带自动补全功能）
        this.createPathInputWithSuggestion(containerEl);

        // 路径示例说明
        const exampleEl = containerEl.createEl('div', {
            cls: 'setting-item-description',
        });
        exampleEl.innerHTML = `
            <strong>隐私保护示例：</strong><br>
            • <code>words.md</code> - 存储在根目录（默认）<br>
            • <code>private/words.md</code> - 存储在私有文件夹<br>
            • <code>.hidden/vocabulary.md</code> - 存储在隐藏文件夹<br>
            • <code>documents/language/my-words.md</code> - 存储在深层目录<br>
            <br>
            <strong>提示：</strong>使用文件夹可以更好地组织和保护您的单词数据
        `;

        // 当前状态显示
        const statusEl = containerEl.createEl('div', {
            cls: 'setting-item',
        });
        statusEl.innerHTML = `
            <div class="setting-item-info">
                <div class="setting-item-name">当前状态</div>
                <div class="setting-item-description">
                    <strong>存储路径：</strong><code>${this.plugin.settings.wordsFilePath}</code><br>
                    <strong>完整路径：</strong><code>vault/${this.plugin.settings.wordsFilePath}</code>
                </div>
            </div>
        `;

        // 操作按钮区域
        const actionsEl = containerEl.createEl('div', {
            cls: 'setting-item',
        });

        const actionsInfo = actionsEl.createEl('div', {
            cls: 'setting-item-info',
        });
        actionsInfo.createEl('div', {
            cls: 'setting-item-name',
            text: '快速操作',
        });

        const actionsControl = actionsEl.createEl('div', {
            cls: 'setting-item-control',
        });

        // 检查文件是否存在按钮
        const checkButton = actionsControl.createEl('button', {
            text: '检查文件',
            cls: 'mod-cta',
        });
        checkButton.onclick = async () => {
            const filePath = this.plugin.settings.wordsFilePath;
            const file = this.app.vault.getFileByPath(filePath);

            if (file) {
                new Notice(`文件存在: ${filePath}`);
                console.log('文件信息:', file);
            } else {
                new Notice(
                    `文件不存在: ${filePath}，将在首次添加单词时自动创建`,
                );
            }
        };

        // 重置为默认路径按钮
        const resetButton = actionsControl.createEl('button', {
            text: '重置默认',
            cls: 'mod-warning',
        });
        resetButton.style.marginLeft = '10px';
        // NOTE: 重置 Word.md 路径会重置
        resetButton.onclick = async () => {
            if (confirm('确定要重置存储路径为默认值 (words.md) 吗？')) {
                this.plugin.settings.wordsFilePath =
                    DEFAULT_SETTINGS.wordsFilePath;
                await this.plugin.saveSettings();

                // 刷新设置页面
                this.display();

                // 更新所有现有的视图
                this.plugin.app.workspace
                    .getLeavesOfType(VIEW_TYPE_WORD_MANAGER)
                    .forEach((leaf) => {
                        if (leaf.view instanceof WordManagerView) {
                            // NOTE: this 是 leaf.view
                            leaf.view.updateStoragePath(
                                DEFAULT_SETTINGS.wordsFilePath,
                            );
                        }
                    });

                new Notice(
                    `存储路径已重置为默认值: ${DEFAULT_SETTINGS.wordsFilePath}`,
                );
            }
        };

        // 安全提示
        const warningEl = containerEl.createEl('div', {
            cls: 'setting-item-description',
        });
        warningEl.style.marginTop = '20px';
        warningEl.style.padding = '10px';
        warningEl.style.backgroundColor = '#fff3cd';
        warningEl.style.border = '1px solid #ffeaa7';
        warningEl.style.borderRadius = '4px';
        warningEl.innerHTML = `
            <strong>重要提示：</strong><br>
            • 更改存储路径不会自动迁移现有数据<br>
            • 如需迁移，请手动复制文件到新位置<br>
            • 建议先备份现有单词数据<br>
            • 文件夹路径不存在时会自动创建
        `;
    }

    /**
     * 创建带自动补全功能的路径输入框
     */
    private createPathInputWithSuggestion(containerEl: HTMLElement): void {
        const setting = new Setting(containerEl)
            .setName('存储文件路径')
            .setDesc('设置单词数据的存储位置（支持自动补全）');

        const inputContainer = setting.controlEl.createEl('div', {
            cls: 'path-input-container',
        });
        inputContainer.style.position = 'relative';
        inputContainer.style.width = '100%';

        // 创建输入框
        const input = inputContainer.createEl('input', {
            type: 'text',
            placeholder: '输入 Markdown 文件路径，例如 words.md',
            value: this.plugin.settings.wordsFilePath,
        });
        input.style.width = '100%';
        input.style.paddingRight = '30px';

        // 创建建议下拉列表容器
        const suggestionContainer = inputContainer.createEl('div', {
            cls: 'la-path-suggestion-container',
        });
        suggestionContainer.style.display = 'none';

        // 当前选中的建议索引
        let selectedIndex = -1;
        let suggestions: string[] = []; // 获取建议列表
        const getSuggestions = (query: string): string[] => {
            if (!query) return [];

            const allFiles = this.app.vault.getFiles();
            const allFolders = this.app.vault
                .getAllLoadedFiles()
                .filter((file) => file.hasOwnProperty('children')) // 这是文件夹的特征
                .map((folder) => folder.path);

            const queryLower = query.toLowerCase();
            const suggestions: string[] = [];

            // 添加现有的.md文件建议
            allFiles
                .filter((file) => file.path.toLowerCase().includes(queryLower))
                .forEach((file) => {
                    if (file.extension === 'md') {
                        suggestions.push(file.path);
                    }
                });

            // 添加文件夹建议（用户可以在文件夹中创建新文件）
            allFolders
                .filter((folderPath) =>
                    folderPath.toLowerCase().includes(queryLower),
                )
                .forEach((folderPath) => {
                    // 建议在文件夹中创建.md文件
                    const suggestedPath = folderPath + '/words.md';
                    if (!suggestions.includes(suggestedPath)) {
                        suggestions.push(suggestedPath);
                    }
                });

            // 如果输入看起来像一个路径，添加直接建议
            if (query.includes('/') || query.endsWith('.md')) {
                if (!suggestions.includes(query) && query.endsWith('.md')) {
                    suggestions.unshift(query);
                }
            } else if (query) {
                // 为简单查询添加.md扩展名建议
                const mdSuggestion = query.endsWith('.md')
                    ? query
                    : query + '.md';
                if (!suggestions.includes(mdSuggestion)) {
                    suggestions.unshift(mdSuggestion);
                }
            }

            return suggestions.slice(0, 8); // 限制建议数量
        };

        // 渲染建议列表
        const renderSuggestions = (suggestionList: string[]): void => {
            suggestionContainer.empty();
            suggestions = suggestionList;
            selectedIndex = -1;

            if (suggestions.length === 0) {
                suggestionContainer.style.display = 'none';
                return;
            }

            suggestions.forEach((suggestion, index) => {
                const item = suggestionContainer.createEl('div', {
                    cls: 'la-path-suggestion-item',
                    text: suggestion,
                });

                // 高亮匹配部分
                const query = input.value.toLowerCase();
                if (query) {
                    const text = suggestion;
                    const index = text.toLowerCase().indexOf(query);
                    if (index !== -1) {
                        const beforeMatch = text.substring(0, index);
                        const match = text.substring(
                            index,
                            index + query.length,
                        );
                        const afterMatch = text.substring(index + query.length);

                        item.empty();
                        item.createSpan({ text: beforeMatch });
                        item.createEl('strong', { text: match });
                        item.createSpan({ text: afterMatch });
                    }
                }

                // 添加文件状态指示器
                const file = this.app.vault.getAbstractFileByPath(suggestion);
                const statusIndicator = item.createEl('span', {
                    cls: 'la-path-suggestion-status',
                });
                statusIndicator.style.float = 'right';
                statusIndicator.style.fontSize = '12px';
                statusIndicator.style.opacity = '0.7';

                if (file) {
                    statusIndicator.textContent = '存在';
                    statusIndicator.style.color = '#22c55e';
                } else {
                    statusIndicator.textContent = '+ 新建';
                    statusIndicator.style.color = '#3b82f6';
                }

                item.addEventListener('mouseenter', () => {
                    selectedIndex = index;
                    updateSelection();
                });

                item.addEventListener('click', () => {
                    selectSuggestion(suggestion);
                });
            });

            suggestionContainer.style.display = 'block';
        };

        // 更新选中状态
        const updateSelection = (): void => {
            const items =
                suggestionContainer.querySelectorAll(
                    '.la-path-suggestion-item',
                );
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    (item as HTMLElement).style.backgroundColor =
                        'var(--background-modifier-hover)';
                } else {
                    (item as HTMLElement).style.backgroundColor = 'transparent';
                }
            });
        }; // 选择建议
        const selectSuggestion = async (suggestion: string): Promise<void> => {
            input.value = suggestion;
            suggestionContainer.style.display = 'none';

            try {
                // 验证并保存路径
                if (this.validatePath(suggestion)) {
                    this.plugin.settings.wordsFilePath = suggestion;
                    await this.plugin.saveSettings();

                    // 更新所有现有的视图
                    this.plugin.app.workspace
                        .getLeavesOfType(VIEW_TYPE_WORD_MANAGER)
                        .forEach((leaf) => {
                            if (leaf.view instanceof WordManagerView) {
                                leaf.view.updateStoragePath(suggestion);
                            }
                        });

                    new Notice(`存储路径已更新为: ${suggestion}`);

                    // 刷新设置页面以显示新状态
                    this.display();
                }
            } catch (error) {
                console.error('更新存储路径失败:', error);
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                new Notice(`更新存储路径失败: ${errorMessage}`);
            }
        };

        // 输入事件处理
        input.addEventListener('input', (e) => {
            const query = (e.target as HTMLInputElement).value;
            const suggestionList = getSuggestions(query);
            renderSuggestions(suggestionList);
        });

        // 键盘导航
        input.addEventListener('keydown', (e) => {
            if (suggestionContainer.style.display === 'none') return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    selectedIndex = Math.min(
                        selectedIndex + 1,
                        suggestions.length - 1,
                    );
                    updateSelection();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    selectedIndex = Math.max(selectedIndex - 1, -1);
                    updateSelection();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (
                        selectedIndex >= 0 &&
                        selectedIndex < suggestions.length
                    ) {
                        selectSuggestion(suggestions[selectedIndex]);
                    } else {
                        // 直接验证并保存当前输入
                        const currentPath = input.value;
                        if (this.validatePath(currentPath)) {
                            selectSuggestion(currentPath);
                        }
                    }
                    break;
                case 'Escape':
                    suggestionContainer.style.display = 'none';
                    selectedIndex = -1;
                    break;
            }
        });

        // 失去焦点时隐藏建议
        input.addEventListener('blur', () => {
            // 延迟隐藏，以便点击建议项能正常工作
            setTimeout(() => {
                suggestionContainer.style.display = 'none';
            }, 200);
        });

        // 获得焦点时显示建议
        input.addEventListener('focus', () => {
            const query = input.value;
            if (query) {
                const suggestionList = getSuggestions(query);
                renderSuggestions(suggestionList);
            }
        });
    }

    /**
     * 验证路径是否有效
     */
    private validatePath(path: string): boolean {
        if (!path || path.trim() === '') {
            new Notice('路径不能为空');
            return false;
        }

        if (!path.endsWith('.md')) {
            new Notice('文件必须以 .md 结尾');
            return false;
        }

        // 检查路径中是否包含非法字符
        const invalidChars = /[<>:"|?*]/;
        if (invalidChars.test(path)) {
            new Notice('路径包含非法字符');
            return false;
        }

        return true;
    }
}

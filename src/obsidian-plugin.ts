import { Plugin, Notice, WorkspaceLeaf, ItemView, addIcon } from 'obsidian';
import { createRoot } from 'react-dom/client';
import * as React from 'react';
import MainApp from './MainApp';
import { MarkdownWordStorage } from './MarkdownWordStorage';
import type { Word } from './MarkdownWordStorage';

const VIEW_TYPE_WORD_MANAGER = 'word-manager-view';

// 添加一个简单的图标（可自定义 SVG）
addIcon(
    'word-book',
    '<svg viewBox="0 0 100 100" width="100" height="100"><rect x="15" y="20" width="70" height="60" rx="10" fill="#a78bfa"/><rect x="25" y="30" width="50" height="40" rx="5" fill="#fff"/></svg>',
);

export default class LanguageAssistantPlugin extends Plugin {
    async onload() {
        console.log('Language Assistant Obsidian 插件已加载');
        this.registerView(
            VIEW_TYPE_WORD_MANAGER,
            (leaf) => new WordManagerView(leaf),
        );
        this.addCommand({
            id: 'roll-dice',
            name: '🎲 Roll a Dice',
            callback: () => {
                const result = Math.floor(Math.random() * 6) + 1;
                new Notice(`🎲 你掷出了：${result}`);
            },
        });
        this.addCommand({
            id: 'open-word-manager',
            name: '📖 打开单词管理页面',
            callback: () => this.openWordManagerLeaf(),
        });
        // 添加 ribon 按钮
        this.addRibbonIcon('word-book', '单词管理', () => {
            this.openWordManagerLeaf();
        });
    }

    onunload() {
        console.log('Language Assistant Obsidian 插件已卸载');
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_WORD_MANAGER);
    }

    async openWordManagerLeaf() {
        const leaf = this.app.workspace.getRightLeaf(false);
        if (leaf) {
            await leaf.setViewState({
                type: VIEW_TYPE_WORD_MANAGER,
                active: true,
            });
            this.app.workspace.revealLeaf(leaf);
        }
    }
}

class WordManagerView extends ItemView {
    root: ReturnType<typeof createRoot> | null = null;
    private wordStorage: MarkdownWordStorage;
    private words: Word[] = [];
    private renderKey: number = 0; // 添加渲染键用于强制刷新

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        // 初始化 Markdown 存储器，指向 vault 根目录的 words.md
        this.wordStorage = new MarkdownWordStorage(this.app.vault);
    }

    // 生成 UUID
    private generateId(): string {
        return (
            'word-' +
            Math.random().toString(36).substr(2, 9) +
            '-' +
            Date.now().toString(36)
        );
    } // 跳转到 words.md 文件中的指定单词位置
    private async jumpToWordInMarkdown(wordId: string): Promise<void> {
        try {
            console.log('🔍 正在跳转到单词ID:', wordId);

            // 获取 words.md 文件
            const tFile = this.app.vault.getFileByPath('words.md');
            if (!tFile) {
                new Notice('❌ 未找到 words.md 文件');
                return;
            }

            // 读取文件内容
            const content = await this.app.vault.read(tFile);
            const lines = content.split('\n');

            // 查找包含指定ID的行
            let targetLine = -1;
            let foundWordName = '';
            for (let i = 0; i < lines.length; i++) {
                // 支持新格式 %%meta{"id":"xxx"}%% 和旧格式 ID: xxx
                if (
                    lines[i].includes(`"id":"${wordId}"`) || // 新格式
                    lines[i].includes(`ID: ${wordId}`) || // 旧格式
                    lines[i].includes(`id: ${wordId}`) // 旧格式小写
                ) {
                    // 找到单词标题行（通常在ID行前面几行）
                    for (let j = i; j >= Math.max(0, i - 10); j--) {
                        if (lines[j].startsWith('#')) {
                            targetLine = j;
                            foundWordName = lines[j]
                                .replace(/^#+\s*/, '')
                                .trim();
                            break;
                        }
                    }
                    break;
                }
            }

            if (targetLine >= 0) {
                // 打开文件并跳转到指定行
                const leaf = this.app.workspace.getLeaf(false);
                if (leaf) {
                    await leaf.openFile(tFile);

                    // 等待一小段时间确保文件已打开
                    setTimeout(() => {
                        // 获取编辑器并跳转到行
                        const view = leaf.view;
                        if (view && 'editor' in view && view.editor) {
                            const editor = view.editor as any;
                            editor.setCursor({ line: targetLine, ch: 0 });
                            editor.scrollIntoView({
                                from: { line: targetLine, ch: 0 },
                                to: { line: targetLine, ch: 0 },
                            });
                        }
                    }, 100);

                    new Notice(
                        `✅ 已跳转到单词 "${foundWordName}" (行 ${
                            targetLine + 1
                        })`,
                    );
                }
            } else {
                new Notice(`❌ 在 words.md 中未找到ID为 ${wordId} 的单词`);
            }
        } catch (error) {
            console.error('❌ 跳转失败:', error);
            new Notice('❌ 跳转到markdown失败，请查看控制台');
        }
    }

    getViewType() {
        return VIEW_TYPE_WORD_MANAGER;
    }

    getDisplayText() {
        return '单词管理';
    }
    async onOpen() {
        console.log('🔄 正在加载单词数据...');
        try {
            // 从 words.md 文件加载现有单词数据，包含重复信息
            const parseResult =
                await this.wordStorage.loadWordsWithDuplicateInfo();
            this.words = parseResult.words;
            console.log(`✅ 成功加载 ${this.words.length} 个单词`);

            // 显示重复信息给用户
            if (parseResult.duplicates.length > 0) {
                const duplicateNames = parseResult.duplicates
                    .map((d) => `"${d.name}"`)
                    .join(', ');
                new Notice(
                    `⚠️ 发现重复单词: ${duplicateNames}。已自动去重，保留了最新版本。`,
                    8000,
                );
                console.warn(
                    `⚠️ 发现 ${parseResult.duplicates.length} 个重复单词，详细信息请查看控制台`,
                );
            }

            if (this.words.length === 0) {
                new Notice('📝 未找到单词数据，您可以开始添加新单词！');
            } else {
                const message =
                    parseResult.duplicates.length > 0
                        ? `📚 加载了 ${this.words.length} 个单词 (已去重)`
                        : `📚 加载了 ${this.words.length} 个单词`;
                new Notice(message);
            }
        } catch (error) {
            console.error('❌ 加载单词失败:', error);
            new Notice('❌ 加载单词失败，请查看控制台');
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
                    onJumpToSource: this.jumpToWordInMarkdown.bind(this),
                }),
            );
            console.log(
                `🔄 界面已重新渲染 (key: ${this.renderKey}, words: ${this.words.length})`,
            );
        }
    }

    // 强制刷新界面的辅助方法
    private forceRefreshUI() {
        console.log('🔄 强制刷新UI...');
        this.renderComponent();

        // 使用 setTimeout 确保在下一个事件循环中再次刷新
        setTimeout(() => {
            console.log('🔄 延迟刷新UI...');
            this.renderComponent();
        }, 100);
    }
    private async handleAddWord(word: Word) {
        console.log('➕ 尝试添加新单词:', word.name);
        try {
            // 检查是否已存在同名单词
            const existingIndex = this.words.findIndex(
                (w) => w.name === word.name,
            );
            if (existingIndex >= 0) {
                new Notice(
                    `❌ 单词 "${word.name}" 已存在！请使用编辑功能或选择不同名称`,
                );
                return;
            } // 如果没有ID，生成一个新的
            if (!word.metadata.id) {
                word.metadata.id = this.generateId();
                console.log('🆔 为新单词生成ID:', word.metadata.id);
            }

            // 添加到本地数组
            this.words.push(word);
            console.log('📝 单词已添加到本地数组，正在保存到文件...'); // 立即更新界面显示新数据
            this.forceRefreshUI();

            // 保存到 words.md 文件
            await this.wordStorage.saveWords(this.words);
            console.log('💾 已保存到 words.md 文件');

            // 保存成功后再次确保界面更新
            this.forceRefreshUI();

            new Notice(`✅ 成功添加单词 "${word.name}" 并保存到 words.md`);
        } catch (error) {
            console.error('❌ 添加单词失败:', error);
            new Notice('❌ 添加单词失败，请查看控制台错误信息');
            // 如果保存失败，从数组中移除
            this.words = this.words.filter((w) => w.name !== word.name);
            this.renderComponent();
        }
    }
    private async handleEditWord(editedWord: Word, originalWord?: Word) {
        console.log('✏️ 尝试编辑单词:', editedWord.name);
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
                            `❌ 单词 "${editedWord.name}" 已存在！请选择不同的名称`,
                        );
                        return;
                    }
                }

                // 更新本地数组
                this.words[index] = editedWord;
                console.log('📝 单词已更新到本地数组，正在保存到文件...'); // 立即更新界面显示修改后的数据
                this.forceRefreshUI();

                // 保存到文件
                await this.wordStorage.saveWords(this.words);
                console.log('💾 已保存到 words.md 文件');

                // 保存成功后再次确保界面更新
                this.forceRefreshUI();

                new Notice(
                    `✅ 成功编辑单词 "${editedWord.name}" 并保存到 words.md`,
                );
            } else {
                new Notice(`❌ 未找到要编辑的单词 "${searchName}"`);
            }
        } catch (error) {
            console.error('❌ 编辑单词失败:', error);
            new Notice('❌ 编辑单词失败，请查看控制台错误信息'); // 发生错误时也要刷新界面，恢复原始状态
            this.forceRefreshUI();
        }
    }
    private async handleDeleteWord(wordName: string) {
        console.log('🗑️ 尝试删除单词:', wordName);
        try {
            const originalLength = this.words.length;

            // 从本地数组中移除
            this.words = this.words.filter((w) => w.name !== wordName);

            if (this.words.length < originalLength) {
                console.log('📝 单词已从本地数组移除，正在保存到文件...'); // 立即更新界面显示删除后的数据
                this.forceRefreshUI();

                // 保存到文件
                await this.wordStorage.saveWords(this.words);
                console.log('💾 已保存到 words.md 文件');

                // 保存成功后再次确保界面更新
                this.forceRefreshUI();

                new Notice(`✅ 成功删除单词 "${wordName}" 并更新 words.md`);
            } else {
                new Notice(`❌ 未找到要删除的单词 "${wordName}"`);
            }
        } catch (error) {
            console.error('❌ 删除单词失败:', error);
            new Notice('❌ 删除单词失败，请查看控制台错误信息'); // 发生错误时也要刷新界面
            this.forceRefreshUI();
        }
    }

    async onClose() {
        console.log('📴 关闭单词管理界面');
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
    }
}

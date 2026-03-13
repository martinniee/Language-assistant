import { Plugin, Notice, WorkspaceLeaf, ItemView, addIcon } from 'obsidian';
import { createRoot } from 'react-dom/client';
import * as React from 'react';
import WordManagerMarkdown from './WordManagerMarkdownNew';
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

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        // 初始化 Markdown 存储器，指向 vault 根目录的 words.md
        this.wordStorage = new MarkdownWordStorage(this.app.vault);
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
            // 从 words.md 文件加载现有单词数据
            this.words = await this.wordStorage.loadWords();
            console.log(`✅ 成功加载 ${this.words.length} 个单词`);

            if (this.words.length === 0) {
                new Notice('📝 未找到单词数据，您可以开始添加新单词！');
            } else {
                new Notice(`📚 加载了 ${this.words.length} 个单词`);
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
        if (this.root) {
            this.root.render(
                React.createElement(WordManagerMarkdown, {
                    words: this.words,
                    onAdd: this.handleAddWord.bind(this),
                    onEdit: this.handleEditWord.bind(this),
                    onDelete: this.handleDeleteWord.bind(this),
                }),
            );
        }
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
            }

            // 添加到本地数组
            this.words.push(word);
            console.log('📝 单词已添加到本地数组，正在保存到文件...');

            // 保存到 words.md 文件
            await this.wordStorage.saveWords(this.words);
            console.log('💾 已保存到 words.md 文件');

            // 重新渲染界面
            this.renderComponent();

            new Notice(`✅ 成功添加单词 "${word.name}" 并保存到 words.md`);
        } catch (error) {
            console.error('❌ 添加单词失败:', error);
            new Notice('❌ 添加单词失败，请查看控制台错误信息');
            // 如果保存失败，从数组中移除
            this.words = this.words.filter((w) => w.name !== word.name);
            this.renderComponent();
        }
    }

    private async handleEditWord(editedWord: Word) {
        console.log('✏️ 尝试编辑单词:', editedWord.name);
        try {
            const index = this.words.findIndex(
                (w) => w.name === editedWord.name,
            );
            if (index >= 0) {
                // 更新本地数组
                this.words[index] = editedWord;
                console.log('📝 单词已更新到本地数组，正在保存到文件...');

                // 保存到文件
                await this.wordStorage.saveWords(this.words);
                console.log('💾 已保存到 words.md 文件');

                // 重新渲染界面
                this.renderComponent();

                new Notice(
                    `✅ 成功编辑单词 "${editedWord.name}" 并保存到 words.md`,
                );
            } else {
                new Notice(`❌ 未找到要编辑的单词 "${editedWord.name}"`);
            }
        } catch (error) {
            console.error('❌ 编辑单词失败:', error);
            new Notice('❌ 编辑单词失败，请查看控制台错误信息');
        }
    }

    private async handleDeleteWord(wordName: string) {
        console.log('🗑️ 尝试删除单词:', wordName);
        try {
            const originalLength = this.words.length;

            // 从本地数组中移除
            this.words = this.words.filter((w) => w.name !== wordName);

            if (this.words.length < originalLength) {
                console.log('📝 单词已从本地数组移除，正在保存到文件...');

                // 保存到文件
                await this.wordStorage.saveWords(this.words);
                console.log('💾 已保存到 words.md 文件');

                // 重新渲染界面
                this.renderComponent();

                new Notice(`✅ 成功删除单词 "${wordName}" 并更新 words.md`);
            } else {
                new Notice(`❌ 未找到要删除的单词 "${wordName}"`);
            }
        } catch (error) {
            console.error('❌ 删除单词失败:', error);
            new Notice('❌ 删除单词失败，请查看控制台错误信息');
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

import { Plugin, Notice, WorkspaceLeaf, ItemView, addIcon } from 'obsidian';
import { createRoot } from 'react-dom/client';
import * as React from 'react';
import WordManager from './WordManager';

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
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }
    getViewType() {
        return VIEW_TYPE_WORD_MANAGER;
    }
    getDisplayText() {
        return '单词管理';
    }
    async onOpen() {
        this.root = createRoot(this.containerEl);
        this.root.render(
            React.createElement(WordManager, {
                words: [],
                onAdd: () => {},
                onEdit: () => {},
                onDelete: () => {},
            }),
        );
    }
    async onClose() {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
    }
}

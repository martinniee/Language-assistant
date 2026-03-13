import { Plugin, Notice, WorkspaceLeaf, ItemView } from 'obsidian';
import { createRoot } from 'react-dom/client';
import * as React from 'react';
import WordManager from './WordManager';

const VIEW_TYPE_WORD_MANAGER = 'word-manager-view';

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

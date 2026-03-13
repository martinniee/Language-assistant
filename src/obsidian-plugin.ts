import { Plugin, Notice } from 'obsidian';

export default class LanguageAssistantPlugin extends Plugin {
    async onload() {
        console.log('Language Assistant Obsidian 插件已加载');
        // 注册一个骰子命令
        this.addCommand({
            id: 'roll-dice',
            name: '🎲 Roll a Dice',
            callback: () => {
                const result = Math.floor(Math.random() * 6) + 1;
                new Notice(`🎲 你掷出了：${result}`);
            },
        });
    }

    onunload() {
        console.log('Language Assistant Obsidian 插件已卸载');
    }
}

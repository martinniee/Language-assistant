import { Plugin } from 'obsidian';

export default class LanguageAssistantPlugin extends Plugin {
    async onload() {
        console.log('Language Assistant Obsidian 插件已加载');
        // 后续可在此注册命令、视图、设置等
    }

    onunload() {
        console.log('Language Assistant Obsidian 插件已卸载');
    }
}

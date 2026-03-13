// 双层元数据系统实现
// 全局配置管理和项目元数据处理

import { Word } from './MarkdownWordStorage';

// 全局元数据配置接口
export interface GlobalMetaConfig {
    tags: Record<string, string>; // 标签别名映射 "t1" -> "水果"
    categories: Record<string, string>; // 分类别名映射 "c1" -> "日常用语"
    levels: Record<string, string>; // 等级别名映射 "l1" -> "初级"
    partsOfSpeech: Record<string, string>; // 词性别名映射 "p1" -> "名词"
    version?: string; // 配置版本
    lastUpdate?: string; // 最后更新时间
}

// 项目元数据接口
export interface ItemMeta {
    tags?: string[]; // 标签别名数组
    category?: string; // 分类别名
    level?: string; // 等级
    partsOfSpeech?: string; // 词性
}

// 全局元数据管理器
export class GlobalMetaManager {
    private static instance: GlobalMetaManager;
    private config: GlobalMetaConfig;

    private constructor() {
        this.config = {
            tags: {},
            categories: {},
            levels: {},
            partsOfSpeech: {},
            version: '1.0.0',
            lastUpdate: new Date().toISOString(),
        };
    }

    static getInstance(): GlobalMetaManager {
        if (!GlobalMetaManager.instance) {
            GlobalMetaManager.instance = new GlobalMetaManager();
        }
        return GlobalMetaManager.instance;
    }

    // 获取配置
    getConfig(): GlobalMetaConfig {
        return { ...this.config };
    }

    // 设置配置
    setConfig(config: Partial<GlobalMetaConfig>): void {
        this.config = {
            ...this.config,
            ...config,
            lastUpdate: new Date().toISOString(),
        };
    }

    // 添加标签别名
    addTagAlias(alias: string, fullName: string): string {
        this.config.tags[alias] = fullName;
        this.config.lastUpdate = new Date().toISOString();
        return alias;
    }

    // 添加分类别名
    addCategoryAlias(alias: string, fullName: string): string {
        this.config.categories[alias] = fullName;
        this.config.lastUpdate = new Date().toISOString();
        return alias;
    }

    // 解析标签（从别名到完整名称）
    resolveTags(tagAliases: string[]): string[] {
        return tagAliases.map((alias) => this.config.tags[alias] || alias);
    }

    // 解析分类
    resolveCategory(categoryAlias: string): string {
        return this.config.categories[categoryAlias] || categoryAlias;
    }

    // 生成标签别名
    generateTagAlias(fullName: string): string {
        // 检查是否已存在
        for (const [alias, name] of Object.entries(this.config.tags)) {
            if (name === fullName) return alias;
        }

        // 生成新别名
        const baseAlias = 't' + (Object.keys(this.config.tags).length + 1);
        let alias = baseAlias;
        let counter = 1;

        while (this.config.tags[alias]) {
            alias = `${baseAlias}_${counter}`;
            counter++;
        }

        this.addTagAlias(alias, fullName);
        return alias;
    }

    // 生成分类别名
    generateCategoryAlias(fullName: string): string {
        // 检查是否已存在
        for (const [alias, name] of Object.entries(this.config.categories)) {
            if (name === fullName) return alias;
        }

        // 生成新别名
        const baseAlias =
            'c' + (Object.keys(this.config.categories).length + 1);
        let alias = baseAlias;
        let counter = 1;

        while (this.config.categories[alias]) {
            alias = `${baseAlias}_${counter}`;
            counter++;
        }

        this.addCategoryAlias(alias, fullName);
        return alias;
    }

    // 为单词生成项目元数据
    generateItemMeta(word: Word): ItemMeta {
        const itemMeta: ItemMeta = {};

        // 处理标签
        if (word.tags && word.tags.length > 0) {
            itemMeta.tags = word.tags.map((tag) => this.generateTagAlias(tag));
        }

        // 处理分类
        if (word.category) {
            itemMeta.category = this.generateCategoryAlias(word.category);
        }

        // 其他字段直接使用
        if (word.level) itemMeta.level = word.level;
        if (word.partsOfSpeech) itemMeta.partsOfSpeech = word.partsOfSpeech;

        return itemMeta;
    }

    // 从项目元数据恢复单词字段
    resolveItemMeta(itemMeta: ItemMeta): Partial<Word> {
        const wordFields: Partial<Word> = {};

        // 解析标签
        if (itemMeta.tags) {
            wordFields.tags = this.resolveTags(itemMeta.tags);
            wordFields._tagAliases = itemMeta.tags;
        }

        // 解析分类
        if (itemMeta.category) {
            wordFields.category = this.resolveCategory(itemMeta.category);
            wordFields._categoryAlias = itemMeta.category;
        }

        // 其他字段直接赋值
        if (itemMeta.level) wordFields.level = itemMeta.level;
        if (itemMeta.partsOfSpeech)
            wordFields.partsOfSpeech = itemMeta.partsOfSpeech;

        return wordFields;
    }

    // 序列化全局配置
    serializeGlobalConfig(): string {
        return JSON.stringify(this.config);
    }

    // 反序列化全局配置
    deserializeGlobalConfig(jsonString: string): boolean {
        try {
            const config = JSON.parse(jsonString);
            if (this.validateConfig(config)) {
                this.config = {
                    ...this.config,
                    ...config,
                };
                return true;
            }
        } catch (error) {
            console.error('Failed to deserialize global meta config:', error);
        }
        return false;
    }

    // 序列化项目元数据
    serializeItemMeta(itemMeta: ItemMeta): string {
        return JSON.stringify(itemMeta);
    }

    // 反序列化项目元数据
    deserializeItemMeta(jsonString: string): ItemMeta | null {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Failed to deserialize item meta:', error);
            return null;
        }
    }

    // 验证配置格式
    private validateConfig(config: any): boolean {
        return (
            config &&
            typeof config.tags === 'object' &&
            typeof config.categories === 'object' &&
            typeof config.levels === 'object' &&
            typeof config.partsOfSpeech === 'object'
        );
    }

    // 获取统计信息
    getStats(): {
        totalTags: number;
        totalCategories: number;
        spaceSaved: number; // 估算节省的字符数
    } {
        const tagsSaved = Object.entries(this.config.tags).reduce(
            (acc, [alias, name]) => acc + (name.length - alias.length),
            0,
        );

        const categoriesSaved = Object.entries(this.config.categories).reduce(
            (acc, [alias, name]) => acc + (name.length - alias.length),
            0,
        );

        return {
            totalTags: Object.keys(this.config.tags).length,
            totalCategories: Object.keys(this.config.categories).length,
            spaceSaved: tagsSaved + categoriesSaved,
        };
    }

    // 清理未使用的别名（需要与单词数据配合使用）
    cleanupUnusedAliases(
        usedTagAliases: Set<string>,
        usedCategoryAliases: Set<string>,
    ): void {
        // 清理未使用的标签别名
        for (const alias of Object.keys(this.config.tags)) {
            if (!usedTagAliases.has(alias)) {
                delete this.config.tags[alias];
            }
        }

        // 清理未使用的分类别名
        for (const alias of Object.keys(this.config.categories)) {
            if (!usedCategoryAliases.has(alias)) {
                delete this.config.categories[alias];
            }
        }

        this.config.lastUpdate = new Date().toISOString();
    }
}

// 导出单例实例
export const globalMetaManager = GlobalMetaManager.getInstance();

// 双层元数据格式化工具
export class MetaFormatter {
    /**
     * 生成全局配置的 Markdown 格式
     */
    static formatGlobalMeta(config: GlobalMetaConfig): string {
        const configStr = JSON.stringify(config);
        return `%%global-meta${configStr}%%`;
    }

    /**
     * 生成项目元数据的 Markdown 格式
     */
    static formatItemMeta(itemMeta: ItemMeta): string {
        const metaStr = JSON.stringify(itemMeta);
        return `%%item-meta${metaStr}%%`;
    }

    /**
     * 解析全局配置
     */
    static parseGlobalMeta(line: string): GlobalMetaConfig | null {
        const match = line.match(/%%global-meta(.+)%%/);
        if (!match) return null;

        try {
            return JSON.parse(match[1]);
        } catch (error) {
            console.error('Failed to parse global meta:', error);
            return null;
        }
    }

    /**
     * 解析项目元数据
     */
    static parseItemMeta(line: string): ItemMeta | null {
        const match = line.match(/%%item-meta(.+)%%/);
        if (!match) return null;

        try {
            return JSON.parse(match[1]);
        } catch (error) {
            console.error('Failed to parse item meta:', error);
            return null;
        }
    }
}

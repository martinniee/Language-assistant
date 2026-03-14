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
        const wordFields: Partial<Word> = {}; // 解析标签
        if (itemMeta.tags) {
            wordFields.tags = this.resolveTags(itemMeta.tags);
        }

        // 解析分类
        if (itemMeta.category) {
            wordFields.category = this.resolveCategory(itemMeta.category);
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

    // ===== 新增：标签和分类管理功能 =====

    // 获取所有标签映射
    getAllTagMappings(): Array<{ alias: string; fullName: string }> {
        return Object.entries(this.config.tags).map(([alias, fullName]) => ({
            alias,
            fullName,
        }));
    }

    // 获取所有分类映射
    getAllCategoryMappings(): Array<{ alias: string; fullName: string }> {
        return Object.entries(this.config.categories).map(
            ([alias, fullName]) => ({
                alias,
                fullName,
            }),
        );
    }

    // 修改标签名称
    updateTagName(alias: string, newFullName: string): boolean {
        if (this.config.tags[alias]) {
            this.config.tags[alias] = newFullName;
            this.config.lastUpdate = new Date().toISOString();
            return true;
        }
        return false;
    }

    // 修改分类名称
    updateCategoryName(alias: string, newFullName: string): boolean {
        if (this.config.categories[alias]) {
            this.config.categories[alias] = newFullName;
            this.config.lastUpdate = new Date().toISOString();
            return true;
        }
        return false;
    }

    // 删除标签映射
    deleteTagMapping(alias: string): boolean {
        if (this.config.tags[alias]) {
            delete this.config.tags[alias];
            this.config.lastUpdate = new Date().toISOString();
            return true;
        }
        return false;
    }

    // 删除分类映射
    deleteCategoryMapping(alias: string): boolean {
        if (this.config.categories[alias]) {
            delete this.config.categories[alias];
            this.config.lastUpdate = new Date().toISOString();
            return true;
        }
        return false;
    }

    // 查找使用了指定标签别名的单词
    findWordsUsingTagAlias(alias: string, words: Word[]): Word[] {
        return words.filter((word) => {
            const itemMetaTags = word.itemMeta.tags || [];
            return itemMetaTags.includes(alias);
        });
    }

    // 查找使用了指定分类别名的单词
    findWordsUsingCategoryAlias(alias: string, words: Word[]): Word[] {
        return words.filter((word) => {
            return word.itemMeta.category === alias;
        });
    }

    // 批量更新单词中的标签别名
    updateTagAliasInWords(
        oldAlias: string,
        newFullName: string,
        words: Word[],
    ): Word[] {
        const updatedWords = words.map((word) => {
            const itemMetaTags = word.itemMeta.tags || [];
            if (itemMetaTags.includes(oldAlias)) {
                // 生成新的别名
                const newAlias = this.generateTagAlias(newFullName);

                // 更新 itemMeta 中的标签别名
                const updatedTags = itemMetaTags.map((tag) =>
                    tag === oldAlias ? newAlias : tag,
                );
                word.itemMeta.tags = updatedTags;

                // 更新兼容字段
                if (word.tags) {
                    word.tags = word.tags.map((tag) =>
                        this.config.tags[oldAlias] === tag ? newFullName : tag,
                    );
                }

                // 更新时间戳
                word.itemMeta.lastUpdate = new Date().toISOString();
            }
            return word;
        });

        return updatedWords;
    }

    // 批量更新单词中的分类别名
    updateCategoryAliasInWords(
        oldAlias: string,
        newFullName: string,
        words: Word[],
    ): Word[] {
        const updatedWords = words.map((word) => {
            if (word.itemMeta.category === oldAlias) {
                // 生成新的别名
                const newAlias = this.generateCategoryAlias(newFullName);

                // 更新 itemMeta 中的分类别名
                word.itemMeta.category = newAlias;

                // 更新兼容字段
                if (
                    word.category &&
                    this.config.categories[oldAlias] === word.category
                ) {
                    word.category = newFullName;
                }

                // 更新时间戳
                word.itemMeta.lastUpdate = new Date().toISOString();
            }
            return word;
        });

        return updatedWords;
    }

    // 从单词中移除指定标签别名
    removeTagAliasFromWords(alias: string, words: Word[]): Word[] {
        return words.map((word) => {
            const itemMetaTags = word.itemMeta.tags || [];
            if (itemMetaTags.includes(alias)) {
                // 从 itemMeta 中移除别名
                word.itemMeta.tags = itemMetaTags.filter(
                    (tag) => tag !== alias,
                );

                // 从兼容字段中移除对应的完整名称
                if (word.tags && this.config.tags[alias]) {
                    word.tags = word.tags.filter(
                        (tag) => tag !== this.config.tags[alias],
                    );
                }

                // 更新时间戳
                word.itemMeta.lastUpdate = new Date().toISOString();
            }
            return word;
        });
    }

    // 从单词中移除指定分类别名
    removeCategoryAliasFromWords(alias: string, words: Word[]): Word[] {
        return words.map((word) => {
            if (word.itemMeta.category === alias) {
                // 清空分类
                word.itemMeta.category = '';

                // 清空兼容字段
                if (
                    word.category &&
                    this.config.categories[alias] === word.category
                ) {
                    word.category = '';
                }

                // 更新时间戳
                word.itemMeta.lastUpdate = new Date().toISOString();
            }
            return word;
        });
    } // 获取使用统计
    getUsageStats(words: Word[]): {
        totalTags: number;
        usedTags: number;
        totalCategories: number;
        usedCategories: number;
        tagUsage: Record<
            string,
            { alias: string; fullName: string; count: number; words: string[] }
        >;
        categoryUsage: Record<
            string,
            { alias: string; fullName: string; count: number; words: string[] }
        >;
    } {
        const tagUsage: Record<
            string,
            { alias: string; fullName: string; count: number; words: string[] }
        > = {};
        const categoryUsage: Record<
            string,
            { alias: string; fullName: string; count: number; words: string[] }
        > = {};

        // 初始化标签使用统计
        Object.entries(this.config.tags).forEach(([alias, fullName]) => {
            tagUsage[alias] = { alias, fullName, count: 0, words: [] };
        });

        // 初始化分类使用统计
        Object.entries(this.config.categories).forEach(([alias, fullName]) => {
            categoryUsage[alias] = { alias, fullName, count: 0, words: [] };
        });

        // 统计实际使用情况
        words.forEach((word) => {
            // 统计标签使用
            const itemMetaTags = word.itemMeta.tags || [];
            itemMetaTags.forEach((tagAlias) => {
                if (tagUsage[tagAlias]) {
                    tagUsage[tagAlias].count++;
                    tagUsage[tagAlias].words.push(word.name);
                }
            });

            // 统计分类使用
            if (
                word.itemMeta.category &&
                categoryUsage[word.itemMeta.category]
            ) {
                categoryUsage[word.itemMeta.category].count++;
                categoryUsage[word.itemMeta.category].words.push(word.name);
            }
        });

        // 计算使用中的标签和分类数量
        const usedTags = Object.values(tagUsage).filter(
            (usage) => usage.count > 0,
        ).length;
        const usedCategories = Object.values(categoryUsage).filter(
            (usage) => usage.count > 0,
        ).length;

        return {
            totalTags: Object.keys(this.config.tags).length,
            usedTags,
            totalCategories: Object.keys(this.config.categories).length,
            usedCategories,
            tagUsage,
            categoryUsage,
        };
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

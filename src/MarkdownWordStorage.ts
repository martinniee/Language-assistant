// Markdown 单词存储和解析器 - 新三层元数据架构
import { TFile, Vault, Notice } from 'obsidian';
import { GlobalMetaManager } from './GlobalMetaManager';

export interface Example {
    text: string;
}

export interface Definition {
    definition: string;
    examples: Example[];
}

export interface PartOfSpeech {
    type: string; // 词性名称，如 "名词"、"动词"
    definitions: Definition[];
}

// 全局元数据接口
export interface GlobalMetadata {
    aliases?: Record<string, string>; // 别名映射
    categories?: Record<string, string>; // 分类别名
    tags?: Record<string, string>; // 标签别名
    [key: string]: any; // 支持扩展字段
}

// 项目元数据接口
export interface ItemMetadata {
    id: string; // 唯一标识符 (UUID)
    createAt: string; // 创建时间
    createBy?: string; // 创建者
    lastUpdate: string; // 最后更新时间
    viewCount: number; // 查看次数
    weight?: number; // 权重或重要性
    category: string; // 分类
    level: string; // 等级
    partsOfSpeech: string; // 词性概述
    tags: string[]; // 标签数组
    [key: string]: any; // 支持扩展字段
}

// SRS 元数据接口
export interface SRSMetadata {
    srsLevel: number; // SRS等级 (0-8，0为新卡片)
    nextReviewDate?: string; // 下次复习日期 (ISO 8601格式)
    lastReviewDate?: string; // 上次复习日期
    reviewCount: number; // 总复习次数
    correctCount: number; // 正确次数
    ease: number; // 难度因子 (1.3-2.5，默认2.5)
    interval: number; // 当前间隔天数
    [key: string]: any; // 支持扩展字段
}

// 向后兼容的 WordMetadata 接口
export interface WordMetadata {
    id: string; // 唯一标识符 (UUID)
    createBy?: string; // 创建者
    lastUpdate?: string; // 最后更新时间
    weight?: number; // 权重或重要性
    queryCount?: number; // 查询次数

    // 间隔学习相关字段
    srsLevel?: number; // SRS等级 (0-8，0为新卡片)
    nextReviewDate?: string; // 下次复习日期 (ISO 8601格式)
    lastReviewDate?: string; // 上次复习日期
    reviewCount?: number; // 总复习次数
    correctCount?: number; // 正确次数
    ease?: number; // 难度因子 (1.3-2.5，默认2.5)
    interval?: number; // 当前间隔天数

    [key: string]: any; // 支持扩展字段
}

export interface Word {
    // 新三层元数据架构
    itemMeta: ItemMetadata; // 项目级元数据
    srsMeta: SRSMetadata; // SRS级元数据

    // 内容数据（用户可见字段）
    name: string; // 单词名称
    pronunciation: string; // 发音
    vocabulary: string; // 词汇
    partsOfSpeech: string; // 词性概述
    notes: string; // 备注：记忆技巧、简单标注等
    content: PartOfSpeech[]; // 详细内容

    // 向后兼容字段
    metadata?: WordMetadata; // 兼容旧版本
    category?: string; // 兼容旧版本
    tags?: string[]; // 兼容旧版本
    level?: string; // 兼容旧版本
}

// 为向后兼容而提供的工具类
export class WordHelper {
    static getId(word: Word): string {
        return word.itemMeta.id;
    }

    static getQueryCount(word: Word): number {
        return word.itemMeta.viewCount || 0;
    }

    static setId(word: Word, id: string): void {
        word.itemMeta.id = id;
    }

    static setQueryCount(word: Word, count: number): void {
        word.itemMeta.viewCount = count;
    } // 新的访问器方法 - 兼容旧接口
    static getCategory(word: Word): string {
        // 优先从兼容字段获取，如果没有则从 itemMeta 获取
        return word.category || word.itemMeta.category || '';
    }

    static getTags(word: Word): string[] {
        // 优先从兼容字段获取，如果没有则从 itemMeta 获取
        return word.tags || word.itemMeta.tags || [];
    }

    static getLevel(word: Word): string {
        // 优先从兼容字段获取，如果没有则从 itemMeta 获取
        return word.level || word.itemMeta.level || '';
    }

    static setCategory(word: Word, category: string): void {
        // 设置到兼容字段，在保存时会生成别名到 itemMeta
        word.category = category;
    }

    static setTags(word: Word, tags: string[]): void {
        // 设置到兼容字段，在保存时会生成别名到 itemMeta
        word.tags = tags;
    }

    static setLevel(word: Word, level: string): void {
        // 设置到兼容字段，在保存时会生成别名到 itemMeta
        word.level = level;
    }

    // 间隔学习相关辅助方法
    static getSrsLevel(word: Word): number {
        return word.srsMeta.srsLevel || 0;
    }

    static getNextReviewDate(word: Word): Date | null {
        const dateString = word.srsMeta.nextReviewDate;
        return dateString ? new Date(dateString) : null;
    }

    static getLastReviewDate(word: Word): Date | null {
        const dateString = word.srsMeta.lastReviewDate;
        return dateString ? new Date(dateString) : null;
    }

    static getReviewCount(word: Word): number {
        return word.srsMeta.reviewCount || 0;
    }

    static getCorrectCount(word: Word): number {
        return word.srsMeta.correctCount || 0;
    }

    static getEase(word: Word): number {
        return word.srsMeta.ease || 2.5;
    }

    static getInterval(word: Word): number {
        return word.srsMeta.interval || 1;
    }

    static getAccuracy(word: Word): number {
        const total = WordHelper.getReviewCount(word);
        const correct = WordHelper.getCorrectCount(word);
        return total > 0 ? (correct / total) * 100 : 0;
    }

    static isNewCard(word: Word): boolean {
        return WordHelper.getSrsLevel(word) === 0;
    }

    static isDueForReview(word: Word): boolean {
        const nextReviewDate = WordHelper.getNextReviewDate(word);
        if (!nextReviewDate) return true; // 新卡片默认需要学习
        return new Date() >= nextReviewDate;
    }

    static getDaysUntilReview(word: Word): number {
        const nextReviewDate = WordHelper.getNextReviewDate(word);
        if (!nextReviewDate) return 0;
        const diffTime = nextReviewDate.getTime() - new Date().getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // 创建新的Word对象
    static createEmpty(): Word {
        const now = new Date().toISOString();
        return {
            itemMeta: {
                id: '',
                createAt: now,
                lastUpdate: now,
                viewCount: 0,
                category: '',
                level: '',
                partsOfSpeech: '',
                tags: [],
            },
            srsMeta: {
                srsLevel: 0,
                reviewCount: 0,
                correctCount: 0,
                ease: 2.5,
                interval: 1,
            },
            name: '',
            pronunciation: '',
            vocabulary: '',
            partsOfSpeech: '',
            notes: '',
            content: [],
        };
    }

    // 从旧格式转换为新格式
    static fromLegacy(legacyWord: any): Word {
        const now = new Date().toISOString();
        return {
            itemMeta: {
                id: legacyWord.metadata?.id || '',
                createAt: legacyWord.metadata?.createAt || now,
                lastUpdate: legacyWord.metadata?.lastUpdate || now,
                viewCount: legacyWord.metadata?.queryCount || 0,
                category: legacyWord.category || '',
                level: legacyWord.level || '',
                partsOfSpeech: legacyWord.partsOfSpeech || '',
                tags: legacyWord.tags || [],
            },
            srsMeta: {
                srsLevel: legacyWord.metadata?.srsLevel || 0,
                reviewCount: legacyWord.metadata?.reviewCount || 0,
                correctCount: legacyWord.metadata?.correctCount || 0,
                ease: legacyWord.metadata?.ease || 2.5,
                interval: legacyWord.metadata?.interval || 1,
                nextReviewDate: legacyWord.metadata?.nextReviewDate,
                lastReviewDate: legacyWord.metadata?.lastReviewDate,
            },
            name: legacyWord.name || '',
            pronunciation: legacyWord.pronunciation || '',
            vocabulary: legacyWord.vocabulary || '',
            partsOfSpeech: legacyWord.partsOfSpeech || '',
            notes: legacyWord.notes || '',
            content: legacyWord.content || [],
        };
    }
}

export interface DuplicateInfo {
    name: string;
    count: number;
}

export interface ParseResult {
    words: Word[];
    duplicates: DuplicateInfo[];
}

export class MarkdownWordStorage {
    private vault: Vault;
    private wordsFilePath: string;

    constructor(vault: Vault, wordsFilePath: string = 'words.md') {
        this.vault = vault;
        this.wordsFilePath = wordsFilePath;
    }

    // 生成 UUID
    generateId(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            },
        );
    } // 解析 markdown 内容为单词数组 - 兼容新旧格式
    parseMarkdownToWords(content: string): ParseResult {
        console.log('📖 开始解析 Markdown 内容...');

        const globalMetaManager = GlobalMetaManager.getInstance();
        let dataContent = '';

        // 检查是否使用新格式（包含 %%data-start%% 标记）
        const dataStartMatch = content.match(
            /%%data-start%%\s*([\s\S]*?)\s*%%data-end%%/,
        );
        if (dataStartMatch) {
            console.log('✅ 检测到新格式数据标记');
            dataContent = dataStartMatch[1];

            // 解析并加载全局配置
            const globalMetaMatch = dataContent.match(/%%global-meta(.+?)%%/);
            if (globalMetaMatch) {
                try {
                    const globalConfig = JSON.parse(globalMetaMatch[1]);
                    globalMetaManager.setConfig(globalConfig);
                    console.log('🔄 已加载全局元数据配置:', globalConfig);
                } catch (error) {
                    console.error('❌ 解析全局配置失败:', error);
                }
            }

            // 移除全局配置行，只保留单词数据
            dataContent = dataContent.replace(/%%global-meta.+?%%\s*/g, '');
        } else {
            // 向后兼容：如果没有数据标记，使用整个内容，但过滤标题和全局配置
            dataContent = content
                .replace(/%%global-meta.+?%%/g, '') // 移除全局配置
                .replace(/^#[^#].*$/gm, ''); // 移除一级标题
        }

        // 按二级标题分割数据区域内容
        const sections = dataContent
            .split(/^## /gm)
            .filter((section) => section.trim());
        const words: Word[] = [];

        for (const section of sections) {
            const lines = section.trim().split('\n');
            if (lines.length === 0) continue;

            const wordName = lines[0].trim(); // 第一行是单词名

            // 跳过文档标题部分
            if (
                wordName.startsWith('#') ||
                wordName === '' ||
                wordName === 'Words' ||
                wordName.includes('%%')
            ) {
                continue;
            }

            const word: Word = WordHelper.createEmpty();
            word.name = wordName;

            // 解析各种元数据和内容
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i]; // 解析新格式元数据块
                if (line.startsWith('%%item-meta{')) {
                    try {
                        const metaStr = line
                            .replace(/^%%item-meta\{/, '')
                            .replace(/\}%%$/, '');
                        const itemMeta = JSON.parse(metaStr);
                        word.itemMeta = { ...word.itemMeta, ...itemMeta };

                        // 使用 GlobalMetaManager 解析别名为完整值
                        const resolvedFields =
                            globalMetaManager.resolveItemMeta(itemMeta);
                        if (resolvedFields.tags)
                            word.tags = resolvedFields.tags;
                        if (resolvedFields.category)
                            word.category = resolvedFields.category;
                        if (resolvedFields.level)
                            word.level = resolvedFields.level;
                        if (resolvedFields.partsOfSpeech)
                            word.partsOfSpeech = resolvedFields.partsOfSpeech;

                        console.log(`✅ 解析项目元数据成功: ${word.name}`, {
                            itemMeta,
                            resolved: resolvedFields,
                        });
                    } catch (error) {
                        console.warn(
                            `⚠️ 解析项目元数据失败: ${word.name}`,
                            error,
                        );
                    }
                } else if (line.startsWith('%%srs-meta{')) {
                    try {
                        const metaStr = line
                            .replace(/^%%srs-meta\{/, '')
                            .replace(/\}%%$/, '');
                        const srsMeta = JSON.parse(metaStr);
                        word.srsMeta = { ...word.srsMeta, ...srsMeta };
                        console.log(`✅ 解析SRS元数据成功: ${word.name}`);
                    } catch (error) {
                        console.warn(
                            `⚠️ 解析SRS元数据失败: ${word.name}`,
                            error,
                        );
                    }
                }
                // 向后兼容：解析旧格式字段
                else if (line.startsWith('- 发音:')) {
                    word.pronunciation = line.replace(/^-\s*发音:/, '').trim();
                } else if (line.startsWith('- 词汇:')) {
                    word.vocabulary = line.replace(/^-\s*词汇:/, '').trim();
                } else if (
                    line.startsWith('- ID:') ||
                    line.startsWith('- id:')
                ) {
                    WordHelper.setId(
                        word,
                        line.replace(/^-\s*(ID|id):/, '').trim(),
                    );
                } else if (line.startsWith('- 查询次数:')) {
                    const queryCount =
                        parseInt(line.replace(/^-\s*查询次数:/, '').trim()) ||
                        0;
                    WordHelper.setQueryCount(word, queryCount);
                } else if (line.startsWith('- 标签:')) {
                    const tagsStr = line.replace(/^-\s*标签:/, '').trim();
                    const tags = tagsStr
                        ? tagsStr.split(',').map((t) => t.trim())
                        : [];
                    WordHelper.setTags(word, tags);
                } else if (line.startsWith('- 分类:')) {
                    const category = line.replace(/^-\s*分类:/, '').trim();
                    WordHelper.setCategory(word, category);
                } else if (line.startsWith('- 等级:')) {
                    const level = line.replace(/^-\s*等级:/, '').trim();
                    WordHelper.setLevel(word, level);
                } else if (line.startsWith('- 词性:')) {
                    word.partsOfSpeech = line.replace(/^-\s*词性:/, '').trim();
                    word.itemMeta.partsOfSpeech = word.partsOfSpeech;
                } else if (line.startsWith('- 备注:')) {
                    word.notes = line.replace(/^-\s*备注:/, '').trim();
                }
            }

            // 解析内容部分（如果存在）
            const contentStartIndex = lines.findIndex(
                (line) => line.trim() === '- 内容:',
            );
            if (contentStartIndex !== -1) {
                word.content = this.parseContent(lines, contentStartIndex + 1);
            }

            // 确保必要字段存在
            if (!WordHelper.getId(word)) {
                WordHelper.setId(word, this.generateId());
            }

            // 设置默认值
            if (WordHelper.getSrsLevel(word) === undefined) {
                word.srsMeta.srsLevel = 0;
            }
            if (WordHelper.getReviewCount(word) === undefined) {
                word.srsMeta.reviewCount = 0;
            }
            if (WordHelper.getCorrectCount(word) === undefined) {
                word.srsMeta.correctCount = 0;
            }
            if (WordHelper.getEase(word) === undefined) {
                word.srsMeta.ease = 2.5;
            }
            if (WordHelper.getInterval(word) === undefined) {
                word.srsMeta.interval = 1;
            }

            // 设置默认元数据字段
            if (!word.itemMeta.createBy) {
                word.itemMeta.createBy = 'user';
            }
            if (!word.itemMeta.lastUpdate) {
                word.itemMeta.lastUpdate = new Date().toISOString();
            }

            words.push(word);
        }

        // 移除重复单词并统计
        const { words: uniqueWords, duplicates } = this.removeDuplicates(words);

        console.log(
            `📊 解析完成: 共 ${words.length} 个单词，去重后 ${uniqueWords.length} 个`,
        );

        return { words: uniqueWords, duplicates };
    }

    // 解析内容部分
    private parseContent(lines: string[], startIndex: number): PartOfSpeech[] {
        const content: PartOfSpeech[] = [];
        let currentPartOfSpeech: PartOfSpeech | null = null;
        let currentDefinition: Definition | null = null;

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i];

            // 词性 (4个空格缩进，匹配 "    -   感叹词")
            if (line.match(/^    -\s+\S/)) {
                const partType = line.replace(/^    -\s+/, '').trim();
                currentPartOfSpeech = {
                    type: partType,
                    definitions: [],
                };
                content.push(currentPartOfSpeech);
            }
            // 定义 (8个空格缩进，匹配 "        -   用于问候或引起注意的感叹词")
            else if (line.match(/^        -\s+\S/)) {
                const defText = line.replace(/^        -\s+/, '').trim();
                currentDefinition = {
                    definition: defText,
                    examples: [],
                };
                if (currentPartOfSpeech) {
                    currentPartOfSpeech.definitions.push(currentDefinition);
                }
            }
            // 例句 (12个空格缩进，匹配 "            -   Hello!")
            else if (line.match(/^            -\s+\S/)) {
                const exampleText = line
                    .replace(/^            -\s+/, '')
                    .trim();
                if (currentDefinition) {
                    currentDefinition.examples.push({ text: exampleText });
                }
            }
        }

        return content;
    }

    // 移除重复单词（保留最后出现的）
    private removeDuplicates(words: Word[]): {
        words: Word[];
        duplicates: DuplicateInfo[];
    } {
        const nameCountMap = new Map<string, number>();
        const duplicates: DuplicateInfo[] = [];
        const duplicateDetails: string[] = [];

        // 统计每个单词名称的出现次数
        words.forEach((word) => {
            const normalizedName = word.name.toLowerCase().trim();
            nameCountMap.set(
                normalizedName,
                (nameCountMap.get(normalizedName) || 0) + 1,
            );
        });

        // 找出重复的单词
        nameCountMap.forEach((count, name) => {
            if (count > 1) {
                duplicates.push({ name, count });
            }
        });

        // 从后往前遍历，保留最后出现的单词
        const uniqueWords: Word[] = [];
        const seenNames = new Set<string>();

        for (let i = words.length - 1; i >= 0; i--) {
            const word = words[i];
            const normalizedName = word.name.toLowerCase().trim();

            if (!seenNames.has(normalizedName)) {
                seenNames.add(normalizedName);
                uniqueWords.unshift(word); // 在开头插入以维持顺序
            } else {
                duplicateDetails.push(`跳过重复单词: "${word.name}"`);
            }
        }

        // 输出重复信息
        if (duplicates.length > 0) {
            console.warn(`⚠️ 检测到重复单词:`);
            duplicates.forEach((dup) => {
                console.warn(`   "${dup.name}" 出现了 ${dup.count} 次`);
            });
            duplicateDetails.forEach((detail) => {
                console.warn(`   ${detail}`);
            });
            console.log(
                `🔄 共去除了 ${words.length - uniqueWords.length} 个重复单词`,
            );
        }

        return { words: uniqueWords, duplicates };
    } // 将单词数组序列化为 markdown 字符串
    wordsToMarkdown(words: Word[]): string {
        const globalMetaManager = GlobalMetaManager.getInstance();
        let markdown = '# Words\n\n';

        markdown += '%%data-start%%\n\n';

        // 先为所有单词生成别名，然后再获取全局配置
        const processedWords: Array<{
            word: Word;
            cleanItemMeta: any;
            cleanSrsMeta: any;
        }> = [];

        for (const word of words) {
            // 构造一个包含完整数据的临时对象，用于生成别名
            const wordWithData = {
                ...word,
                tags: WordHelper.getTags(word),
                category: WordHelper.getCategory(word),
                level: WordHelper.getLevel(word),
                partsOfSpeech: word.partsOfSpeech,
            };

            // 为每个单词生成别名版本的元数据
            const aliasItemMeta =
                globalMetaManager.generateItemMeta(wordWithData);

            // 保留原始的 itemMeta 中的必需字段
            const preservedFields = {
                id: word.itemMeta.id || '',
                createAt: word.itemMeta.createAt || '',
                lastUpdate: word.itemMeta.lastUpdate || '',
                viewCount: word.itemMeta.viewCount || 0,
            };

            // 合并别名元数据和保留字段，确保类型兼容
            const finalItemMeta: ItemMetadata = {
                ...preservedFields,
                category: aliasItemMeta.category || '',
                level: aliasItemMeta.level || '',
                partsOfSpeech: aliasItemMeta.partsOfSpeech || '',
                tags: aliasItemMeta.tags || [],
            };

            // 清理元数据（移除空值和默认值）
            const cleanItemMeta = this.cleanItemMeta(finalItemMeta);
            const cleanSrsMeta = this.cleanSrsMeta(word.srsMeta);

            processedWords.push({
                word,
                cleanItemMeta,
                cleanSrsMeta,
            });
        }

        // 现在获取包含所有生成别名的全局配置
        const globalConfig = globalMetaManager.getConfig();
        markdown += `%%global-meta${JSON.stringify(globalConfig)}%%\n\n`;

        // 生成每个单词的 markdown
        for (const { word, cleanItemMeta, cleanSrsMeta } of processedWords) {
            markdown += `## ${word.name}\n\n`;

            // 新格式元数据块
            if (cleanItemMeta && Object.keys(cleanItemMeta).length > 0) {
                markdown += `%%item-meta{${JSON.stringify(
                    cleanItemMeta,
                )}}%%\n\n`;
            }

            if (cleanSrsMeta && Object.keys(cleanSrsMeta).length > 0) {
                markdown += `%%srs-meta{${JSON.stringify(cleanSrsMeta)}}%%\n\n`;
            }

            // 内容字段
            if (word.pronunciation) {
                markdown += `- 发音: ${word.pronunciation}\n`;
            }
            if (word.vocabulary) {
                markdown += `- 词汇: ${word.vocabulary}\n`;
            }

            // 兼容性字段 - 便于用户阅读
            markdown += `- 分类: ${WordHelper.getCategory(word)}\n`;
            markdown += `- 标签: ${WordHelper.getTags(word).join(', ')}\n`;
            markdown += `- 等级: ${WordHelper.getLevel(word)}\n`;

            if (word.partsOfSpeech) {
                markdown += `- 词性: ${word.partsOfSpeech}\n`;
            }
            if (word.notes) {
                markdown += `- 备注: ${word.notes}\n`;
            }

            // 内容部分
            if (word.content && word.content.length > 0) {
                markdown += '- 内容:\n';
                for (const partOfSpeech of word.content) {
                    markdown += `    - ${partOfSpeech.type}\n`;
                    for (const definition of partOfSpeech.definitions) {
                        markdown += `        - ${definition.definition}\n`;
                        for (const example of definition.examples) {
                            markdown += `            - ${example.text}\n`;
                        }
                    }
                }
            }

            markdown += '\n';
        }

        markdown += '%%data-end%%\n';
        return markdown;
    }

    // 清理项目元数据
    private cleanItemMeta(itemMeta: ItemMetadata): any {
        const cleaned: any = { ...itemMeta };
        // 移除空值和默认值
        if (!cleaned.createBy) delete cleaned.createBy;
        if (cleaned.weight === undefined) delete cleaned.weight;
        if (cleaned.viewCount === 0) delete cleaned.viewCount;
        return cleaned;
    }

    // 清理SRS元数据
    private cleanSrsMeta(srsMeta: SRSMetadata): any {
        const cleaned: any = { ...srsMeta };
        // 移除默认值
        if (cleaned.srsLevel === 0) delete cleaned.srsLevel;
        if (cleaned.reviewCount === 0) delete cleaned.reviewCount;
        if (cleaned.correctCount === 0) delete cleaned.correctCount;
        if (cleaned.ease === 2.5) delete cleaned.ease;
        if (cleaned.interval === 1) delete cleaned.interval;
        if (!cleaned.nextReviewDate) delete cleaned.nextReviewDate;
        if (!cleaned.lastReviewDate) delete cleaned.lastReviewDate;
        return cleaned;
    }

    // 读取 words.md 文件
    async loadWords(): Promise<Word[]> {
        const result = await this.loadWordsWithDuplicateInfo();
        return result.words;
    }

    // 读取 words.md 文件并返回重复信息
    async loadWordsWithDuplicateInfo(): Promise<ParseResult> {
        try {
            const file = this.vault.getAbstractFileByPath(this.wordsFilePath);
            if (!file || !(file instanceof TFile)) {
                console.warn(
                    `📁 文件 ${this.wordsFilePath} 不存在，返回空数组`,
                );

                // 确保父文件夹存在
                await this.ensureParentFolderExists(this.wordsFilePath);

                // 创建一个空文件
                const emptyContent =
                    '# Words\n\n%%data-start%%\n\n%%data-end%%\n';
                await this.vault.create(this.wordsFilePath, emptyContent);

                return { words: [], duplicates: [] };
            }

            const content = await this.vault.read(file);
            return this.parseMarkdownToWords(content);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            console.error(`❌ 读取单词文件失败: ${errorMessage}`);
            new Notice(`❌ 读取单词文件失败: ${errorMessage}`);
            return { words: [], duplicates: [] };
        }
    }

    // 保存单词数组到 words.md 文件
    async saveWords(words: Word[]): Promise<void> {
        try {
            const markdown = this.wordsToMarkdown(words);
            const file = this.vault.getAbstractFileByPath(this.wordsFilePath);

            if (!file || !(file instanceof TFile)) {
                // 确保父文件夹存在
                await this.ensureParentFolderExists(this.wordsFilePath);

                // 双重检查文件是否在文件夹创建后存在
                const existingFile = this.vault.getAbstractFileByPath(
                    this.wordsFilePath,
                );
                if (!existingFile || !(existingFile instanceof TFile)) {
                    await this.vault.create(this.wordsFilePath, markdown);
                } else {
                    await this.vault.modify(existingFile, markdown);
                }
            } else {
                await this.vault.modify(file, markdown);
            }

            console.log(`✅ 单词文件保存成功: ${this.wordsFilePath}`);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            console.error(`❌ 保存单词文件失败: ${errorMessage}`);

            // 如果是因为文件已存在错误，尝试使用修改方法
            if (errorMessage.includes('already exists')) {
                try {
                    const file = this.vault.getAbstractFileByPath(
                        this.wordsFilePath,
                    );
                    if (file instanceof TFile) {
                        const markdown = this.wordsToMarkdown(words);
                        await this.vault.modify(file, markdown);
                        console.log(
                            `✅ 使用修改方法保存成功: ${this.wordsFilePath}`,
                        );
                        return;
                    }
                } catch (retryError) {
                    console.error(`❌ 重试保存也失败了:`, retryError);
                }
            }

            new Notice(`❌ 文件保存失败: ${errorMessage}`);
            throw error;
        }
    }

    // 确保父文件夹存在
    private async ensureParentFolderExists(filePath: string): Promise<void> {
        const pathParts = filePath.split('/');
        if (pathParts.length <= 1) {
            // 文件在根目录，不需要创建文件夹
            return;
        }

        // 获取父文件夹路径（去掉文件名）
        const parentFolderPath = pathParts.slice(0, -1).join('/');

        try {
            const parentFolder =
                this.vault.getAbstractFileByPath(parentFolderPath);
            if (!parentFolder) {
                console.log(`📁 创建文件夹: ${parentFolderPath}`);
                await this.vault.createFolder(parentFolderPath);
                console.log(`✅ 文件夹创建成功: ${parentFolderPath}`);
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            console.error(
                `❌ 创建文件夹失败: ${parentFolderPath} - ${errorMessage}`,
            );
            new Notice(
                `❌ 创建文件夹失败: ${parentFolderPath} - ${errorMessage}`,
            );
            throw error;
        }
    }
}

// Markdown 单词存储和解析器
import { TFile, Vault, Notice } from 'obsidian';
import { SRSUtils } from './SpacedRepetitionSystem';
import { GlobalMetaManager, MetaFormatter } from './GlobalMetaManager';

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
    // 元数据（技术字段）
    metadata: WordMetadata;

    // 内容数据（用户可见字段）
    name: string; // 单词名称
    pronunciation: string; // 发音
    vocabulary: string; // 词汇
    category: string; // 分类（可以是别名或完整名称）
    tags: string[]; // 标签数组（可以是别名或完整名称）
    level: string; // 等级
    partsOfSpeech: string; // 词性概述
    notes: string; // 备注：记忆技巧、简单标注等
    content: PartOfSpeech[]; // 详细内容

    // 内部别名字段（用于存储）
    _categoryAlias?: string; // 分类别名
    _tagAliases?: string[]; // 标签别名数组
}

// 为向后兼容而提供的工具类
export class WordHelper {
    static getId(word: Word): string {
        return word.metadata.id;
    }

    static getQueryCount(word: Word): number {
        return word.metadata.queryCount || 0;
    }

    static setId(word: Word, id: string): void {
        word.metadata.id = id;
    }

    static setQueryCount(word: Word, count: number): void {
        word.metadata.queryCount = count;
    }

    // 间隔学习相关辅助方法
    static getSrsLevel(word: Word): number {
        return word.metadata.srsLevel || 0;
    }

    static getNextReviewDate(word: Word): Date | null {
        const dateString = word.metadata.nextReviewDate;
        return dateString ? new Date(dateString) : null;
    }

    static getLastReviewDate(word: Word): Date | null {
        const dateString = word.metadata.lastReviewDate;
        return dateString ? new Date(dateString) : null;
    }

    static getReviewCount(word: Word): number {
        return word.metadata.reviewCount || 0;
    }

    static getCorrectCount(word: Word): number {
        return word.metadata.correctCount || 0;
    }

    static getEase(word: Word): number {
        return word.metadata.ease || 2.5;
    }

    static getInterval(word: Word): number {
        return word.metadata.interval || 1;
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
    private generateId(): string {
        return (
            'word-' +
            Math.random().toString(36).substr(2, 9) +
            '-' +
            Date.now().toString(36)
        );
    } // 解析 markdown 内容为单词数组
    parseMarkdownToWords(content: string): ParseResult {
        const words: Word[] = [];
        const globalMetaManager = GlobalMetaManager.getInstance();

        // 提取数据区域内容
        const dataStartPattern = /%%data-start%%/;
        const dataEndPattern = /%%data-end%%/;

        const startMatch = content.match(dataStartPattern);
        const endMatch = content.match(dataEndPattern);

        let dataContent = '';
        if (startMatch && endMatch) {
            const startIndex = startMatch.index! + startMatch[0].length;
            const endIndex = endMatch.index!;
            dataContent = content.substring(startIndex, endIndex).trim();
            // 在数据区域内查找全局配置
            const globalMetaLines = dataContent.match(/%%global-meta.+?%%/g);
            if (globalMetaLines && globalMetaLines.length > 0) {
                try {
                    const globalConfig = MetaFormatter.parseGlobalMeta(
                        globalMetaLines[0],
                    );
                    if (globalConfig) {
                        globalMetaManager.setConfig(globalConfig);
                        console.log('✅ 加载全局元数据配置成功');
                    } else {
                        console.warn('⚠️ 解析全局元数据配置失败');
                    }
                } catch (error) {
                    console.warn('⚠️ 解析全局元数据配置失败:', error);
                }

                // 移除全局配置行，只保留单词数据
                dataContent = dataContent.replace(/%%global-meta.+?%%\s*/g, '');
            }
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
            const word: Word = {
                metadata: {
                    id: '', // 暂时为空，后面会设置
                    queryCount: 0,
                },
                name: wordName,
                pronunciation: '',
                vocabulary: '',
                category: '',
                tags: [],
                level: '',
                partsOfSpeech: '',
                notes: '', // 备注字段
                content: [],
            };

            let contentStartIndex = -1; // 解析字段
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();

                // 解析新的项目元数据格式 %%item-meta{...}%%
                if (line.startsWith('%%item-meta') && line.endsWith('%%')) {
                    try {
                        const metaStr = line
                            .replace(/^%%item-meta/, '')
                            .replace(/%%$/, '');
                        const itemMeta = JSON.parse(metaStr);

                        // 处理标签别名
                        if (itemMeta.tags) {
                            word._tagAliases = itemMeta.tags;
                            word.tags = globalMetaManager.resolveTags(
                                itemMeta.tags,
                            );
                        }

                        // 处理分类别名
                        if (itemMeta.category) {
                            word._categoryAlias = itemMeta.category;
                            word.category = globalMetaManager.resolveCategory(
                                itemMeta.category,
                            );
                        }

                        // 其他字段直接赋值
                        if (itemMeta.level) word.level = itemMeta.level;
                        if (itemMeta.partsOfSpeech)
                            word.partsOfSpeech = itemMeta.partsOfSpeech;
                    } catch (error) {
                        console.warn('解析项目元数据失败:', line, error);
                    }
                }
                // 解析旧的完整元数据格式 %%meta{...}%% (向后兼容)
                else if (line.startsWith('%%meta') && line.endsWith('%%')) {
                    try {
                        const metaStr = line
                            .replace(/^%%meta/, '')
                            .replace(/%%$/, '');
                        const metadata = JSON.parse(metaStr);
                        word.metadata = {
                            id: metadata.id || '',
                            createBy: metadata.createBy,
                            lastUpdate: metadata.lastUpdate,
                            weight: metadata.weight,
                            queryCount: metadata.queryCount || 0,
                            ...metadata,
                        };
                    } catch (error) {
                        console.warn('解析元数据失败:', line, error);
                    }
                }
                // 向后兼容：解析旧格式的ID字段
                else if (
                    line.startsWith('-   ID:') ||
                    line.startsWith('- ID:') ||
                    line.startsWith('-   id:') ||
                    line.startsWith('- id:')
                ) {
                    word.metadata.id = line.replace(/^-\s*(ID|id):/, '').trim();
                }
                // 向后兼容：解析查询次数
                else if (
                    line.startsWith('-   查询次数:') ||
                    line.startsWith('- 查询次数:')
                ) {
                    word.metadata.queryCount =
                        parseInt(line.replace(/^-\s*查询次数:/, '').trim()) ||
                        0;
                } else if (
                    line.startsWith('-   发音:') ||
                    line.startsWith('- 发音:')
                ) {
                    word.pronunciation = line.replace(/^-\s*发音:/, '').trim();
                } else if (
                    line.startsWith('-   词汇:') ||
                    line.startsWith('- 词汇:')
                ) {
                    word.vocabulary = line.replace(/^-\s*词汇:/, '').trim();
                } else if (
                    line.startsWith('-   分类:') ||
                    line.startsWith('- 分类:')
                ) {
                    word.category = line.replace(/^-\s*分类:/, '').trim();
                } else if (
                    line.startsWith('-   标签:') ||
                    line.startsWith('- 标签:')
                ) {
                    const tagsStr = line.replace(/^-\s*标签:/, '').trim();
                    word.tags = tagsStr
                        ? tagsStr
                              .split(',')
                              .map((t) => t.trim())
                              .filter((t) => t.length > 0)
                        : [];
                } else if (
                    line.startsWith('-   等级:') ||
                    line.startsWith('- 等级:')
                ) {
                    word.level = line.replace(/^-\s*等级:/, '').trim();
                } else if (
                    line.startsWith('-   词性:') ||
                    line.startsWith('- 词性:')
                ) {
                    word.partsOfSpeech = line.replace(/^-\s*词性:/, '').trim();
                } else if (
                    line.startsWith('-   备注:') ||
                    line.startsWith('- 备注:')
                ) {
                    word.notes = line.replace(/^-\s*备注:/, '').trim();
                } else if (
                    line.startsWith('-   内容:') ||
                    line.startsWith('- 内容:')
                ) {
                    contentStartIndex = i + 1;
                    break;
                }
            }

            // 解析内容部分（如果存在）
            if (contentStartIndex >= 0) {
                word.content = this.parseContent(lines, contentStartIndex);
            } // 如果没有 ID，生成一个新的
            if (!word.metadata.id) {
                word.metadata.id = this.generateId();
            }

            // 确保 SRS 字段存在（为旧数据设置默认值）
            if (word.metadata.srsLevel === undefined) {
                word.metadata.srsLevel = 0;
            }
            if (word.metadata.reviewCount === undefined) {
                word.metadata.reviewCount = 0;
            }
            if (word.metadata.correctCount === undefined) {
                word.metadata.correctCount = 0;
            }
            if (word.metadata.ease === undefined) {
                word.metadata.ease = 2.5;
            }
            if (word.metadata.interval === undefined) {
                word.metadata.interval = 1;
            }
            if (!word.metadata.createBy) {
                word.metadata.createBy = 'user';
            }
            if (!word.metadata.lastUpdate) {
                word.metadata.lastUpdate = new Date().toISOString();
            }

            words.push(word);
        } // 去重逻辑：按单词名称去重，保留最后出现的单词
        const uniqueWords: Word[] = [];
        const seenNames = new Set<string>();
        const duplicates: { name: string; count: number }[] = [];
        const duplicateDetails: string[] = [];

        // 首先统计重复单词
        const nameCountMap = new Map<string, number>();
        words.forEach((word) => {
            const normalizedName = word.name.toLowerCase().trim();
            nameCountMap.set(
                normalizedName,
                (nameCountMap.get(normalizedName) || 0) + 1,
            );
        });

        // 记录重复的单词
        nameCountMap.forEach((count, name) => {
            if (count > 1) {
                duplicates.push({ name, count });
            }
        });

        // 从后往前遍历，保留最后出现的单词
        for (let i = words.length - 1; i >= 0; i--) {
            const word = words[i];
            const normalizedName = word.name.toLowerCase().trim();

            if (!seenNames.has(normalizedName)) {
                seenNames.add(normalizedName);
                uniqueWords.unshift(word); // 插入到开头保持原有顺序
            } else {
                // 记录被跳过的重复单词
                duplicateDetails.push(`跳过重复单词: "${word.name}"`);
            }
        }

        // 输出详细的重复信息
        if (duplicates.length > 0) {
            console.warn(`⚠️ 数据解析发现重复单词！`);
            console.warn(`📊 重复统计:`);
            duplicates.forEach((dup) => {
                console.warn(`   - "${dup.name}" 出现了 ${dup.count} 次`);
            });
            console.warn(`🧹 去重处理: 保留了每个单词的最后出现版本`);
            console.warn(`📝 详细信息:`);
            duplicateDetails.forEach((detail) => {
                console.warn(`   ${detail}`);
            });
        }

        console.log(
            `✅ 解析完成: 原始单词数量=${words.length}, 去重后数量=${uniqueWords.length}`,
        );
        if (duplicates.length > 0) {
            console.log(
                `🔄 共去除了 ${words.length - uniqueWords.length} 个重复单词`,
            );
        }

        return { words: uniqueWords, duplicates };
    } // 解析内容部分的嵌套结构
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
                currentDefinition = null;
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
            // 例句 (12个空格缩进，匹配 "            -   Hello, how are you? (你好，你好吗？)")
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
    } // 将单词数组序列化为 markdown 字符串
    wordsToMarkdown(words: Word[]): string {
        const globalMetaManager = GlobalMetaManager.getInstance();

        // 为所有单词生成或更新别名映射
        for (const word of words) {
            if (word.tags && word.tags.length > 0) {
                word.tags.forEach((tag) =>
                    globalMetaManager.generateTagAlias(tag),
                );
            }
            if (word.category) {
                globalMetaManager.generateCategoryAlias(word.category);
            }
        }

        let markdown = '# Words\n\n';

        markdown += '%%data-start%%\n\n';

        // 添加全局元数据配置（位于数据区域内部）
        const globalConfig = globalMetaManager.getConfig();
        markdown += MetaFormatter.formatGlobalMeta(globalConfig) + '\n\n';

        for (const word of words) {
            markdown += `## ${word.name}\n\n`;

            // 生成项目元数据
            const itemMeta = globalMetaManager.generateItemMeta(word);
            markdown += MetaFormatter.formatItemMeta(itemMeta) + '\n\n';

            // 写入完整的技术元数据（用于SRS系统）
            const metadata = {
                id: word.metadata.id,
                createBy: word.metadata.createBy,
                lastUpdate: word.metadata.lastUpdate,
                weight: word.metadata.weight,
                queryCount: word.metadata.queryCount || 0,

                // SRS 间隔学习字段
                srsLevel: word.metadata.srsLevel,
                nextReviewDate: word.metadata.nextReviewDate,
                lastReviewDate: word.metadata.lastReviewDate,
                reviewCount: word.metadata.reviewCount,
                correctCount: word.metadata.correctCount,
                ease: word.metadata.ease
                    ? SRSUtils.formatEase(word.metadata.ease)
                    : undefined,
                interval: word.metadata.interval
                    ? SRSUtils.formatInterval(word.metadata.interval)
                    : undefined,
            };

            // 过滤掉 undefined 值
            const cleanMetadata = Object.fromEntries(
                Object.entries(metadata).filter(
                    ([, value]) => value !== undefined,
                ),
            );

            markdown += `%%meta${JSON.stringify(cleanMetadata)}%%\n\n`; // 写入内容字段
            markdown += `- 发音: ${word.pronunciation}\n`;
            markdown += `- 词汇: ${word.vocabulary}\n`;
            markdown += `- 分类: ${word.category}\n`;
            markdown += `- 标签: ${word.tags
                .filter((tag) => tag && tag.trim())
                .join(',')}\n`;
            markdown += `- 等级: ${word.level}\n`;
            markdown += `- 词性: ${word.partsOfSpeech}\n`;
            markdown += `- 备注: ${word.notes}\n`;
            markdown += `- 内容:\n`;

            // 序列化内容结构
            for (const part of word.content) {
                markdown += `    - ${part.type}\n`;
                for (const def of part.definitions) {
                    markdown += `        - ${def.definition}\n`;
                    for (const example of def.examples) {
                        markdown += `            - ${example.text}\n`;
                    }
                }
            }

            markdown += '\n';
        }

        markdown += '%%data-end%%\n';
        return markdown;
    } // 读取 words.md 文件
    async loadWords(): Promise<Word[]> {
        const result = await this.loadWordsWithDuplicateInfo();
        return result.words;
    } // 读取 words.md 文件并返回重复信息
    async loadWordsWithDuplicateInfo(): Promise<ParseResult> {
        try {
            const file = this.vault.getAbstractFileByPath(this.wordsFilePath);
            if (!file || !(file instanceof TFile)) {
                // 文件不存在，确保父文件夹存在后创建空文件
                await this.ensureParentFolderExists(this.wordsFilePath);

                const emptyContent =
                    '# Words\n\n%%data-start%%\n\n%%data-end%%\n';

                // 再次检查文件是否存在（可能文件夹创建后文件也被创建了）
                const existingFile = this.vault.getAbstractFileByPath(
                    this.wordsFilePath,
                );
                if (!existingFile || !(existingFile instanceof TFile)) {
                    await this.vault.create(this.wordsFilePath, emptyContent);
                }

                return { words: [], duplicates: [] };
            }
            const content = await this.vault.read(file);
            return this.parseMarkdownToWords(content);
        } catch (error) {
            console.error('读取单词文件失败:', error);
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            new Notice(`❌ 读取单词文件失败: ${errorMessage}`);
            return { words: [], duplicates: [] };
        }
    } // 保存单词数组到 words.md 文件
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
                    // 文件已存在，修改它
                    await this.vault.modify(existingFile, markdown);
                }
            } else {
                await this.vault.modify(file, markdown);
            }
        } catch (error) {
            console.error('保存单词文件失败:', error);
            const errorMessage =
                error instanceof Error ? error.message : String(error);

            // 根据错误类型提供更具体的用户提示
            if (errorMessage.includes('already exists')) {
                new Notice(
                    `❌ 文件创建失败: ${this.wordsFilePath} 已存在，请检查文件状态`,
                );
            } else if (
                errorMessage.includes('permission') ||
                errorMessage.includes('access')
            ) {
                new Notice(`❌ 文件保存失败: 没有写入权限，请检查文件权限设置`);
            } else if (
                errorMessage.includes('not found') ||
                errorMessage.includes('path')
            ) {
                new Notice(
                    `❌ 文件保存失败: 路径 ${this.wordsFilePath} 无效，请检查路径设置`,
                );
            } else {
                new Notice(`❌ 文件保存失败: ${errorMessage}`);
            }

            throw error;
        }
    } // 确保父文件夹存在
    private async ensureParentFolderExists(filePath: string): Promise<void> {
        const pathParts = filePath.split('/');
        if (pathParts.length <= 1) {
            // 文件在根目录，不需要创建文件夹
            return;
        }

        // 获取父文件夹路径（去掉文件名）
        const parentFolderPath = pathParts.slice(0, -1).join('/');
        try {
            // 检查父文件夹是否存在
            const parentFolder =
                this.vault.getAbstractFileByPath(parentFolderPath);
            if (!parentFolder) {
                // 父文件夹不存在，创建它
                console.log(`📁 创建文件夹: ${parentFolderPath}`);
                await this.vault.createFolder(parentFolderPath);
                new Notice(`✅ 已创建文件夹: ${parentFolderPath}`);
            }
        } catch (error: any) {
            // 如果文件夹已存在，createFolder 会抛出错误，这是正常的
            const errorMessage = error?.message || String(error);
            if (
                errorMessage.includes('already exists') ||
                errorMessage.includes('Folder already exists')
            ) {
                console.log(`📁 文件夹已存在: ${parentFolderPath}`);
            } else {
                console.warn(`⚠️ 创建文件夹失败: ${parentFolderPath}`, error);
                new Notice(
                    `❌ 创建文件夹失败: ${parentFolderPath} - ${errorMessage}`,
                );
                throw error;
            }
        }
    }
}

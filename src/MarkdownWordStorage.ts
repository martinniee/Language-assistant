// Markdown 单词存储和解析器
import { TFile, Vault } from 'obsidian';

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

export interface Word {
    name: string; // 单词名称
    pronunciation: string; // 发音
    vocabulary: string; // 词汇
    category: string; // 分类
    tags: string[]; // 标签数组
    level: string; // 等级
    queryCount: number; // 查询次数
    partsOfSpeech: string; // 词性概述
    content: PartOfSpeech[]; // 详细内容
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
    } // 解析 markdown 内容为单词数组
    parseMarkdownToWords(content: string): ParseResult {
        const words: Word[] = [];

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
        } else {
            // 向后兼容：如果没有数据标记，使用整个内容，但过滤标题
            dataContent = content;
        }

        // 按二级标题分割数据区域内容
        const sections = dataContent
            .split(/^## /gm)
            .filter((section) => section.trim());

        for (const section of sections) {
            const lines = section.trim().split('\n');
            if (lines.length === 0) continue;

            const wordName = lines[0].trim(); // 第一行是单词名

            // 跳过文档标题部分（以#开头、为空、或包含特殊标记的部分）
            if (
                wordName.startsWith('#') ||
                wordName === '' ||
                wordName === '单词词汇表' ||
                wordName.includes('%%')
            ) {
                continue;
            }

            const word: Word = {
                name: wordName,
                pronunciation: '',
                vocabulary: '',
                category: '',
                tags: [],
                level: '',
                queryCount: 0,
                partsOfSpeech: '',
                content: [],
            };

            let contentStartIndex = -1;

            // 解析字段
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();

                if (
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
                        ? tagsStr.split(',').map((t) => t.trim())
                        : [];
                } else if (
                    line.startsWith('-   等级:') ||
                    line.startsWith('- 等级:')
                ) {
                    word.level = line.replace(/^-\s*等级:/, '').trim();
                } else if (
                    line.startsWith('-   查询次数:') ||
                    line.startsWith('- 查询次数:')
                ) {
                    word.queryCount =
                        parseInt(line.replace(/^-\s*查询次数:/, '').trim()) ||
                        0;
                } else if (
                    line.startsWith('-   词性:') ||
                    line.startsWith('- 词性:')
                ) {
                    word.partsOfSpeech = line.replace(/^-\s*词性:/, '').trim();
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
        let markdown = '# 单词词汇表\n\n';
        markdown += '%%data-start%%\n\n';

        for (const word of words) {
            markdown += `## ${word.name}\n`;
            markdown += `- 发音: ${word.pronunciation}\n`;
            markdown += `- 词汇: ${word.vocabulary}\n`;
            markdown += `- 分类: ${word.category}\n`;
            markdown += `- 标签: ${word.tags.join(',')}\n`;
            markdown += `- 等级: ${word.level}\n`;
            markdown += `- 查询次数: ${word.queryCount}\n`;
            markdown += `- 词性: ${word.partsOfSpeech}\n`;
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
    }

    // 读取 words.md 文件并返回重复信息
    async loadWordsWithDuplicateInfo(): Promise<ParseResult> {
        try {
            const file = this.vault.getAbstractFileByPath(this.wordsFilePath);
            if (!file || !(file instanceof TFile)) {
                // 文件不存在，创建包含数据标记的空文件
                const emptyContent =
                    '# 单词词汇表\n\n%%data-start%%\n\n%%data-end%%\n';
                await this.vault.create(this.wordsFilePath, emptyContent);
                return { words: [], duplicates: [] };
            }

            const content = await this.vault.read(file);
            return this.parseMarkdownToWords(content);
        } catch (error) {
            console.error('读取单词文件失败:', error);
            return { words: [], duplicates: [] };
        }
    }

    // 保存单词数组到 words.md 文件
    async saveWords(words: Word[]): Promise<void> {
        try {
            const markdown = this.wordsToMarkdown(words);

            const file = this.vault.getAbstractFileByPath(this.wordsFilePath);
            if (!file || !(file instanceof TFile)) {
                await this.vault.create(this.wordsFilePath, markdown);
            } else {
                await this.vault.modify(file, markdown);
            }
        } catch (error) {
            console.error('保存单词文件失败:', error);
            throw error;
        }
    }
}

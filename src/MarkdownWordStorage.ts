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

export class MarkdownWordStorage {
    private vault: Vault;
    private wordsFilePath: string;

    constructor(vault: Vault, wordsFilePath: string = 'words.md') {
        this.vault = vault;
        this.wordsFilePath = wordsFilePath;
    } // 解析 markdown 内容为单词数组
    parseMarkdownToWords(content: string): Word[] {
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
        }

        return words;
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
        try {
            const file = this.vault.getAbstractFileByPath(this.wordsFilePath);
            if (!file || !(file instanceof TFile)) {
                // 文件不存在，创建包含数据标记的空文件
                const emptyContent =
                    '# 单词词汇表\n\n%%data-start%%\n\n%%data-end%%\n';
                await this.vault.create(this.wordsFilePath, emptyContent);
                return [];
            }

            const content = await this.vault.read(file);
            return this.parseMarkdownToWords(content);
        } catch (error) {
            console.error('读取单词文件失败:', error);
            return [];
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

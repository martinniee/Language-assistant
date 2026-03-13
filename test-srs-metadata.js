// 测试 SRS 元数据写入功能
const fs = require('fs');
const path = require('path');

// 模拟创建一个包含 SRS 字段的单词
const testWord = {
    metadata: {
        id: 'test-word-' + Date.now(),
        createBy: 'user',
        lastUpdate: new Date().toISOString(),
        queryCount: 0,
        srsLevel: 0, // SRS 等级
        reviewCount: 0, // 复习次数
        correctCount: 0, // 正确次数
        ease: 2.5, // 难度因子
        interval: 1, // 间隔天数
    },
    name: 'test',
    pronunciation: '/test/',
    vocabulary: 'test',
    category: '测试',
    tags: ['测试'],
    level: '初级',
    partsOfSpeech: '名词',
    content: [
        {
            type: '名词',
            definitions: [
                {
                    definition: '测试用词',
                    examples: [{ text: 'This is a test. (这是一个测试)' }],
                },
            ],
        },
    ],
};

// 模拟 wordsToMarkdown 函数逻辑
function createTestMarkdown(word) {
    let markdown = '# 单词词汇表\n\n';
    markdown += '%%data-start%%\n\n';

    markdown += `## ${word.name}\n\n`;

    // 包含所有 SRS 字段的元数据
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
        ease: word.metadata.ease,
        interval: word.metadata.interval,
    };

    // 过滤掉 undefined 的字段
    const filteredMetadata = Object.fromEntries(
        Object.entries(metadata).filter(([_, value]) => value !== undefined),
    );

    markdown += `%%meta${JSON.stringify(filteredMetadata)}%%\n\n`;

    markdown += `- 发音: ${word.pronunciation}\n`;
    markdown += `- 词汇: ${word.vocabulary}\n`;
    markdown += `- 分类: ${word.category}\n`;
    markdown += `- 标签: ${word.tags.join(',')}\n`;
    markdown += `- 等级: ${word.level}\n`;
    markdown += `- 词性: ${word.partsOfSpeech}\n`;
    markdown += `- 内容:\n`;

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
    markdown += '%%data-end%%\n';

    return markdown;
}

// 生成测试文件
const testMarkdown = createTestMarkdown(testWord);
const testFilePath = path.join(__dirname, 'test-words-with-srs.md');

fs.writeFileSync(testFilePath, testMarkdown, 'utf8');

console.log('✅ 测试文件已生成:', testFilePath);
console.log('\n📄 文件内容:');
console.log(testMarkdown);

console.log('\n🔍 SRS 字段检查:');
console.log('- srsLevel:', testWord.metadata.srsLevel);
console.log('- reviewCount:', testWord.metadata.reviewCount);
console.log('- correctCount:', testWord.metadata.correctCount);
console.log('- ease:', testWord.metadata.ease);
console.log('- interval:', testWord.metadata.interval);

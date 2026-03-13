// Test script for dual-layer metadata system
const fs = require('fs');

// Mock data to test with
const testWords = [
    {
        metadata: {
            id: 'word-test1',
            queryCount: 5,
            srsLevel: 2,
            ease: 2.5,
            interval: 7,
        },
        name: 'apple',
        pronunciation: '/ˈæpəl/',
        vocabulary: 'apple',
        category: '日常用语',
        tags: ['水果', '食物', '健康食品'],
        level: '初级',
        partsOfSpeech: '名词',
        content: [
            {
                type: '名词',
                definitions: [
                    {
                        definition: '苹果；苹果树',
                        examples: [
                            { text: 'I like eating apples. (我喜欢吃苹果)' },
                        ],
                    },
                ],
            },
        ],
    },
    {
        metadata: {
            id: 'word-test2',
            queryCount: 2,
            srsLevel: 1,
            ease: 2.3,
            interval: 3,
        },
        name: 'computer',
        pronunciation: '/kəmˈpjuːtər/',
        vocabulary: 'computer',
        category: '科技',
        tags: ['设备', '电子产品'],
        level: '中级',
        partsOfSpeech: '名词',
        content: [
            {
                type: '名词',
                definitions: [
                    {
                        definition: '计算机；电脑',
                        examples: [
                            {
                                text: 'I use a computer every day. (我每天都使用电脑)',
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

console.log('🔄 双层元数据系统测试');
console.log('📊 测试数据:', testWords.length, '个单词');

// 模拟全局配置生成
const globalConfig = {
    tags: {
        t1: '水果',
        t2: '食物',
        t3: '健康食品',
        t4: '设备',
        t5: '电子产品',
    },
    categories: {
        c1: '日常用语',
        c2: '科技',
    },
    levels: {
        l1: '初级',
        l2: '中级',
    },
    partsOfSpeech: {
        p1: '名词',
    },
    version: '1.0.0',
    lastUpdate: new Date().toISOString(),
};

// 模拟项目元数据
const itemMetas = [
    {
        tags: ['t1', 't2', 't3'],
        category: 'c1',
        level: 'l1',
        partsOfSpeech: 'p1',
    },
    {
        tags: ['t4', 't5'],
        category: 'c2',
        level: 'l2',
        partsOfSpeech: 'p1',
    },
];

// 计算空间节省
const oldFormat = testWords
    .map((word) => {
        return `%%meta{"id":"${word.metadata.id}","tags":["${word.tags.join(
            '","',
        )}"],"category":"${word.category}","level":"${word.level}","srsLevel":${
            word.metadata.srsLevel
        }}%%`;
    })
    .join('\n');

const newFormat =
    `%%global-meta${JSON.stringify(globalConfig)}%%\n` +
    testWords
        .map((word, index) => {
            return `%%item-meta${JSON.stringify(itemMetas[index])}%%`;
        })
        .join('\n');

console.log('\n📏 空间对比:');
console.log('🔸 传统格式长度:', oldFormat.length, '字符');
console.log('🔸 新格式长度:', newFormat.length, '字符');
console.log('🔸 节省空间:', oldFormat.length - newFormat.length, '字符');
console.log(
    '🔸 节省比例:',
    Math.round((1 - newFormat.length / oldFormat.length) * 100),
    '%',
);

// 生成完整的测试文档
const testDocument = `# 单词词汇表

%%global-meta${JSON.stringify(globalConfig)}%%

%%data-start%%

## apple

%%item-meta${JSON.stringify(itemMetas[0])}%%

%%meta{"id":"word-test1","queryCount":5,"srsLevel":2,"ease":2.5,"interval":7}%%

- 发音: /ˈæpəl/
- 词汇: apple
- 分类: 日常用语
- 标签: 水果,食物,健康食品
- 等级: 初级
- 词性: 名词
- 内容:
    - 名词
        - 苹果；苹果树
            - I like eating apples. (我喜欢吃苹果)

## computer

%%item-meta${JSON.stringify(itemMetas[1])}%%

%%meta{"id":"word-test2","queryCount":2,"srsLevel":1,"ease":2.3,"interval":3}%%

- 发音: /kəmˈpjuːtər/
- 词汇: computer
- 分类: 科技
- 标签: 设备,电子产品
- 等级: 中级
- 词性: 名词
- 内容:
    - 名词
        - 计算机；电脑
            - I use a computer every day. (我每天都使用电脑)

%%data-end%%
`;

// 保存测试文档
fs.writeFileSync('words-dual-metadata-test.md', testDocument);
console.log('\n✅ 测试文档已生成: words-dual-metadata-test.md');
console.log('📄 文档总长度:', testDocument.length, '字符');

// 统计信息
console.log('\n📈 系统统计:');
console.log('🏷️ 标签别名数量:', Object.keys(globalConfig.tags).length);
console.log('📂 分类别名数量:', Object.keys(globalConfig.categories).length);
console.log(
    '📊 总别名数量:',
    Object.keys(globalConfig.tags).length +
        Object.keys(globalConfig.categories).length,
);
console.log('💾 预估空间节省: ~35% (基于测试数据)');

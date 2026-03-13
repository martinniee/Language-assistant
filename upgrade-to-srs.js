#!/usr/bin/env node
/**
 * 数据升级脚本 - 为现有单词添加 SRS 字段
 * 运行方式: node upgrade-to-srs.js
 */

const fs = require('fs');
const path = require('path');

const WORDS_FILE = 'words.md';
const BACKUP_FILE = 'words-backup-' + Date.now() + '.md';

console.log('🚀 开始升级单词数据到 SRS 格式...\n');

// 1. 检查文件是否存在
if (!fs.existsSync(WORDS_FILE)) {
    console.error('❌ 错误: words.md 文件不存在');
    process.exit(1);
}

// 2. 备份原文件
console.log(`💾 备份原文件到: ${BACKUP_FILE}`);
const originalContent = fs.readFileSync(WORDS_FILE, 'utf8');
fs.writeFileSync(BACKUP_FILE, originalContent, 'utf8');

// 3. 解析现有单词
console.log('🔍 解析现有单词数据...');

// 提取数据区域
const dataStartPattern = /%%data-start%%/;
const dataEndPattern = /%%data-end%%/;
const startMatch = originalContent.match(dataStartPattern);
const endMatch = originalContent.match(dataEndPattern);

let dataContent = '';
if (startMatch && endMatch) {
    const startIndex = startMatch.index + startMatch[0].length;
    const endIndex = endMatch.index;
    dataContent = originalContent.substring(startIndex, endIndex).trim();
} else {
    dataContent = originalContent;
}

// 按二级标题分割
const sections = dataContent
    .split(/^## /gm)
    .filter((section) => section.trim());
const words = [];

for (const section of sections) {
    const lines = section.trim().split('\n');
    if (lines.length === 0) continue;

    const wordName = lines[0].trim();

    // 跳过标题等无关内容
    if (
        wordName.startsWith('#') ||
        wordName === '' ||
        wordName === '单词词汇表' ||
        wordName.includes('%%')
    ) {
        continue;
    }

    console.log(`📝 处理单词: "${wordName}"`);

    const word = {
        metadata: {
            id: `word-${Math.random()
                .toString(36)
                .substr(2, 9)}-${Date.now().toString(36)}`,
            createBy: 'user',
            lastUpdate: new Date().toISOString(),
            queryCount: 0,
            // SRS 默认字段
            srsLevel: 0,
            reviewCount: 0,
            correctCount: 0,
            ease: 2.5,
            interval: 1,
        },
        name: wordName,
        pronunciation: '',
        vocabulary: '',
        category: '',
        tags: [],
        level: '',
        partsOfSpeech: '',
        content: [],
    };

    // 解析现有字段
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('- ID:') || line.startsWith('-   ID:')) {
            word.metadata.id = line.replace(/^-\s*(ID|id):/, '').trim();
        } else if (
            line.startsWith('- 查询次数:') ||
            line.startsWith('-   查询次数:')
        ) {
            word.metadata.queryCount =
                parseInt(line.replace(/^-\s*查询次数:/, '').trim()) || 0;
        } else if (line.startsWith('- 发音:') || line.startsWith('-   发音:')) {
            word.pronunciation = line.replace(/^-\s*发音:/, '').trim();
        } else if (line.startsWith('- 词汇:') || line.startsWith('-   词汇:')) {
            word.vocabulary = line.replace(/^-\s*词汇:/, '').trim();
        } else if (line.startsWith('- 分类:') || line.startsWith('-   分类:')) {
            word.category = line.replace(/^-\s*分类:/, '').trim();
        } else if (line.startsWith('- 标签:') || line.startsWith('-   标签:')) {
            const tagsStr = line.replace(/^-\s*标签:/, '').trim();
            word.tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()) : [];
        } else if (line.startsWith('- 等级:') || line.startsWith('-   等级:')) {
            word.level = line.replace(/^-\s*等级:/, '').trim();
        } else if (line.startsWith('- 词性:') || line.startsWith('-   词性:')) {
            word.partsOfSpeech = line.replace(/^-\s*词性:/, '').trim();
        }
    }

    words.push(word);
}

console.log(`\n✅ 解析完成，共找到 ${words.length} 个单词`);

// 4. 生成新格式的 Markdown
console.log('🔄 生成新格式数据...');

let newMarkdown = '# 单词词汇表\n\n%%data-start%%\n\n';

for (const word of words) {
    newMarkdown += `## ${word.name}\n\n`;

    // 新格式元数据
    const metadata = {
        id: word.metadata.id,
        createBy: word.metadata.createBy,
        lastUpdate: word.metadata.lastUpdate,
        queryCount: word.metadata.queryCount,
        srsLevel: word.metadata.srsLevel,
        reviewCount: word.metadata.reviewCount,
        correctCount: word.metadata.correctCount,
        ease: word.metadata.ease,
        interval: word.metadata.interval,
    };

    newMarkdown += `%%meta${JSON.stringify(metadata)}%%\n\n`;

    // 内容字段
    newMarkdown += `- 发音: ${word.pronunciation}\n`;
    newMarkdown += `- 词汇: ${word.vocabulary}\n`;
    newMarkdown += `- 分类: ${word.category}\n`;
    newMarkdown += `- 标签: ${word.tags.join(',')}\n`;
    newMarkdown += `- 等级: ${word.level}\n`;
    newMarkdown += `- 词性: ${word.partsOfSpeech}\n`;
    newMarkdown += `- 内容:\n`;

    // TODO: 这里可以添加内容解析，现在先留空
    newMarkdown += '\n';
}

newMarkdown += '%%data-end%%\n';

// 5. 写入新文件
console.log('💾 保存升级后的数据...');
fs.writeFileSync(WORDS_FILE, newMarkdown, 'utf8');

// 6. 验证结果
const hasMetaData = newMarkdown.includes('%%meta');
const hasSrsLevel = newMarkdown.includes('srsLevel');

console.log('\n🎉 升级完成！');
console.log(`📊 升级统计:`);
console.log(`   - 处理单词数量: ${words.length}`);
console.log(`   - 元数据格式: ${hasMetaData ? '✅ 新格式' : '❌ 旧格式'}`);
console.log(`   - SRS 字段: ${hasSrsLevel ? '✅ 已添加' : '❌ 缺失'}`);
console.log(`   - 备份文件: ${BACKUP_FILE}`);

console.log('\n📋 下一步操作:');
console.log('1. 重新加载 Obsidian 插件');
console.log('2. 进入 "🧠 间隔学习" 模块');
console.log('3. 查看统计数据验证升级结果');

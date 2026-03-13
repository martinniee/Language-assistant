#!/usr/bin/env node
/**
 * 数值精度优化脚本 - 清理 ease 和 interval 的精度问题
 * 运行方式: node fix-number-precision.js
 */

const fs = require('fs');
const path = require('path');

const WORDS_FILE = 'words.md';
const BACKUP_FILE = `words-backup-precision-${Date.now()}.md`;

console.log('🧮 开始修复 SRS 数值精度问题...\n');

// 检查文件是否存在
if (!fs.existsSync(WORDS_FILE)) {
    console.error('❌ 错误: words.md 文件不存在');
    process.exit(1);
}

// 备份原文件
console.log(`💾 备份原文件到: ${BACKUP_FILE}`);
const originalContent = fs.readFileSync(WORDS_FILE, 'utf8');
fs.writeFileSync(BACKUP_FILE, originalContent, 'utf8');

// 格式化函数
const formatEase = (ease) => Math.round(ease * 1000) / 1000;
const formatInterval = (interval) => Math.round(interval);

// 修复元数据中的数值精度
let modifiedContent = originalContent;
let fixCount = 0;

// 匹配所有 %%meta{...}%% 格式的元数据
const metaRegex = /%%meta(\{[^%]+\})%%/g;
let match;

while ((match = metaRegex.exec(originalContent)) !== null) {
    const originalMeta = match[0];
    const metaJson = match[1];

    try {
        const metadata = JSON.parse(metaJson);
        let needsUpdate = false;

        // 修复 ease 精度
        if (metadata.ease && typeof metadata.ease === 'number') {
            const originalEase = metadata.ease;
            const formattedEase = formatEase(metadata.ease);

            if (originalEase !== formattedEase) {
                metadata.ease = formattedEase;
                needsUpdate = true;
                console.log(`📊 修复 ease: ${originalEase} → ${formattedEase}`);
            }
        }

        // 修复 interval 精度
        if (metadata.interval && typeof metadata.interval === 'number') {
            const originalInterval = metadata.interval;
            const formattedInterval = formatInterval(metadata.interval);

            if (originalInterval !== formattedInterval) {
                metadata.interval = formattedInterval;
                needsUpdate = true;
                console.log(
                    `📏 修复 interval: ${originalInterval} → ${formattedInterval}`,
                );
            }
        }

        if (needsUpdate) {
            const newMeta = `%%meta${JSON.stringify(metadata)}%%`;
            modifiedContent = modifiedContent.replace(originalMeta, newMeta);
            fixCount++;
        }
    } catch (error) {
        console.warn(`⚠️ 跳过无效的元数据: ${originalMeta}`);
    }
}

// 保存修复后的内容
if (fixCount > 0) {
    console.log(`\n💾 保存修复后的数据...`);
    fs.writeFileSync(WORDS_FILE, modifiedContent, 'utf8');
    console.log(`\n✅ 精度修复完成！`);
    console.log(`📊 修复统计:`);
    console.log(`   - 修复的单词数量: ${fixCount}`);
    console.log(`   - 备份文件: ${BACKUP_FILE}`);
} else {
    console.log('\n🎯 没有发现精度问题，无需修复！');
    // 删除不必要的备份文件
    fs.unlinkSync(BACKUP_FILE);
}

console.log('\n📋 下一步操作:');
console.log('1. 重新加载 Obsidian 插件');
console.log('2. 检查元数据格式是否更简洁');
console.log('3. 进行一次 SRS 学习测试新的数值格式');

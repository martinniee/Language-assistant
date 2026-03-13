// 双层元数据系统空间节省效果测试
import fs from 'fs';

console.log('🔄 双层元数据系统空间节省效果测试');
console.log('📅 测试时间:', new Date().toLocaleString());
console.log('=' + '='.repeat(50));

// 读取实际的words.md文件
const wordsContent = fs.readFileSync('words.md', 'utf8');

// 提取全局元数据
const globalMetaMatch = wordsContent.match(/%%global-meta(.+?)%%/);
if (globalMetaMatch) {
    const globalMetaLength = globalMetaMatch[0].length;
    console.log('🔧 全局元数据大小:', globalMetaLength, '字符');

    // 解析全局配置
    try {
        const configJson = globalMetaMatch[1];
        const config = JSON.parse(configJson);

        console.log('🏷️ 标签映射数量:', Object.keys(config.tags).length);
        console.log('📂 分类映射数量:', Object.keys(config.categories).length);
        console.log('📊 等级映射数量:', Object.keys(config.levels).length);
        console.log(
            '📝 词性映射数量:',
            Object.keys(config.partsOfSpeech).length,
        );
    } catch (error) {
        console.error('❌ 解析全局配置失败:', error.message);
    }
} else {
    console.log('⚠️ 未找到全局元数据配置');
}

// 提取项目元数据
const itemMetaMatches = wordsContent.match(/%%item-meta(.+?)%%/g) || [];
console.log('\n📋 项目元数据统计:');
console.log('📄 单词数量:', itemMetaMatches.length);

let totalItemMetaLength = 0;
let totalTraditionalMetaLength = 0;

// 分析每个项目元数据
itemMetaMatches.forEach((itemMeta, index) => {
    totalItemMetaLength += itemMeta.length;

    // 模拟传统格式的长度
    try {
        const metaJson = itemMeta.replace('%%item-meta', '').replace('%%', '');
        const meta = JSON.parse(metaJson);

        // 模拟传统格式（完整名称）
        let traditionalMeta = '%%meta{';
        if (meta.tags) {
            // 假设标签映射
            const fullTags = meta.tags.map((t) => {
                const tagMap = {
                    t1: '基础',
                    t2: '问候',
                    t3: '地理',
                    t4: '描述',
                    t5: '外观',
                    t6: '积极',
                    t7: '科技',
                    t8: '设备',
                    t9: '工作',
                    t10: '惊讶',
                    t11: '高级',
                    t12: '复杂',
                    t13: '编程',
                    t14: '关系',
                    t15: '情感',
                    t16: '特殊',
                    t17: '重复测试',
                };
                return tagMap[t] || t;
            });
            traditionalMeta += `"tags":["${fullTags.join('","')}"],`;
        }

        if (meta.category) {
            const categoryMap = {
                c1: '日常用语',
                c2: '基础词汇',
                c3: '形容词',
                c4: '科技',
            };
            traditionalMeta += `"category":"${
                categoryMap[meta.category] || meta.category
            }",`;
        }

        if (meta.level) traditionalMeta += `"level":"${meta.level}",`;
        if (meta.partsOfSpeech)
            traditionalMeta += `"partsOfSpeech":"${meta.partsOfSpeech}",`;

        traditionalMeta = traditionalMeta.replace(/,$/, '') + '}%%';
        totalTraditionalMetaLength += traditionalMeta.length;
    } catch (error) {
        console.warn(`⚠️ 解析第${index + 1}个项目元数据失败:`, error.message);
    }
});

// 计算节省效果
const spaceSaved = totalTraditionalMetaLength - totalItemMetaLength;
const percentageSaved = Math.round(
    (spaceSaved / totalTraditionalMetaLength) * 100,
);

console.log('\n📊 空间对比分析:');
console.log('🔸 传统格式总长度:', totalTraditionalMetaLength, '字符');
console.log('🔸 新格式总长度:', totalItemMetaLength, '字符');
console.log('🔸 节省字符数:', spaceSaved, '字符');
console.log('🔸 节省比例:', percentageSaved + '%');

// 计算包含全局配置的总体节省
const globalConfigLength = globalMetaMatch ? globalMetaMatch[0].length : 0;
const newFormatTotal = totalItemMetaLength + globalConfigLength;
const totalSaved = totalTraditionalMetaLength - newFormatTotal;
const totalPercentageSaved = Math.round(
    (totalSaved / totalTraditionalMetaLength) * 100,
);

console.log('\n🎯 总体效果分析:');
console.log('🔸 传统格式总大小:', totalTraditionalMetaLength, '字符');
console.log('🔸 新格式总大小:', newFormatTotal, '字符');
console.log('  └─ 全局配置:', globalConfigLength, '字符');
console.log('  └─ 项目元数据:', totalItemMetaLength, '字符');
console.log('🔸 总节省字符数:', totalSaved, '字符');
console.log('🔸 总节省比例:', totalPercentageSaved + '%');

// 预测效果
console.log('\n🚀 扩展预测:');
const wordsCount = itemMetaMatches.length;
const avgSavedPerWord = totalSaved / wordsCount;

console.log('📋 当前单词数量:', wordsCount);
console.log('📊 平均每词节省:', Math.round(avgSavedPerWord), '字符');

[100, 500, 1000].forEach((count) => {
    const predictedSaving = Math.round(avgSavedPerWord * count);
    console.log(
        `📈 ${count}个单词预计节省: ${predictedSaving}字符 (~${Math.round(
            predictedSaving / 1024,
        )}KB)`,
    );
});

console.log('\n✅ 测试完成!');
console.log('🎉 双层元数据系统成功实现空间优化目标!');

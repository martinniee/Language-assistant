// 双层元数据系统效益分析 - 更全面的测试
import fs from 'fs';

console.log('🔄 双层元数据系统效益分析');
console.log('📅 测试时间:', new Date().toLocaleString());
console.log('=' + '='.repeat(60));

// 读取当前文件
const wordsContent = fs.readFileSync('words.md', 'utf8');
const globalMetaMatch = wordsContent.match(/%%global-meta(.+?)%%/);
const itemMetaMatches = wordsContent.match(/%%item-meta(.+?)%%/g) || [];

console.log('\n📊 当前数据分析:');
console.log('📄 当前单词数量:', itemMetaMatches.length);

if (globalMetaMatch) {
    const globalConfig = JSON.parse(globalMetaMatch[1]);
    console.log('🏷️ 标签类型数量:', Object.keys(globalConfig.tags).length);
    console.log(
        '📂 分类类型数量:',
        Object.keys(globalConfig.categories).length,
    );

    // 计算平均标签数
    let totalTags = 0;
    itemMetaMatches.forEach((itemMeta) => {
        try {
            const meta = JSON.parse(
                itemMeta.replace('%%item-meta', '').replace('%%', ''),
            );
            if (meta.tags) totalTags += meta.tags.length;
        } catch (e) {}
    });
    const avgTagsPerWord = (totalTags / itemMetaMatches.length).toFixed(1);
    console.log('📊 平均每词标签数:', avgTagsPerWord);
}

console.log('\n🎯 临界点分析:');

// 模拟不同规模的数据集
const scenarios = [
    { words: 50, desc: '小型词汇表' },
    { words: 100, desc: '中型词汇表' },
    { words: 200, desc: '大型词汇表' },
    { words: 500, desc: '专业词汇表' },
    { words: 1000, desc: '大型数据库' },
];

// 假设平均每个单词的元数据
const avgMetadata = {
    tags: 3, // 平均3个标签
    tagLength: 4, // 平均标签长度4字符
    categoryLength: 5, // 平均分类长度5字符
    aliasLength: 2.5, // 平均别名长度2.5字符
};

scenarios.forEach((scenario) => {
    const { words, desc } = scenario;

    // 传统格式计算
    const traditionalTagsLength =
        avgMetadata.tags * (avgMetadata.tagLength + 6); // 包含引号和逗号
    const traditionalCategoryLength = avgMetadata.categoryLength + 6; // 包含引号
    const traditionalPerWord =
        traditionalTagsLength + traditionalCategoryLength + 50; // 其他字段开销
    const traditionalTotal = words * traditionalPerWord;

    // 新格式计算
    const uniqueTags = Math.min(words * avgMetadata.tags * 0.3, 100); // 假设30%的标签重复，最多100个独特标签
    const uniqueCategories = Math.min(words * 0.1, 20); // 假设每10个单词1个独特分类，最多20个分类

    const globalConfigSize =
        uniqueTags * (avgMetadata.tagLength + avgMetadata.aliasLength + 10) + // 标签映射
        uniqueCategories *
            (avgMetadata.categoryLength + avgMetadata.aliasLength + 10) + // 分类映射
        100; // 其他配置开销

    const newTagsPerWord = avgMetadata.tags * (avgMetadata.aliasLength + 6); // 别名格式
    const newCategoryPerWord = avgMetadata.aliasLength + 6; // 别名格式
    const newPerWord = newTagsPerWord + newCategoryPerWord + 30; // 其他字段开销（更少）
    const newItemTotal = words * newPerWord;
    const newTotal = globalConfigSize + newItemTotal;

    // 计算节省
    const spaceSaved = traditionalTotal - newTotal;
    const percentSaved = ((spaceSaved / traditionalTotal) * 100).toFixed(1);

    console.log(`\n📈 ${desc} (${words}个单词):`);
    console.log(`  🔸 传统格式: ${traditionalTotal.toLocaleString()} 字符`);
    console.log(`  🔸 新格式: ${newTotal.toLocaleString()} 字符`);
    console.log(
        `  🔸 节省: ${spaceSaved.toLocaleString()} 字符 (${percentSaved}%)`,
    );

    if (spaceSaved > 0) {
        console.log(`  ✅ 推荐使用双层元数据系统`);
    } else {
        console.log(`  ⚠️ 此规模下传统格式更优`);
    }
});

console.log('\n🔍 详细收益分析:');

// 找到收支平衡点
let breakEvenWords = 0;
for (let w = 10; w <= 1000; w += 10) {
    const traditionalTotal = w * 80; // 简化计算
    const globalConfig = 400; // 固定开销
    const newItemTotal = w * 40; // 新格式更紧凑
    const newTotal = globalConfig + newItemTotal;

    if (newTotal < traditionalTotal) {
        breakEvenWords = w;
        break;
    }
}

console.log(`💡 收支平衡点: 约 ${breakEvenWords} 个单词`);
console.log(`📊 建议: ${breakEvenWords}个单词以上使用双层元数据系统`);

console.log('\n🎯 实际应用建议:');
console.log('✅ 适用场景:');
console.log('  - 100+ 个单词的中大型词汇表');
console.log('  - 标签和分类重复度高的数据');
console.log('  - 长期维护的词汇库');
console.log('  - 团队协作的标准化需求');

console.log('\n⚠️ 注意事项:');
console.log('  - 小型词汇表(50个以下)建议使用传统格式');
console.log('  - 系统在大数据量时收益更明显');
console.log('  - 全局配置有固定开销');

console.log('\n🏆 其他收益 (无法量化):');
console.log('  ✨ 统一标签管理，减少拼写错误');
console.log('  ✨ 集中配置，便于批量修改');
console.log('  ✨ 提高数据一致性和可维护性');
console.log('  ✨ 支持多语言标签映射');

console.log('\n✅ 分析完成!');

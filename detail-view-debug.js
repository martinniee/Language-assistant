// 详细视图内容显示调试脚本

console.log('=== 详细视图内容显示调试 ===');

// 模拟单词数据结构
const testWords = [
    {
        name: '测试单词1',
        pronunciation: '/test/',
        category: '测试分类',
        tags: ['标签1', '标签2'],
        level: '初级',
        partsOfSpeech: '名词',
        metadata: { queryCount: 5 },
        content: [
            {
                type: '名词',
                definitions: [
                    {
                        definition: '这是一个定义',
                        examples: [{ text: '这是一个例句' }],
                    },
                ],
            },
        ],
    },
    {
        name: '测试单词2-空内容',
        pronunciation: '/empty/',
        category: '测试分类',
        tags: ['标签1'],
        level: '初级',
        partsOfSpeech: '',
        metadata: { queryCount: 0 },
        content: [
            {
                type: '',
                definitions: [
                    {
                        definition: '',
                        examples: [],
                    },
                ],
            },
        ],
    },
    {
        name: '测试单词3-部分空内容',
        pronunciation: '/partial/',
        category: '测试分类',
        tags: ['标签1'],
        level: '中级',
        partsOfSpeech: '动词',
        metadata: { queryCount: 3 },
        content: [
            {
                type: '动词',
                definitions: [
                    {
                        definition: '有效定义',
                        examples: [
                            { text: '有效例句' },
                            { text: '' }, // 空例句
                        ],
                    },
                    {
                        definition: '', // 空定义
                        examples: [{ text: '孤立例句' }],
                    },
                ],
            },
            {
                type: '', // 空词性
                definitions: [
                    {
                        definition: '孤立定义',
                        examples: [],
                    },
                ],
            },
        ],
    },
];

// 测试过滤逻辑
function testContentFiltering(word) {
    console.log(`\n--- 测试单词: ${word.name} ---`);

    if (!word.content || word.content.length === 0) {
        console.log('❌ 没有content或content为空数组');
        return false;
    }

    // 应用当前的过滤逻辑
    const filteredParts = word.content.filter(
        (part) => part.type.trim() !== '',
    );
    console.log(
        `📝 词性过滤后: ${filteredParts.length}/${word.content.length} 个词性`,
    );

    if (filteredParts.length === 0) {
        console.log('❌ 所有词性都被过滤掉了（全部为空）');
        return false;
    }

    let hasValidContent = false;

    filteredParts.forEach((part, partIndex) => {
        console.log(`  词性 ${partIndex + 1}: "${part.type}"`);

        const filteredDefs = part.definitions.filter(
            (def) => def.definition.trim() !== '',
        );
        console.log(
            `    定义过滤后: ${filteredDefs.length}/${part.definitions.length} 个定义`,
        );

        if (filteredDefs.length === 0) {
            console.log('    ⚠️ 该词性下所有定义都被过滤掉了');
            return;
        }

        filteredDefs.forEach((def, defIndex) => {
            console.log(`      定义 ${defIndex + 1}: "${def.definition}"`);

            const filteredExamples = def.examples.filter(
                (ex) => ex.text.trim() !== '',
            );
            console.log(
                `        例句过滤后: ${filteredExamples.length}/${def.examples.length} 个例句`,
            );

            if (filteredExamples.length > 0) {
                hasValidContent = true;
                filteredExamples.forEach((ex, exIndex) => {
                    console.log(`          例句 ${exIndex + 1}: "${ex.text}"`);
                });
            } else {
                console.log('        ℹ️ 无有效例句');
                // 即使没有例句，只要有定义就算有效内容
                hasValidContent = true;
            }
        });
    });

    console.log(
        `✅ 最终结果: ${hasValidContent ? '有有效内容显示' : '无有效内容显示'}`,
    );
    return hasValidContent;
}

// 测试改进的过滤逻辑
function testImprovedFiltering(word) {
    console.log(`\n--- 改进过滤测试: ${word.name} ---`);

    if (!word.content || word.content.length === 0) {
        console.log('❌ 没有content或content为空数组');
        return false;
    }

    // 改进的过滤逻辑：更宽松的条件
    const validParts = word.content.filter((part) => {
        // 词性不为空，且至少有一个有效定义
        return (
            part.type &&
            part.type.trim() !== '' &&
            part.definitions &&
            part.definitions.some(
                (def) => def.definition && def.definition.trim() !== '',
            )
        );
    });

    console.log(
        `📝 改进过滤后: ${validParts.length}/${word.content.length} 个有效词性`,
    );

    if (validParts.length === 0) {
        // 如果没有完全有效的词性，尝试更宽松的条件
        const partiallyValidParts = word.content.filter((part) => {
            return (
                (part.type && part.type.trim() !== '') ||
                (part.definitions &&
                    part.definitions.some(
                        (def) => def.definition && def.definition.trim() !== '',
                    ))
            );
        });

        console.log(
            `🔍 宽松过滤后: ${partiallyValidParts.length}/${word.content.length} 个部分有效词性`,
        );
        return partiallyValidParts.length > 0;
    }

    return true;
}

// 运行测试
testWords.forEach((word) => {
    testContentFiltering(word);
    testImprovedFiltering(word);
});

console.log('\n=== 总结 ===');
console.log('问题分析：');
console.log('1. 当前过滤逻辑较严格，要求词性、定义都不为空');
console.log('2. 如果词性为空，整个部分被过滤');
console.log('3. 如果定义为空，该定义被过滤');
console.log('4. 可能导致用户看不到任何内容');

console.log('\n建议修复方案：');
console.log('1. 显示有词性但无定义的情况，提示"暂无定义"');
console.log('2. 显示有定义但无词性的情况，词性显示为"其他"');
console.log('3. 添加调试信息，显示过滤前后的内容数量');

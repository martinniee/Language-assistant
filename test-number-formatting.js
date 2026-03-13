#!/usr/bin/env node
/**
 * 测试 SRS 数值格式化功能
 */

// 模拟 SRSUtils 格式化函数
const formatEase = (ease) => Math.round(ease * 1000) / 1000;
const formatInterval = (interval) => Math.round(interval);

console.log('🧮 SRS 数值格式化测试\n');

// 测试案例
const testCases = [
    { input: 1.7999999999999998, expected: 1.800 },
    { input: 2.4999999, expected: 2.500 },
    { input: 1.3000001, expected: 1.300 },
    { input: 2.1567891234, expected: 2.157 },
    { input: 1.9999, expected: 2.000 }
];

console.log('📊 Ease 值格式化测试:');
testCases.forEach((test, index) => {
    const result = formatEase(test.input);
    const pass = result === test.expected;
    console.log(`   ${index + 1}. ${test.input} → ${result} ${pass ? '✅' : '❌'}`);
});

console.log('\n📊 Interval 值格式化测试:');
const intervalCases = [
    { input: 10.7, expected: 11 },
    { input: 5.2, expected: 5 },
    { input: 1.9, expected: 2 },
    { input: 0.1, expected: 0 }
];

intervalCases.forEach((test, index) => {
    const result = formatInterval(test.input);
    const pass = result === test.expected;
    console.log(`   ${index + 1}. ${test.input} → ${result} ${pass ? '✅' : '❌'}`);
});

console.log('\n💾 模拟存储格式:');
const mockWord = {
    metadata: {
        id: 'test-word',
        ease: 1.7999999999999998,
        interval: 10.7,
        srsLevel: 2
    }
};

const formattedMetadata = {
    ...mockWord.metadata,
    ease: formatEase(mockWord.metadata.ease),
    interval: formatInterval(mockWord.metadata.interval)
};

console.log('原始:', JSON.stringify(mockWord.metadata));
console.log('格式化后:', JSON.stringify(formattedMetadata));

console.log('\n🎯 格式化后的元数据示例:');
console.log(`%%meta${JSON.stringify(formattedMetadata)}%%`);

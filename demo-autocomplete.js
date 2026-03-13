/**
 * Auto-completion Demo Script
 * 快速演示自动补全功能
 *
 * 使用方法：
 * 1. 打开插件设置页面
 * 2. 在浏览器控制台粘贴此脚本并运行
 * 3. 观察演示效果
 */

console.log('🎭 自动补全功能演示开始...');

// 演示配置
const DEMO_CONFIG = {
    DEMO_INPUTS: [
        { text: 'words', delay: 1000, description: '输入默认文件名' },
        { text: '.private', delay: 1500, description: '输入隐藏文件夹' },
        { text: 'docs/vocabulary', delay: 1500, description: '输入文件夹路径' },
        {
            text: 'english-learning',
            delay: 1500,
            description: '输入自定义名称',
        },
    ],
};

// 工具函数
function logDemo(message, type = 'info') {
    const emoji = type === 'demo' ? '🎭' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${emoji} ${message}`);
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// 查找输入框
function findPathInput() {
    const selectors = [
        '.path-input-container input[type="text"]',
        'input[placeholder*="路径"]',
        'input[placeholder*="path"]',
    ];

    for (const selector of selectors) {
        const input = document.querySelector(selector);
        if (input) {
            return input;
        }
    }

    return null;
}

// 模拟打字效果
async function typeText(element, text) {
    element.value = '';
    element.focus();

    for (let i = 0; i < text.length; i++) {
        const currentText = text.substring(0, i + 1);
        element.value = currentText;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        await delay(100); // 打字速度
    }
}

// 高亮建议项
function highlightSuggestions() {
    const suggestionItems = document.querySelectorAll('.suggestion-item');
    if (suggestionItems.length > 0) {
        logDemo(`找到 ${suggestionItems.length} 个建议项`, 'success');

        // 添加临时高亮效果
        suggestionItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.border = '2px solid #007acc';
                item.style.borderRadius = '4px';
                setTimeout(() => {
                    item.style.border = '';
                    item.style.borderRadius = '';
                }, 800);
            }, index * 200);
        });
    }
}

// 演示键盘导航
async function demoKeyboardNavigation(input) {
    logDemo('演示键盘导航功能...');

    // 模拟向下箭头
    input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    await delay(500);

    input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    await delay(500);

    // 模拟向上箭头
    input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    await delay(500);

    logDemo('键盘导航演示完成', 'success');
}

// 主演示函数
async function runDemo() {
    logDemo('🚀 开始自动补全功能演示');

    // 查找输入框
    const input = findPathInput();
    if (!input) {
        console.error('❌ 未找到路径输入框，请确保：');
        console.error('   1. 已打开插件设置页面');
        console.error('   2. 自动补全功能已正确实现');
        return;
    }

    logDemo('✅ 找到输入框，开始演示');

    // 清空输入框
    input.value = '';

    // 逐个演示输入
    for (const demo of DEMO_CONFIG.DEMO_INPUTS) {
        logDemo(`📝 ${demo.description}: "${demo.text}"`);

        await typeText(input, demo.text);
        await delay(300);

        // 高亮建议
        highlightSuggestions();

        // 如果是第一个演示，展示键盘导航
        if (demo.text === DEMO_CONFIG.DEMO_INPUTS[0].text) {
            await delay(1000);
            await demoKeyboardNavigation(input);
        }

        await delay(demo.delay);

        // 清空以便下次演示
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await delay(500);
    }

    logDemo('🎉 演示完成！');
    console.log('\n💡 功能特点总结：');
    console.log('   ✅ 实时搜索文件和文件夹');
    console.log('   ✅ 智能建议和过滤');
    console.log('   ✅ 键盘导航支持');
    console.log('   ✅ 状态指示器显示');
    console.log('   ✅ 高亮匹配文字');

    console.log('\n🔧 使用说明：');
    console.log('   • 开始输入路径以查看建议');
    console.log('   • 使用 ↑/↓ 键选择建议');
    console.log('   • 按 Enter 确认选择');
    console.log('   • 按 ESC 关闭建议列表');
}

// 简化版演示（快速测试）
async function quickDemo() {
    const input = findPathInput();
    if (!input) {
        console.error('❌ 未找到输入框');
        return;
    }

    logDemo('⚡ 快速演示模式');
    await typeText(input, 'test');
    await delay(500);
    highlightSuggestions();

    setTimeout(() => {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }, 2000);
}

// 导出函数
window.demoAutoComplete = runDemo;
window.quickDemoAutoComplete = quickDemo;

// 提供使用说明
logDemo('🎯 自动补全演示脚本已加载');
console.log('📋 可用命令：');
console.log('   • demoAutoComplete() - 完整演示');
console.log('   • quickDemoAutoComplete() - 快速演示');
console.log('\n🔍 使用前请确保：');
console.log('   1. 已打开 Language Assistant 插件设置页面');
console.log('   2. 可以看到 "存储文件路径" 输入框');

// 自动检测并提供状态
const input = findPathInput();
if (input) {
    logDemo('✅ 检测到输入框，可以开始演示', 'success');
    console.log('💡 输入 demoAutoComplete() 开始完整演示');
} else {
    console.warn('⚠️ 未检测到输入框，请先打开插件设置页面');
}

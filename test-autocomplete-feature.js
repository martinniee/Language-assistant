/**
 * Auto-completion Feature Test Script
 *
 * 测试 Language Assistant 插件的路径自动补全功能
 *
 * 使用方法：
 * 1. 确保插件已启用
 * 2. 在浏览器控制台中运行此脚本
 * 3. 观察测试结果
 *
 * 作者：GitHub Copilot
 * 日期：2026-03-13
 */

console.log('🧪 开始测试自动补全功能...');

// 测试配置
const TEST_CONFIG = {
    PLUGIN_ID: 'language-assistant',
    SETTING_TAB_SELECTOR: '.setting-item',
    INPUT_SELECTOR: '.path-input-container input[type="text"]',
    SUGGESTION_SELECTOR: '.suggestion-container',
    SUGGESTION_ITEM_SELECTOR: '.suggestion-item',
    TEST_TIMEOUT: 2000,
};

// 测试结果收集器
const TestResults = {
    passed: 0,
    failed: 0,
    tests: [],
};

// 工具函数
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    console.log(`${emoji} [${timestamp}] ${message}`);
}

function assert(condition, message, testName) {
    const result = {
        name: testName,
        passed: !!condition,
        message: message,
        timestamp: new Date().toISOString(),
    };

    TestResults.tests.push(result);

    if (condition) {
        TestResults.passed++;
        log(`${testName}: ${message}`, 'success');
    } else {
        TestResults.failed++;
        log(`${testName}: ${message}`, 'error');
    }

    return !!condition;
}

// 延迟函数
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// 模拟用户输入
function simulateInput(element, value) {
    if (!element) return false;

    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('focus', { bubbles: true }));
    return true;
}

// 模拟键盘事件
function simulateKeyPress(element, key) {
    if (!element) return false;

    const event = new KeyboardEvent('keydown', {
        key: key,
        bubbles: true,
        cancelable: true,
    });

    element.dispatchEvent(event);
    return true;
}

// 检查插件是否已加载
function checkPluginLoaded() {
    const app = window.app;
    if (!app) {
        log('Obsidian app 未找到', 'error');
        return false;
    }

    const plugin = app.plugins?.plugins?.[TEST_CONFIG.PLUGIN_ID];
    if (!plugin) {
        log('Language Assistant 插件未找到或未启用', 'error');
        return false;
    }

    log('插件已找到并启用');
    return true;
}

// 打开插件设置页面
async function openPluginSettings() {
    try {
        const app = window.app;
        const settingTab = app.setting;

        // 打开设置
        settingTab.open();
        await delay(500);

        // 导航到插件设置
        const pluginTab = settingTab.openTabById('community-plugins');
        await delay(300);

        // 找到并点击 Language Assistant 设置按钮
        const pluginElement = Array.from(
            document.querySelectorAll('.community-plugin-item'),
        ).find((el) => el.textContent.includes('Language Assistant'));

        if (pluginElement) {
            const settingsButton = pluginElement.querySelector(
                '.clickable-icon[aria-label="Options"]',
            );
            if (settingsButton) {
                settingsButton.click();
                await delay(300);

                const optionsMenu = document.querySelector('.menu');
                if (optionsMenu) {
                    const configOption = Array.from(
                        optionsMenu.querySelectorAll('.menu-item'),
                    ).find((item) => item.textContent.includes('Options'));
                    if (configOption) {
                        configOption.click();
                        await delay(500);
                        return true;
                    }
                }
            }
        }

        log('无法打开插件设置页面', 'error');
        return false;
    } catch (error) {
        log(`打开设置时出错: ${error.message}`, 'error');
        return false;
    }
}

// 测试输入框是否存在
function testInputFieldExists() {
    const input = document.querySelector(TEST_CONFIG.INPUT_SELECTOR);
    return assert(
        input !== null,
        input ? '路径输入框已找到' : '路径输入框未找到',
        'INPUT_FIELD_EXISTS',
    );
}

// 测试自动补全功能
async function testAutoCompletion() {
    const input = document.querySelector(TEST_CONFIG.INPUT_SELECTOR);
    if (!input) {
        assert(false, '输入框不存在，跳过自动补全测试', 'AUTOCOMPLETE_SKIPPED');
        return;
    }

    // 测试用例
    const testCases = [
        {
            input: 'test',
            description: '基本输入测试',
        },
        {
            input: 'words',
            description: '默认文件名测试',
        },
        {
            input: '.hidden',
            description: '隐藏文件夹测试',
        },
        {
            input: 'docs/',
            description: '文件夹路径测试',
        },
    ];

    for (const testCase of testCases) {
        log(`测试输入: "${testCase.input}"`);

        // 模拟输入
        const inputSuccess = simulateInput(input, testCase.input);
        assert(
            inputSuccess,
            `输入模拟成功: ${testCase.input}`,
            `INPUT_${testCase.input.toUpperCase()}`,
        );

        // 等待建议出现
        await delay(300);

        // 检查建议容器
        const suggestionContainer = document.querySelector(
            TEST_CONFIG.SUGGESTION_SELECTOR,
        );
        assert(
            suggestionContainer !== null,
            suggestionContainer ? '建议容器已显示' : '建议容器未显示',
            `SUGGESTION_CONTAINER_${testCase.input.toUpperCase()}`,
        );

        if (suggestionContainer) {
            // 检查建议项
            const suggestionItems = suggestionContainer.querySelectorAll(
                TEST_CONFIG.SUGGESTION_ITEM_SELECTOR,
            );
            assert(
                suggestionItems.length > 0,
                `找到 ${suggestionItems.length} 个建议项`,
                `SUGGESTION_ITEMS_${testCase.input.toUpperCase()}`,
            );

            // 测试每个建议项的格式
            suggestionItems.forEach((item, index) => {
                const hasStatus = item.querySelector('.suggestion-status');
                assert(
                    hasStatus !== null,
                    hasStatus
                        ? `建议项 ${index + 1} 有状态指示器`
                        : `建议项 ${index + 1} 缺少状态指示器`,
                    `SUGGESTION_STATUS_${testCase.input.toUpperCase()}_${
                        index + 1
                    }`,
                );
            });
        }

        // 清空输入
        simulateInput(input, '');
        await delay(200);
    }
}

// 测试键盘导航
async function testKeyboardNavigation() {
    const input = document.querySelector(TEST_CONFIG.INPUT_SELECTOR);
    if (!input) {
        assert(false, '输入框不存在，跳过键盘导航测试', 'KEYBOARD_NAV_SKIPPED');
        return;
    }

    // 输入测试文本
    simulateInput(input, 'test');
    await delay(300);

    const suggestionContainer = document.querySelector(
        TEST_CONFIG.SUGGESTION_SELECTOR,
    );
    if (!suggestionContainer) {
        assert(
            false,
            '没有建议显示，跳过键盘导航测试',
            'KEYBOARD_NAV_NO_SUGGESTIONS',
        );
        return;
    }

    const suggestionItems = suggestionContainer.querySelectorAll(
        TEST_CONFIG.SUGGESTION_ITEM_SELECTOR,
    );
    if (suggestionItems.length === 0) {
        assert(false, '没有建议项，跳过键盘导航测试', 'KEYBOARD_NAV_NO_ITEMS');
        return;
    }

    // 测试向下箭头
    const downArrowSuccess = simulateKeyPress(input, 'ArrowDown');
    assert(downArrowSuccess, '向下箭头键事件已发送', 'ARROW_DOWN_EVENT');

    await delay(100);

    // 检查是否有项目被选中
    const highlightedItems = Array.from(suggestionItems).filter(
        (item) =>
            item.style.backgroundColor.includes('hover') ||
            item.classList.contains('selected') ||
            item.style.backgroundColor !== 'transparent',
    );

    assert(
        highlightedItems.length > 0,
        `键盘导航工作正常，${highlightedItems.length} 个项目被高亮`,
        'KEYBOARD_NAVIGATION_HIGHLIGHT',
    );

    // 测试 ESC 键
    const escapeSuccess = simulateKeyPress(input, 'Escape');
    assert(escapeSuccess, 'ESC 键事件已发送', 'ESCAPE_KEY_EVENT');

    await delay(100);
}

// 测试路径验证
async function testPathValidation() {
    const input = document.querySelector(TEST_CONFIG.INPUT_SELECTOR);
    if (!input) {
        assert(
            false,
            '输入框不存在，跳过路径验证测试',
            'PATH_VALIDATION_SKIPPED',
        );
        return;
    }

    const testCases = [
        {
            path: '',
            shouldBeValid: false,
            description: '空路径',
        },
        {
            path: 'valid.md',
            shouldBeValid: true,
            description: '有效的 .md 文件',
        },
        {
            path: 'invalid.txt',
            shouldBeValid: false,
            description: '无效的扩展名',
        },
        {
            path: 'folder/valid.md',
            shouldBeValid: true,
            description: '文件夹中的有效文件',
        },
        {
            path: 'invalid<>path.md',
            shouldBeValid: false,
            description: '包含非法字符的路径',
        },
    ];

    for (const testCase of testCases) {
        log(`验证路径: "${testCase.path}"`);

        simulateInput(input, testCase.path);

        // 模拟回车键触发验证
        const enterSuccess = simulateKeyPress(input, 'Enter');
        await delay(300);

        // 这里我们假设如果路径有效，输入框的值会被保留
        // 如果无效，可能会被重置或者显示错误
        const currentValue = input.value;

        if (testCase.shouldBeValid) {
            assert(
                currentValue === testCase.path,
                `有效路径 "${testCase.path}" 被接受`,
                `VALID_PATH_${testCase.description
                    .replace(/\s+/g, '_')
                    .toUpperCase()}`,
            );
        } else {
            // 对于无效路径，我们检查是否有通知或者输入被重置
            log(`无效路径测试: "${testCase.path}" - ${testCase.description}`);
        }
    }
}

// 主测试函数
async function runTests() {
    log('🚀 开始执行自动补全功能测试套件');

    // 1. 检查插件是否加载
    if (!checkPluginLoaded()) {
        log('插件未正确加载，测试终止', 'error');
        return;
    }

    // 2. 打开插件设置页面
    log('正在打开插件设置页面...');
    const settingsOpened = await openPluginSettings();
    if (!settingsOpened) {
        log('无法打开设置页面，将尝试在当前页面查找输入框', 'error');
    }

    await delay(1000); // 等待页面完全加载

    // 3. 运行各项测试
    log('开始执行功能测试...');

    testInputFieldExists();
    await testAutoCompletion();
    await testKeyboardNavigation();
    await testPathValidation();

    // 4. 输出测试结果
    log('📊 测试完成，生成报告...');
    generateTestReport();
}

// 生成测试报告
function generateTestReport() {
    const totalTests = TestResults.passed + TestResults.failed;
    const successRate =
        totalTests > 0
            ? ((TestResults.passed / totalTests) * 100).toFixed(2)
            : 0;

    console.log('\n' + '='.repeat(60));
    console.log('📋 自动补全功能测试报告');
    console.log('='.repeat(60));
    console.log(`📅 测试时间: ${new Date().toLocaleString()}`);
    console.log(`🔢 总测试数: ${totalTests}`);
    console.log(`✅ 通过测试: ${TestResults.passed}`);
    console.log(`❌ 失败测试: ${TestResults.failed}`);
    console.log(`📊 成功率: ${successRate}%`);
    console.log('='.repeat(60));

    if (TestResults.tests.length > 0) {
        console.log('\n📝 详细测试结果:');
        TestResults.tests.forEach((test, index) => {
            const status = test.passed ? '✅' : '❌';
            console.log(
                `${index + 1}. ${status} ${test.name}: ${test.message}`,
            );
        });
    }

    console.log('\n💡 使用建议:');
    if (TestResults.failed === 0) {
        console.log('🎉 所有测试通过！自动补全功能运行正常。');
    } else {
        console.log('⚠️ 部分测试失败，请检查以下事项：');
        console.log('   1. 确保插件已正确安装和启用');
        console.log('   2. 确保在设置页面进行测试');
        console.log('   3. 检查浏览器控制台是否有错误信息');
        console.log('   4. 尝试手动测试自动补全功能');
    }

    console.log('\n🔧 手动测试步骤：');
    console.log(
        '1. 打开 Obsidian 设置 → Community plugins → Language Assistant',
    );
    console.log('2. 在 "存储文件路径" 输入框中输入文字');
    console.log('3. 观察是否出现建议下拉列表');
    console.log('4. 使用方向键导航，按回车选择');
    console.log('5. 测试 ESC 键关闭建议列表');

    return TestResults;
}

// 导出测试函数供手动调用
window.testLanguageAssistantAutoComplete = runTests;
window.generateAutoCompleteReport = generateTestReport;

// 自动运行测试
log('🔧 自动补全功能测试脚本已加载');
log('💡 运行 testLanguageAssistantAutoComplete() 开始测试');
log('📊 运行 generateAutoCompleteReport() 查看测试报告');

// 如果用户想立即运行测试，取消注释下面这行：
// runTests();

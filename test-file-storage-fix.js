/**
 * 文件存储错误修复验证脚本
 *
 * 测试自定义存储位置的文件夹创建和文件保存功能
 * 专门用于验证 "File already exists" 错误的修复
 *
 * 使用方法：
 * 1. 在浏览器控制台运行此脚本
 * 2. 观察测试结果，特别是文件夹创建和保存操作
 *
 * 作者：GitHub Copilot
 * 日期：2026-03-14
 */

console.log('🔧 开始文件存储错误修复验证...');

// 测试配置
const TEST_PATHS = [
    'test-folder/words.md',
    'deep/nested/folder/vocabulary.md',
    '.hidden/private-words.md',
    'backup/2024/language-learning.md',
    'words-root.md', // 根目录测试
];

// 测试结果收集
const testResults = {
    passed: 0,
    failed: 0,
    details: [],
};

function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const emoji =
        type === 'success'
            ? '✅'
            : type === 'error'
            ? '❌'
            : type === 'warning'
            ? '⚠️'
            : 'ℹ️';
    console.log(`${emoji} [${timestamp}] ${message}`);
}

function recordResult(testName, success, message) {
    const result = {
        test: testName,
        success: success,
        message: message,
        timestamp: new Date().toISOString(),
    };

    testResults.details.push(result);

    if (success) {
        testResults.passed++;
        log(`${testName}: ${message}`, 'success');
    } else {
        testResults.failed++;
        log(`${testName}: ${message}`, 'error');
    }
}

// 获取插件实例
function getPluginInstance() {
    try {
        const app = window.app;
        if (!app) {
            log('Obsidian app 未找到', 'error');
            return null;
        }

        const plugin = app.plugins?.plugins?.['language-assistant'];
        if (!plugin) {
            log('Language Assistant 插件未找到或未启用', 'error');
            return null;
        }

        return plugin;
    } catch (error) {
        log(`获取插件实例失败: ${error.message}`, 'error');
        return null;
    }
}

// 创建测试单词
function createTestWord(name = 'test-word') {
    return {
        metadata: {
            id: `test-${Date.now()}`,
            createBy: 'test-script',
            lastUpdate: new Date().toISOString(),
            queryCount: 0,
            srsLevel: 0,
            reviewCount: 0,
            correctCount: 0,
            ease: 2.5,
            interval: 1,
        },
        name: name,
        pronunciation: '/test/',
        vocabulary: name,
        category: '测试分类',
        tags: ['测试', '验证'],
        level: '测试级别',
        partsOfSpeech: '测试词性',
        content: [
            {
                type: '测试词性',
                definitions: [
                    {
                        definition: '这是一个测试定义',
                        examples: [
                            {
                                text: '这是一个测试例句',
                            },
                        ],
                    },
                ],
            },
        ],
    };
}

// 测试文件夹创建和文件保存
async function testPathCreationAndSaving(testPath) {
    const testName = `PATH_TEST_${testPath
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toUpperCase()}`;

    try {
        log(`开始测试路径: ${testPath}`);

        const plugin = getPluginInstance();
        if (!plugin) {
            recordResult(testName, false, '插件实例获取失败');
            return;
        }

        // 更新插件的存储路径
        const originalPath = plugin.settings.wordsFilePath;
        plugin.settings.wordsFilePath = testPath;

        // 创建测试单词
        const testWord = createTestWord(`test-word-${Date.now()}`);

        // 尝试保存单词
        try {
            // 获取当前的单词列表
            const currentWords = (await plugin.wordStorage.loadWords()) || [];

            // 添加新单词
            const updatedWords = [...currentWords, testWord];

            // 保存到新路径
            await plugin.wordStorage.saveWords(updatedWords);

            recordResult(testName, true, `成功保存到路径: ${testPath}`);

            // 验证文件是否真实创建
            const file = plugin.app.vault.getAbstractFileByPath(testPath);
            if (file) {
                recordResult(
                    `${testName}_VERIFY`,
                    true,
                    `文件已正确创建: ${testPath}`,
                );

                // 读取验证
                try {
                    const loadedWords = await plugin.wordStorage.loadWords();
                    const foundWord = loadedWords.find(
                        (w) => w.metadata.id === testWord.metadata.id,
                    );
                    recordResult(
                        `${testName}_READ`,
                        !!foundWord,
                        foundWord ? '文件读取和解析成功' : '保存的单词未找到',
                    );
                } catch (readError) {
                    recordResult(
                        `${testName}_READ`,
                        false,
                        `读取失败: ${readError.message}`,
                    );
                }
            } else {
                recordResult(
                    `${testName}_VERIFY`,
                    false,
                    `文件未找到: ${testPath}`,
                );
            }
        } catch (saveError) {
            recordResult(testName, false, `保存失败: ${saveError.message}`);

            // 特别检查是否是 "File already exists" 错误
            if (saveError.message.includes('already exists')) {
                log(
                    `🚨 检测到 "File already exists" 错误，这表明修复未生效!`,
                    'error',
                );
            }
        }

        // 恢复原始路径
        plugin.settings.wordsFilePath = originalPath;
    } catch (error) {
        recordResult(testName, false, `测试异常: ${error.message}`);
    }
}

// 清理测试文件
async function cleanupTestFiles() {
    log('🧹 开始清理测试文件...');

    try {
        const app = window.app;
        if (!app?.vault) return;

        for (const testPath of TEST_PATHS) {
            try {
                const file = app.vault.getAbstractFileByPath(testPath);
                if (file) {
                    await app.vault.delete(file);
                    log(`清理文件: ${testPath}`, 'success');
                }

                // 尝试清理可能创建的空文件夹
                const pathParts = testPath.split('/');
                if (pathParts.length > 1) {
                    const folderPath = pathParts.slice(0, -1).join('/');
                    try {
                        const folder =
                            app.vault.getAbstractFileByPath(folderPath);
                        if (
                            folder &&
                            folder.children &&
                            folder.children.length === 0
                        ) {
                            await app.vault.delete(folder);
                            log(`清理空文件夹: ${folderPath}`, 'success');
                        }
                    } catch (folderError) {
                        // 文件夹可能不为空或不存在，忽略错误
                    }
                }
            } catch (cleanupError) {
                log(`清理失败 ${testPath}: ${cleanupError.message}`, 'warning');
            }
        }
    } catch (error) {
        log(`清理过程异常: ${error.message}`, 'warning');
    }
}

// 主测试函数
async function runFileStorageTests() {
    log('🚀 开始文件存储错误修复验证测试');

    // 检查插件状态
    const plugin = getPluginInstance();
    if (!plugin) {
        log('插件未正确加载，测试终止', 'error');
        return;
    }

    log(`✅ 插件实例获取成功，当前存储路径: ${plugin.settings.wordsFilePath}`);

    // 先清理可能存在的测试文件
    await cleanupTestFiles();

    // 运行路径创建测试
    for (const testPath of TEST_PATHS) {
        await testPathCreationAndSaving(testPath);

        // 在测试之间添加短暂延迟
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 生成测试报告
    generateTestReport();

    // 最终清理
    await cleanupTestFiles();
}

// 生成测试报告
function generateTestReport() {
    const totalTests = testResults.passed + testResults.failed;
    const successRate =
        totalTests > 0
            ? ((testResults.passed / totalTests) * 100).toFixed(2)
            : 0;

    console.log('\n' + '='.repeat(70));
    console.log('📋 文件存储错误修复验证报告');
    console.log('='.repeat(70));
    console.log(`📅 测试时间: ${new Date().toLocaleString()}`);
    console.log(`🎯 测试目标: 修复 "File already exists" 错误`);
    console.log(`🔢 总测试数: ${totalTests}`);
    console.log(`✅ 通过测试: ${testResults.passed}`);
    console.log(`❌ 失败测试: ${testResults.failed}`);
    console.log(`📊 成功率: ${successRate}%`);
    console.log('='.repeat(70));

    if (testResults.details.length > 0) {
        console.log('\n📝 详细测试结果:');
        testResults.details.forEach((result, index) => {
            const status = result.success ? '✅' : '❌';
            console.log(
                `${index + 1}. ${status} ${result.test}: ${result.message}`,
            );
        });
    }

    // 分析失败原因
    const failures = testResults.details.filter((r) => !r.success);
    if (failures.length > 0) {
        console.log('\n🔍 失败分析:');
        const errorTypes = {};
        failures.forEach((failure) => {
            const errorType = failure.message.includes('already exists')
                ? 'FILE_EXISTS_ERROR'
                : 'OTHER_ERROR';
            errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
        });

        Object.entries(errorTypes).forEach(([type, count]) => {
            if (type === 'FILE_EXISTS_ERROR') {
                console.log(
                    `🚨 "File already exists" 错误: ${count} 次 - 修复未生效!`,
                );
            } else {
                console.log(`⚠️ 其他错误: ${count} 次`);
            }
        });
    }

    console.log('\n💡 结论:');
    if (testResults.failed === 0) {
        console.log('🎉 所有测试通过！"File already exists" 错误已成功修复。');
        console.log('   - 文件夹自动创建功能正常');
        console.log('   - 文件保存机制工作正常');
        console.log('   - 路径处理逻辑正确');
    } else {
        const hasFileExistsError = testResults.details.some(
            (r) => !r.success && r.message.includes('already exists'),
        );

        if (hasFileExistsError) {
            console.log('🚨 修复未完全生效，仍存在 "File already exists" 错误');
            console.log('   建议检查：');
            console.log('   1. ensureParentFolderExists 方法是否正确实现');
            console.log('   2. vault.create 调用前的文件存在性检查');
            console.log('   3. 并发保存操作的处理');
        } else {
            console.log('✅ "File already exists" 错误已修复，但存在其他问题');
        }
    }

    return testResults;
}

// 快速测试函数
async function quickFileStorageTest() {
    log('⚡ 快速文件存储测试');

    const plugin = getPluginInstance();
    if (!plugin) {
        log('插件未找到', 'error');
        return;
    }

    const testPath = 'quick-test/test-file.md';
    await testPathCreationAndSaving(testPath);

    // 清理
    setTimeout(async () => {
        try {
            const file = plugin.app.vault.getAbstractFileByPath(testPath);
            if (file) {
                await plugin.app.vault.delete(file);
                log('快速测试文件已清理', 'success');
            }
        } catch (e) {
            log('清理快速测试文件失败', 'warning');
        }
    }, 1000);
}

// 导出函数
window.testFileStorageFix = runFileStorageTests;
window.quickTestFileStorage = quickFileStorageTest;
window.cleanupTestFiles = cleanupTestFiles;

// 提供使用说明
log('🎯 文件存储错误修复验证脚本已加载');
console.log('📋 可用命令：');
console.log('   • testFileStorageFix() - 完整验证测试');
console.log('   • quickTestFileStorage() - 快速测试');
console.log('   • cleanupTestFiles() - 清理测试文件');

// 检查插件状态
const plugin = getPluginInstance();
if (plugin) {
    log(
        `✅ 插件已加载，当前存储路径: ${plugin.settings.wordsFilePath}`,
        'success',
    );
    console.log('💡 运行 testFileStorageFix() 开始验证修复效果');
} else {
    log('⚠️ 插件未加载，请先启用 Language Assistant 插件', 'warning');
}

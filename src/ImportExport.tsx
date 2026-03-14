// 导入导出功能组件
import React, { useState } from 'react';
import { Word } from './MarkdownWordStorage';

interface ImportExportProps {
    words: Word[];
    onImportWords: (word: Word) => void;
    onUpdateWords: (word: Word) => void;
}

const ImportExport: React.FC<ImportExportProps> = ({
    words,
    onImportWords,
    onUpdateWords,
}) => {
    const [importData, setImportData] = useState('');
    const [importStatus, setImportStatus] = useState<{
        show: boolean;
        type: 'success' | 'error';
        message: string;
    }>({ show: false, type: 'success', message: '' });

    const showStatus = (type: 'success' | 'error', message: string) => {
        setImportStatus({ show: true, type, message });
        setTimeout(() => {
            setImportStatus({ show: false, type: 'success', message: '' });
        }, 3000);
    };

    const handleExport = (format: 'json' | 'csv' | 'txt') => {
        let content = '';
        let filename = '';
        let mimeType = '';

        switch (format) {
            case 'json':
                content = JSON.stringify(words, null, 2);
                filename = `words-export-${
                    new Date().toISOString().split('T')[0]
                }.json`;
                mimeType = 'application/json';
                break;

            case 'csv':
                const csvHeaders = [
                    '名称',
                    '发音',
                    '分类',
                    '等级',
                    '词性',
                    '定义',
                    '例句',
                ];
                const csvData = words.map((word) => [
                    word.name,
                    word.pronunciation,
                    word.category,
                    word.level,
                    word.partsOfSpeech,
                    word.content
                        .map((part) =>
                            part.definitions
                                .map((def) => def.definition)
                                .join('; '),
                        )
                        .join(' | '),
                    word.content
                        .map((part) =>
                            part.definitions
                                .map((def) =>
                                    def.examples
                                        .map((ex) => ex.text)
                                        .join('; '),
                                )
                                .join('; '),
                        )
                        .join(' | '),
                ]);
                content = [csvHeaders, ...csvData]
                    .map((row) =>
                        row
                            .map(
                                (cell) =>
                                    `"${(cell || '').replace(/"/g, '""')}"`,
                            )
                            .join(','),
                    )
                    .join('\n');
                filename = `words-export-${
                    new Date().toISOString().split('T')[0]
                }.csv`;
                mimeType = 'text/csv';
                break;

            case 'txt':
                content = words
                    .map((word) => {
                        let text = `${word.name}\n`;
                        if (word.pronunciation)
                            text += `发音: ${word.pronunciation}\n`;
                        if (word.category) text += `分类: ${word.category}\n`;
                        if (word.level) text += `等级: ${word.level}\n`;
                        if (word.partsOfSpeech)
                            text += `词性: ${word.partsOfSpeech}\n`;

                        word.content.forEach((part, index) => {
                            text += `\n${part.type}:\n`;
                            part.definitions.forEach((def, defIndex) => {
                                text += `  ${defIndex + 1}. ${
                                    def.definition
                                }\n`;
                                def.examples.forEach((example) => {
                                    text += `     例: ${example.text}\n`;
                                });
                            });
                        });
                        return text + '\n' + '='.repeat(50) + '\n';
                    })
                    .join('\n');
                filename = `words-export-${
                    new Date().toISOString().split('T')[0]
                }.txt`;
                mimeType = 'text/plain';
                break;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showStatus('success', `成功导出 ${words.length} 个单词到 ${filename}`);
    };

    const handleImport = () => {
        try {
            const data = JSON.parse(importData);

            if (!Array.isArray(data)) {
                throw new Error('导入数据格式错误：应为单词数组');
            }

            let importCount = 0;
            data.forEach((item: any) => {
                try {
                    // 基础验证
                    if (!item.name || typeof item.name !== 'string') {
                        throw new Error(`单词名称无效: ${item.name}`);
                    }

                    const word: Word = {
                        metadata: {
                            id:
                                item.metadata?.id ||
                                `word-${Date.now()}-${Math.random()
                                    .toString(36)
                                    .substr(2, 9)}`,
                            createBy: item.metadata?.createBy || 'import',
                            lastUpdate: new Date().toISOString(),
                            queryCount: item.metadata?.queryCount || 0,
                            ...item.metadata,
                        },
                        name: item.name,
                        pronunciation: item.pronunciation || '',
                        vocabulary: item.vocabulary || '',
                        category: item.category || '',
                        tags: Array.isArray(item.tags) ? item.tags : [],
                        level: item.level || '',
                        partsOfSpeech: item.partsOfSpeech || '',
                        content: Array.isArray(item.content)
                            ? item.content
                            : [],
                    };

                    onImportWords(word);
                    importCount++;
                } catch (itemError) {
                    console.warn(`跳过无效单词:`, itemError);
                }
            });

            showStatus('success', `成功导入 ${importCount} 个单词`);
            setImportData('');
        } catch (error) {
            showStatus(
                'error',
                `导入失败: ${
                    error instanceof Error ? error.message : '未知错误'
                }`,
            );
        }
    };
    return (
        <div
            style={{
                padding: '20px 30px 60px 30px',
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}>
            {/* iOS 风格标题栏 */}
            <div style={{ marginBottom: '24px' }}>
                <h2
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '34px',
                        fontWeight: '700',
                        color: '#1C1C1E',
                        letterSpacing: '-1px',
                    }}>
                    📦 导入/导出
                </h2>
                <p style={{ margin: 0, color: '#8E8E93', fontSize: '17px' }}>
                    备份您的单词库或导入新数据
                </p>
            </div>
            {/* iOS 风格状态提示 */}
            {importStatus.show && (
                <div
                    style={{
                        padding: '16px 20px',
                        marginBottom: '24px',
                        background:
                            importStatus.type === 'success'
                                ? 'linear-gradient(135deg, #34C759 0%, #30A14E 100%)'
                                : 'linear-gradient(135deg, #FF3B30 0%, #D70015 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '14px',
                        fontSize: '15px',
                        fontWeight: '500',
                        boxShadow:
                            importStatus.type === 'success'
                                ? '0 4px 16px rgba(52, 199, 89, 0.3)'
                                : '0 4px 16px rgba(255, 59, 48, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                    <span style={{ fontSize: '20px' }}>
                        {importStatus.type === 'success' ? '✓' : '⚠️'}
                    </span>
                    <span>{importStatus.message}</span>
                </div>
            )}{' '}
            {/* iOS 风格导出功能 */}
            <div
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    padding: '24px',
                    marginBottom: '24px',
                }}>
                <h3
                    style={{
                        margin: '0 0 20px 0',
                        fontSize: '22px',
                        fontWeight: '600',
                        color: '#1C1C1E',
                    }}>
                    📤 导出数据
                </h3>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '20px',
                    }}>
                    {/* JSON 导出卡片 */}
                    <div
                        style={{
                            padding: '24px',
                            background:
                                'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                            borderRadius: '16px',
                            textAlign: 'center',
                            boxShadow: '0 4px 16px rgba(0, 122, 255, 0.2)',
                            color: 'white',
                        }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                            📄
                        </div>
                        <h4
                            style={{
                                margin: '0 0 8px 0',
                                fontSize: '17px',
                                fontWeight: '600',
                            }}>
                            JSON格式
                        </h4>
                        <p
                            style={{
                                fontSize: '13px',
                                color: 'rgba(255,255,255,0.85)',
                                margin: '0 0 16px 0',
                                lineHeight: '1.4',
                            }}>
                            完整数据格式
                            <br />
                            可用于备份和恢复
                        </p>
                        <button
                            onClick={() => handleExport('json')}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: 'rgba(255,255,255,0.25)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '600',
                                transition:
                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                backdropFilter: 'blur(10px)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    'rgba(255,255,255,0.35)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    'rgba(255,255,255,0.25)';
                            }}>
                            导出 JSON
                        </button>
                    </div>

                    {/* CSV 导出卡片 */}
                    <div
                        style={{
                            padding: '24px',
                            background:
                                'linear-gradient(135deg, #34C759 0%, #30A14E 100%)',
                            borderRadius: '16px',
                            textAlign: 'center',
                            boxShadow: '0 4px 16px rgba(52, 199, 89, 0.2)',
                            color: 'white',
                        }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                            📊
                        </div>
                        <h4
                            style={{
                                margin: '0 0 8px 0',
                                fontSize: '17px',
                                fontWeight: '600',
                            }}>
                            CSV格式
                        </h4>
                        <p
                            style={{
                                fontSize: '13px',
                                color: 'rgba(255,255,255,0.85)',
                                margin: '0 0 16px 0',
                                lineHeight: '1.4',
                            }}>
                            表格格式
                            <br />
                            可用于Excel等工具
                        </p>
                        <button
                            onClick={() => handleExport('csv')}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: 'rgba(255,255,255,0.25)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '600',
                                transition:
                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                backdropFilter: 'blur(10px)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    'rgba(255,255,255,0.35)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    'rgba(255,255,255,0.25)';
                            }}>
                            导出 CSV
                        </button>
                    </div>

                    {/* TXT 导出卡片 */}
                    <div
                        style={{
                            padding: '24px',
                            background:
                                'linear-gradient(135deg, #8E8E93 0%, #636366 100%)',
                            borderRadius: '16px',
                            textAlign: 'center',
                            boxShadow: '0 4px 16px rgba(142, 142, 147, 0.2)',
                            color: 'white',
                        }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                            📝
                        </div>
                        <h4
                            style={{
                                margin: '0 0 8px 0',
                                fontSize: '17px',
                                fontWeight: '600',
                            }}>
                            TXT格式
                        </h4>
                        <p
                            style={{
                                fontSize: '13px',
                                color: 'rgba(255,255,255,0.85)',
                                margin: '0 0 16px 0',
                                lineHeight: '1.4',
                            }}>
                            纯文本格式
                            <br />
                            易于阅读和打印
                        </p>
                        <button
                            onClick={() => handleExport('txt')}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: 'rgba(255,255,255,0.25)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '600',
                                transition:
                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                backdropFilter: 'blur(10px)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    'rgba(255,255,255,0.35)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    'rgba(255,255,255,0.25)';
                            }}>
                            导出 TXT
                        </button>
                    </div>
                </div>

                <div
                    style={{
                        padding: '16px 20px',
                        backgroundColor: '#F2F2F7',
                        borderRadius: '12px',
                        fontSize: '15px',
                        color: '#48484A',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                    <span style={{ fontSize: '18px' }}>💡</span>
                    <span>
                        当前共有{' '}
                        <strong style={{ color: '#007AFF', fontWeight: '600' }}>
                            {words.length}
                        </strong>{' '}
                        个单词可供导出
                    </span>
                </div>
            </div>{' '}
            {/* iOS 风格导入功能 */}
            <div
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    padding: '24px',
                }}>
                <h3
                    style={{
                        margin: '0 0 20px 0',
                        fontSize: '22px',
                        fontWeight: '600',
                        color: '#1C1C1E',
                    }}>
                    📥 导入数据
                </h3>

                <div style={{ marginBottom: '20px' }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '12px',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#48484A',
                        }}>
                        JSON数据:
                    </label>
                    <textarea
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        placeholder="请粘贴JSON格式的单词数据..."
                        style={{
                            width: '100%',
                            height: '200px',
                            padding: '16px',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontFamily:
                                'Monaco, "SF Mono", Consolas, monospace',
                            resize: 'vertical',
                            boxSizing: 'border-box',
                            backgroundColor: '#F2F2F7',
                            color: '#1C1C1E',
                            outline: 'none',
                            lineHeight: '1.5',
                        }}
                    />
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        marginBottom: '20px',
                    }}>
                    <button
                        onClick={handleImport}
                        disabled={!importData.trim()}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: importData.trim()
                                ? '#FF3B30'
                                : '#C7C7CC',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: importData.trim()
                                ? 'pointer'
                                : 'not-allowed',
                            fontSize: '15px',
                            fontWeight: '600',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            boxShadow: importData.trim()
                                ? '0 2px 8px rgba(255, 59, 48, 0.25)'
                                : 'none',
                        }}>
                        执行导入
                    </button>
                    <button
                        onClick={() => setImportData('')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: 'transparent',
                            color: '#8E8E93',
                            border: '2px solid #8E8E93',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '600',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F2F2F7';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                                'transparent';
                        }}>
                        清空
                    </button>
                </div>

                <div
                    style={{
                        padding: '16px 20px',
                        background:
                            'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: 'white',
                        lineHeight: '1.6',
                        boxShadow: '0 2px 8px rgba(255, 149, 0, 0.2)',
                    }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                        }}>
                        <span>⚠️</span>
                        <strong>导入说明</strong>
                    </div>
                    <ul
                        style={{
                            margin: '0',
                            paddingLeft: '24px',
                            fontSize: '13px',
                            color: 'rgba(255,255,255,0.95)',
                        }}>
                        <li>只支持JSON格式数据导入</li>
                        <li>导入的数据会添加到现有单词库中</li>
                        <li>如果单词名称重复，会覆盖现有单词</li>
                        <li>无效的数据项会被自动跳过</li>
                        <li>建议在导入前先备份现有数据</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ImportExport;

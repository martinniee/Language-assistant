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
        <div style={{ padding: '30px' }}>
            {/* 状态提示 */}
            {importStatus.show && (
                <div
                    style={{
                        padding: '15px 20px',
                        marginBottom: '20px',
                        backgroundColor:
                            importStatus.type === 'success'
                                ? '#d4edda'
                                : '#f8d7da',
                        color:
                            importStatus.type === 'success'
                                ? '#155724'
                                : '#721c24',
                        border: `1px solid ${
                            importStatus.type === 'success'
                                ? '#c3e6cb'
                                : '#f5c6cb'
                        }`,
                        borderRadius: '8px',
                        fontSize: '14px',
                    }}>
                    {importStatus.message}
                </div>
            )}

            {/* 导出功能 */}
            <div
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    padding: '25px',
                    marginBottom: '25px',
                }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>
                    📤 导出数据
                </h3>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px',
                        marginBottom: '20px',
                    }}>
                    <div
                        style={{
                            padding: '20px',
                            border: '2px solid #e9ecef',
                            borderRadius: '8px',
                            textAlign: 'center',
                        }}>
                        <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                            📄
                        </div>
                        <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                            JSON格式
                        </h4>
                        <p
                            style={{
                                fontSize: '12px',
                                color: '#666',
                                margin: '0 0 15px 0',
                            }}>
                            完整数据格式，可用于备份和恢复
                        </p>
                        <button
                            onClick={() => handleExport('json')}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                            }}>
                            导出 JSON
                        </button>
                    </div>

                    <div
                        style={{
                            padding: '20px',
                            border: '2px solid #e9ecef',
                            borderRadius: '8px',
                            textAlign: 'center',
                        }}>
                        <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                            📊
                        </div>
                        <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                            CSV格式
                        </h4>
                        <p
                            style={{
                                fontSize: '12px',
                                color: '#666',
                                margin: '0 0 15px 0',
                            }}>
                            表格格式，可用于Excel等工具
                        </p>
                        <button
                            onClick={() => handleExport('csv')}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                            }}>
                            导出 CSV
                        </button>
                    </div>

                    <div
                        style={{
                            padding: '20px',
                            border: '2px solid #e9ecef',
                            borderRadius: '8px',
                            textAlign: 'center',
                        }}>
                        <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                            📝
                        </div>
                        <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                            TXT格式
                        </h4>
                        <p
                            style={{
                                fontSize: '12px',
                                color: '#666',
                                margin: '0 0 15px 0',
                            }}>
                            纯文本格式，易于阅读和打印
                        </p>
                        <button
                            onClick={() => handleExport('txt')}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                            }}>
                            导出 TXT
                        </button>
                    </div>
                </div>

                <div
                    style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#666',
                    }}>
                    💡 当前共有 <strong>{words.length}</strong> 个单词可供导出
                </div>
            </div>

            {/* 导入功能 */}
            <div
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    padding: '25px',
                }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>
                    📥 导入数据
                </h3>

                <div style={{ marginBottom: '20px' }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#555',
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
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            resize: 'vertical',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        marginBottom: '20px',
                    }}>
                    <button
                        onClick={handleImport}
                        disabled={!importData.trim()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: importData.trim()
                                ? '#dc3545'
                                : '#ccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: importData.trim()
                                ? 'pointer'
                                : 'not-allowed',
                            fontSize: '14px',
                            fontWeight: '600',
                        }}>
                        执行导入
                    </button>
                    <button
                        onClick={() => setImportData('')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'transparent',
                            color: '#6c757d',
                            border: '1px solid #6c757d',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                        }}>
                        清空
                    </button>
                </div>

                <div
                    style={{
                        padding: '15px',
                        backgroundColor: '#fff3cd',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#856404',
                        lineHeight: '1.5',
                    }}>
                    <strong>⚠️ 导入说明:</strong>
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
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

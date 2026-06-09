// 导入导出功能组件
import React, { useState } from 'react';
import { Word } from './MarkdownWordStorage';
import { Package, CheckCircle, AlertTriangle, Upload, FileJson, FileSpreadsheet, FileText, Lightbulb, Download } from 'lucide-react';
import { formatTimestamp } from './utils/date';

interface ImportExportProps {
    words: Word[];
    onImportWords: (word: Word) => void;
    onUpdateWords: (word: Word) => void;
}

const ImportExport: React.FC<ImportExportProps> = ({
    words,
    onImportWords,
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
                filename = `words-export-${formatTimestamp().slice(0, 8)}.json`;
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
                filename = `words-export-${formatTimestamp().slice(0, 8)}.csv`;
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

                        word.content.forEach((part) => {
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
                filename = `words-export-${formatTimestamp().slice(0, 8)}.txt`;
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
                            lastUpdate: formatTimestamp(),
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
                        itemMeta: item.itemMeta || {
                            frontEndId: `id-${Date.now()}`,
                        },
                        srsMeta: item.srsMeta || {
                            nextReview: formatTimestamp(),
                            interval: 0,
                            easeFactor: 2.5,
                            reviewCount: 0,
                            lapses: 0,
                        },
                        notes: item.notes || '',
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
            className="la-page la-import-export-page"
            style={{
                padding: '20px 30px 60px 30px',
                fontFamily:
                    'var(--la-font)',
            }}>
            {/* iOS 风格标题栏 */}
            <div style={{ marginBottom: '24px' }}>
                <h2
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '34px',
                        fontWeight: '700',
                        color: 'var(--la-text-strong)',
                        letterSpacing: '0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                    <Package size={34} color="var(--la-accent)" /> 导入/导出
                </h2>
                <p style={{ margin: 0, color: 'var(--la-text-muted)', fontSize: '17px' }}>
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
                                ? 'var(--la-gradient-success)'
                                : 'var(--la-gradient-danger)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--la-radius-sm)',
                        fontSize: '15px',
                        fontWeight: '500',
                        boxShadow:
                            importStatus.type === 'success'
                                ? '0 4px 16px color-mix(in srgb, var(--la-success) 24%, transparent)'
                                : '0 4px 16px color-mix(in srgb, var(--la-danger) 24%, transparent)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                    <span style={{ display: 'flex' }}>
                        {importStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    </span>
                    <span>{importStatus.message}</span>
                </div>
            )}{' '}
            {/* iOS 风格导出功能 */}
            <div
                style={{
                    backgroundColor: 'var(--la-surface)',
                    borderRadius: 'var(--la-radius-md)',
                    boxShadow: 'var(--la-shadow-sm)',
                    padding: '24px',
                    marginBottom: '24px',
                }}>
                <h3
                    style={{
                        margin: '0 0 20px 0',
                        fontSize: '22px',
                        fontWeight: '600',
                        color: 'var(--la-text-strong)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                    <Upload size={24} color="var(--la-accent)" /> 导出数据
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
                                'var(--la-gradient-accent)',
                            borderRadius: 'var(--la-radius-md)',
                            textAlign: 'center',
                            boxShadow: 'var(--la-shadow-sm)',
                            color: 'white',
                        }}>
                        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                            <FileJson size={32} />
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
                                color: 'var(--la-on-accent-muted)',
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
                                backgroundColor: 'color-mix(in srgb, white 25%, transparent)',
                                color: 'white',
                                border: '1px solid color-mix(in srgb, white 30%, transparent)',
                                borderRadius: 'var(--la-radius-sm)',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '600',
                                transition:
                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                backdropFilter: 'blur(10px)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    'color-mix(in srgb, white 35%, transparent)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    'color-mix(in srgb, white 25%, transparent)';
                            }}>
                            导出 JSON
                        </button>
                    </div>

                    {/* CSV 导出卡片 */}
                    <div
                        style={{
                            padding: '24px',
                            background:
                                'var(--la-gradient-success)',
                            borderRadius: 'var(--la-radius-md)',
                            textAlign: 'center',
                            boxShadow: '0 4px 16px color-mix(in srgb, var(--la-success) 18%, transparent)',
                            color: 'white',
                        }}>
                        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                            <FileSpreadsheet size={32} />
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
                                color: 'var(--la-on-accent-muted)',
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
                                backgroundColor: 'color-mix(in srgb, white 25%, transparent)',
                                color: 'white',
                                border: '1px solid color-mix(in srgb, white 30%, transparent)',
                                borderRadius: 'var(--la-radius-sm)',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '600',
                                transition:
                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                backdropFilter: 'blur(10px)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    'color-mix(in srgb, white 35%, transparent)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    'color-mix(in srgb, white 25%, transparent)';
                            }}>
                            导出 CSV
                        </button>
                    </div>

                    {/* TXT 导出卡片 */}
                    <div
                        style={{
                            padding: '24px',
                            background:
                                'linear-gradient(135deg, var(--la-text-muted) 0%, var(--la-text-faint) 100%)',
                            borderRadius: 'var(--la-radius-md)',
                            textAlign: 'center',
                            boxShadow: '0 4px 16px color-mix(in srgb, var(--la-text-muted) 20%, transparent)',
                            color: 'white',
                        }}>
                        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                            <FileText size={32} />
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
                                color: 'var(--la-on-accent-muted)',
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
                                backgroundColor: 'color-mix(in srgb, white 25%, transparent)',
                                color: 'white',
                                border: '1px solid color-mix(in srgb, white 30%, transparent)',
                                borderRadius: 'var(--la-radius-sm)',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '600',
                                transition:
                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                backdropFilter: 'blur(10px)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    'color-mix(in srgb, white 35%, transparent)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    'color-mix(in srgb, white 25%, transparent)';
                            }}>
                            导出 TXT
                        </button>
                    </div>
                </div>

                <div
                    style={{
                        padding: '16px 20px',
                        backgroundColor: 'var(--la-surface-subtle)',
                        borderRadius: 'var(--la-radius-sm)',
                        fontSize: '15px',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                    <Lightbulb size={20} color="var(--la-warning)" />
                    <span>
                        当前共有{' '}
                        <strong style={{ color: 'var(--la-accent)', fontWeight: '600' }}>
                            {words.length}
                        </strong>{' '}
                        个单词可供导出
                    </span>
                </div>
            </div>{' '}
            {/* iOS 风格导入功能 */}
            <div
                style={{
                    backgroundColor: 'var(--la-surface)',
                    borderRadius: 'var(--la-radius-md)',
                    boxShadow: 'var(--la-shadow-sm)',
                    padding: '24px',
                }}>
                <h3
                    style={{
                        margin: '0 0 20px 0',
                        fontSize: '22px',
                        fontWeight: '600',
                        color: 'var(--la-text-strong)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                    <Download size={24} color="var(--la-danger)" /> 导入数据
                </h3>

                <div style={{ marginBottom: '20px' }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '12px',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: 'var(--text-muted)',
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
                            borderRadius: 'var(--la-radius-sm)',
                            fontSize: '14px',
                            fontFamily:
                                'Monaco, "SF Mono", Consolas, monospace',
                            resize: 'vertical',
                            boxSizing: 'border-box',
                            backgroundColor: 'var(--la-surface-subtle)',
                            color: 'var(--la-text-strong)',
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
                                ? 'var(--la-danger)'
                                : 'var(--la-border)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--la-radius-sm)',
                            cursor: importData.trim()
                                ? 'pointer'
                                : 'not-allowed',
                            fontSize: '15px',
                            fontWeight: '600',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            boxShadow: importData.trim()
                                ? '0 2px 8px color-mix(in srgb, var(--la-danger) 22%, transparent)'
                                : 'none',
                        }}>
                        执行导入
                    </button>
                    <button
                        onClick={() => setImportData('')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: 'transparent',
                            color: 'var(--la-text-muted)',
                            border: '2px solid var(--la-text-muted)',
                            borderRadius: 'var(--la-radius-sm)',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '600',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--la-surface-subtle)';
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
                            'var(--la-gradient-warning)',
                        borderRadius: 'var(--la-radius-sm)',
                        fontSize: '14px',
                        color: 'white',
                        lineHeight: '1.6',
                        boxShadow: '0 2px 8px color-mix(in srgb, var(--la-warning) 18%, transparent)',
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
                        <AlertTriangle size={18} />
                        <strong>导入说明</strong>
                    </div>
                    <ul
                        style={{
                            margin: '0',
                            paddingLeft: '24px',
                            fontSize: '13px',
                            color: 'color-mix(in srgb, white 95%, transparent)',
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

// @ts-ignore
import React, { useState, useMemo, useCallback } from 'react';
import { Word } from './MarkdownWordStorage';

interface WordManagerProps {
    words: Word[];
    onAdd: (word: Word) => void;
    onEdit: (word: Word) => void;
    onDelete: (name: string) => void;
}

// 高亮文本组件 - 优化版本
const HighlightText: React.FC<{ text: string; searchTerm: string }> =
    React.memo(({ text, searchTerm }) => {
        const highlightedContent = useMemo(() => {
            if (!searchTerm || !text) {
                return <span>{text}</span>;
            }

            const escapedTerm = searchTerm.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&',
            );
            const parts = text.split(new RegExp(`(${escapedTerm})`, 'gi'));

            return (
                <span>
                    {parts.map((part, index) =>
                        part.toLowerCase() === searchTerm.toLowerCase() ? (
                            <span
                                key={index}
                                style={{
                                    backgroundColor: '#ffeb3b',
                                    color: '#000',
                                    padding: '1px 2px',
                                    borderRadius: '2px',
                                    fontWeight: 'bold',
                                }}>
                                {part}
                            </span>
                        ) : (
                            <span key={index}>{part}</span>
                        ),
                    )}
                </span>
            );
        }, [text, searchTerm]);
        return highlightedContent;
    });

// 缩略卡片组件
const WordCard: React.FC<{
    word: Word;
    searchTerm: string;
    onEdit: () => void;
    onDelete: () => void;
    onViewDetail: () => void;
    enableFullHighlight: boolean;
}> = React.memo(
    ({
        word,
        searchTerm,
        onEdit,
        onDelete,
        onViewDetail,
        enableFullHighlight,
    }) => {
        return (
            <div
                style={{
                    padding: 15,
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                        '0 2px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 10,
                    }}>
                    <h3 style={{ margin: 0, fontSize: '1.2em' }}>
                        <HighlightText
                            text={word.name}
                            searchTerm={searchTerm}
                        />
                    </h3>
                    <div style={{ display: 'flex', gap: 5 }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                backgroundColor: '#f0f0f0',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}>
                            编辑
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                backgroundColor: '#ffe6e6',
                                border: '1px solid #ffb3b3',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}>
                            删除
                        </button>
                    </div>
                </div>

                <div
                    onClick={onViewDetail}
                    style={{ cursor: 'pointer' }}>
                    <p
                        style={{
                            margin: '5px 0',
                            fontSize: '14px',
                            color: '#666',
                        }}>
                        <strong>发音:</strong>{' '}
                        {enableFullHighlight ? (
                            <HighlightText
                                text={word.pronunciation}
                                searchTerm={searchTerm}
                            />
                        ) : (
                            word.pronunciation
                        )}
                    </p>
                    <p
                        style={{
                            margin: '5px 0',
                            fontSize: '14px',
                            color: '#666',
                        }}>
                        <strong>分类:</strong>{' '}
                        {enableFullHighlight ? (
                            <HighlightText
                                text={word.category}
                                searchTerm={searchTerm}
                            />
                        ) : (
                            word.category
                        )}
                    </p>
                    <p
                        style={{
                            margin: '5px 0',
                            fontSize: '14px',
                            color: '#666',
                        }}>
                        <strong>标签:</strong>{' '}
                        {enableFullHighlight ? (
                            <HighlightText
                                text={word.tags.join(', ')}
                                searchTerm={searchTerm}
                            />
                        ) : (
                            word.tags.join(', ')
                        )}
                    </p>

                    <div
                        style={{
                            marginTop: 10,
                            fontSize: '12px',
                            color: '#999',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                        <span>等级: {word.level}</span>
                        <span
                            style={{
                                color: '#007acc',
                                textDecoration: 'underline',
                            }}>
                            点击查看详情 →
                        </span>
                    </div>
                </div>
            </div>
        );
    },
);

interface WordManagerProps {
    words: Word[];
    onAdd: (word: Word) => void;
    onEdit: (word: Word) => void;
    onDelete: (name: string) => void;
}

export default function WordManagerMarkdown({
    words,
    onAdd,
    onEdit,
    onDelete,
}: WordManagerProps) {
    const [showAdd, setShowAdd] = useState(false);
    const [editTarget, setEditTarget] = useState<Word | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [enableFullHighlight, setEnableFullHighlight] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [currentWord, setCurrentWord] = useState<Word | null>(null);

    // 优化的搜索函数 - 提前退出和缓存
    const searchInWord = useCallback((word: Word, term: string): boolean => {
        if (!term) return true;

        const lowerTerm = term.toLowerCase();

        // 基本字段搜索 - 提前退出
        if (word.name.toLowerCase().includes(lowerTerm)) return true;
        if (word.category.toLowerCase().includes(lowerTerm)) return true;
        if (word.level.toLowerCase().includes(lowerTerm)) return true;
        if (word.partsOfSpeech.toLowerCase().includes(lowerTerm)) return true;
        if (word.pronunciation.toLowerCase().includes(lowerTerm)) return true;

        // 标签搜索
        if (word.tags.some((tag) => tag.toLowerCase().includes(lowerTerm)))
            return true;

        // 详细内容搜索 - 优化嵌套循环
        for (const part of word.content) {
            if (part.type.toLowerCase().includes(lowerTerm)) return true;

            for (const def of part.definitions) {
                if (def.definition.toLowerCase().includes(lowerTerm))
                    return true;

                // 只在必要时搜索例句
                for (const example of def.examples) {
                    if (example.text.toLowerCase().includes(lowerTerm))
                        return true;
                }
            }
        }

        return false;
    }, []); // 使用 useMemo 缓存过滤结果
    const filteredWords = useMemo(() => {
        return words.filter((word) => searchInWord(word, searchTerm));
    }, [words, searchTerm, searchInWord]);

    const [form, setForm] = useState<Word>({
        name: '',
        pronunciation: '',
        vocabulary: '',
        category: '',
        tags: [],
        level: '',
        queryCount: 0,
        partsOfSpeech: '',
        content: [],
    });

    const handleSubmit = useCallback(() => {
        if (editTarget) {
            onEdit(form);
            setEditTarget(null);
        } else {
            onAdd(form);
        }

        // 重置表单
        setForm({
            name: '',
            pronunciation: '',
            vocabulary: '',
            category: '',
            tags: [],
            level: '',
            queryCount: 0,
            partsOfSpeech: '',
            content: [],
        });
        setShowAdd(false);
    }, [editTarget, form, onEdit, onAdd]);

    const handleEditClick = useCallback((word: Word) => {
        setEditTarget(word);
        setForm({
            ...word,
            tags: [...word.tags],
            content: JSON.parse(JSON.stringify(word.content)),
        });
        setShowAdd(true);
    }, []);

    const handleAddPart = useCallback(() => {
        setForm((f) => ({
            ...f,
            content: [...f.content, { type: '', definitions: [] }],
        }));
    }, []);

    const handleAddDefinition = useCallback((partIndex: number) => {
        setForm((f) => {
            const content = [...f.content];
            content[partIndex].definitions.push({
                definition: '',
                examples: [],
            });
            return { ...f, content };
        });
    }, []);
    const handleAddExample = useCallback(
        (partIndex: number, defIndex: number) => {
            setForm((f) => {
                const content = [...f.content];
                content[partIndex].definitions[defIndex].examples.push({
                    text: '',
                });
                return { ...f, content };
            });
        },
        [],
    );    // 页面模式切换函数 - 添加查询次数+1功能
    const handleViewWord = useCallback((word: Word) => {
        // 创建更新后的单词对象，查询次数+1
        const updatedWord: Word = {
            ...word,
            queryCount: word.queryCount + 1
        };
        
        // 更新当前单词状态
        setCurrentWord(updatedWord);
        setViewMode('detail');
        
        // 同步更新到数据存储中
        onEdit(updatedWord);
    }, [onEdit]);

    const handleBackToList = useCallback(() => {
        setViewMode('list');
        setCurrentWord(null);
    }, []);
    return (
        <div
            style={{
                height: '100vh',
                overflow: 'auto',
                padding: 20,
                boxSizing: 'border-box',
            }}>
            {viewMode === 'list' && (
                <>
                    <h1>单词管理</h1>

                    <div
                        style={{
                            display: 'flex',
                            gap: 10,
                            marginBottom: 20,
                            alignItems: 'center',
                        }}>
                        <input
                            type="text"
                            placeholder="搜索单词、分类、标签、发音或内容..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                fontSize: '14px',
                            }}
                        />

                        {searchTerm && (
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    fontSize: '14px',
                                    color: '#666',
                                    whiteSpace: 'nowrap',
                                }}>
                                <input
                                    type="checkbox"
                                    checked={enableFullHighlight}
                                    onChange={(e) =>
                                        setEnableFullHighlight(e.target.checked)
                                    }
                                />
                                全部高亮
                            </label>
                        )}

                        <button
                            onClick={() => setShowAdd(true)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#007acc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                            }}>
                            添加新单词
                        </button>
                    </div>

                    <h2>
                        现有单词
                        {searchTerm && (
                            <span
                                style={{
                                    fontSize: '0.7em',
                                    color: '#666',
                                    marginLeft: '10px',
                                }}>
                                (找到 {filteredWords.length} / {words.length}{' '}
                                个单词)
                            </span>
                        )}
                    </h2>

                    <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
                        {filteredWords.length === 0 ? (
                            <div
                                style={{
                                    textAlign: 'center',
                                    color: '#666',
                                    padding: '40px',
                                    border: '1px dashed #ccc',
                                    borderRadius: '8px',
                                }}>
                                {searchTerm
                                    ? '没有找到匹配的单词'
                                    : '暂无单词，点击上方按钮添加'}
                            </div>
                        ) : (
                            filteredWords.map((word) => (
                                <WordCard
                                    key={word.name}
                                    word={word}
                                    searchTerm={searchTerm}
                                    onEdit={() => handleEditClick(word)}
                                    onDelete={() => onDelete(word.name)}
                                    onViewDetail={() => handleViewWord(word)}
                                    enableFullHighlight={enableFullHighlight}
                                />
                            ))
                        )}
                    </div>
                </>
            )}

            {viewMode === 'detail' && currentWord && (
                <>
                    <div style={{ marginBottom: 20 }}>
                        <button
                            onClick={handleBackToList}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                marginRight: 10,
                            }}>
                            ← 返回列表
                        </button>
                        <button
                            onClick={() => handleEditClick(currentWord)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#007acc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                            }}>
                            编辑单词
                        </button>
                    </div>

                    <div
                        style={{
                            backgroundColor: '#f9f9f9',
                            padding: 20,
                            borderRadius: 8,
                            border: '1px solid #e0e0e0',
                        }}>
                        <h1 style={{ margin: '0 0 20px 0', color: '#333' }}>
                            {currentWord.name}
                        </h1>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 20,
                                marginBottom: 20,
                            }}>
                            <div>
                                <p>
                                    <strong>发音:</strong>{' '}
                                    {currentWord.pronunciation}
                                </p>
                                <p>
                                    <strong>分类:</strong>{' '}
                                    {currentWord.category}
                                </p>
                                <p>
                                    <strong>等级:</strong> {currentWord.level}
                                </p>
                            </div>
                            <div>
                                <p>
                                    <strong>标签:</strong>{' '}
                                    {currentWord.tags.join(', ')}
                                </p>
                                <p>
                                    <strong>词性:</strong>{' '}
                                    {currentWord.partsOfSpeech}
                                </p>
                                <p>
                                    <strong>查询次数:</strong>{' '}
                                    {currentWord.queryCount}
                                </p>
                            </div>
                        </div>

                        <div style={{ marginTop: 30 }}>
                            <h3 style={{ marginBottom: 15, color: '#555' }}>
                                详细内容
                            </h3>
                            {currentWord.content.map((part, partIndex) => (
                                <div
                                    key={partIndex}
                                    style={{
                                        marginBottom: 25,
                                        padding: 15,
                                        backgroundColor: 'white',
                                        borderRadius: 6,
                                        border: '1px solid #ddd',
                                    }}>
                                    <h4
                                        style={{
                                            margin: '0 0 15px 0',
                                            color: '#007acc',
                                        }}>
                                        {part.type}
                                    </h4>
                                    {part.definitions.map((def, defIndex) => (
                                        <div
                                            key={defIndex}
                                            style={{
                                                marginBottom: 15,
                                                paddingLeft: 15,
                                                borderLeft: '3px solid #e0e0e0',
                                            }}>
                                            <div
                                                style={{
                                                    marginBottom: 8,
                                                    fontSize: '16px',
                                                }}>
                                                <strong>定义:</strong>{' '}
                                                {def.definition}
                                            </div>
                                            {def.examples.length > 0 && (
                                                <div>
                                                    <strong>例句:</strong>
                                                    {def.examples.map(
                                                        (example, exIndex) => (
                                                            <div
                                                                key={exIndex}
                                                                style={{
                                                                    marginLeft: 20,
                                                                    marginTop: 5,
                                                                    fontStyle:
                                                                        'italic',
                                                                    color: '#666',
                                                                    fontSize:
                                                                        '14px',
                                                                }}>
                                                                • {example.text}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}{' '}
                        </div>
                    </div>
                </>
            )}

            {showAdd && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}>
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: 20,
                            borderRadius: 8,
                            maxWidth: '600px',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            width: '90%',
                        }}>
                        <h3>{editTarget ? '编辑单词' : '添加单词'}</h3>

                        <div style={{ marginBottom: 10 }}>
                            <label>单词名称:</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                style={{
                                    marginLeft: 10,
                                    padding: 5,
                                    width: '200px',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <label>发音:</label>
                            <input
                                type="text"
                                value={form.pronunciation}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        pronunciation: e.target.value,
                                    })
                                }
                                style={{
                                    marginLeft: 10,
                                    padding: 5,
                                    width: '200px',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <label>分类:</label>
                            <input
                                type="text"
                                value={form.category}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        category: e.target.value,
                                    })
                                }
                                style={{
                                    marginLeft: 10,
                                    padding: 5,
                                    width: '200px',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <label>标签 (逗号分隔):</label>
                            <input
                                type="text"
                                value={form.tags.join(',')}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        tags: e.target.value
                                            .split(',')
                                            .map((t) => t.trim()),
                                    })
                                }
                                style={{
                                    marginLeft: 10,
                                    padding: 5,
                                    width: '300px',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <label>等级:</label>
                            <select
                                value={form.level}
                                onChange={(e) =>
                                    setForm({ ...form, level: e.target.value })
                                }
                                style={{ marginLeft: 10, padding: 5 }}>
                                <option value="">请选择</option>
                                <option value="初级">初级</option>
                                <option value="中级">中级</option>
                                <option value="高级">高级</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: 10 }}>
                            <label>词性概述:</label>
                            <input
                                type="text"
                                value={form.partsOfSpeech}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        partsOfSpeech: e.target.value,
                                    })
                                }
                                style={{
                                    marginLeft: 10,
                                    padding: 5,
                                    width: '200px',
                                }}
                            />
                        </div>

                        <h4>详细内容</h4>
                        {form.content.map((part, partIndex) => (
                            <div
                                key={partIndex}
                                style={{
                                    margin: '10px 0',
                                    padding: 10,
                                    border: '1px solid #ddd',
                                    borderRadius: 4,
                                }}>
                                <div style={{ marginBottom: 10 }}>
                                    <label>词性:</label>
                                    <input
                                        type="text"
                                        value={part.type}
                                        onChange={(e) => {
                                            const content = [...form.content];
                                            content[partIndex].type =
                                                e.target.value;
                                            setForm({ ...form, content });
                                        }}
                                        style={{ marginLeft: 10, padding: 5 }}
                                    />
                                </div>

                                {part.definitions.map((def, defIndex) => (
                                    <div
                                        key={defIndex}
                                        style={{
                                            margin: '10px 0',
                                            paddingLeft: 20,
                                            borderLeft: '2px solid #eee',
                                        }}>
                                        <div style={{ marginBottom: 5 }}>
                                            <label>定义:</label>
                                            <input
                                                type="text"
                                                value={def.definition}
                                                onChange={(e) => {
                                                    const content = [
                                                        ...form.content,
                                                    ];
                                                    content[
                                                        partIndex
                                                    ].definitions[
                                                        defIndex
                                                    ].definition =
                                                        e.target.value;
                                                    setForm({
                                                        ...form,
                                                        content,
                                                    });
                                                }}
                                                style={{
                                                    marginLeft: 10,
                                                    padding: 5,
                                                    width: '100%',
                                                }}
                                            />
                                        </div>

                                        {def.examples.map(
                                            (example, exIndex) => (
                                                <div
                                                    key={exIndex}
                                                    style={{
                                                        margin: '5px 0',
                                                        paddingLeft: 20,
                                                    }}>
                                                    <label>例句:</label>
                                                    <input
                                                        type="text"
                                                        value={example.text}
                                                        onChange={(e) => {
                                                            const content = [
                                                                ...form.content,
                                                            ];
                                                            content[
                                                                partIndex
                                                            ].definitions[
                                                                defIndex
                                                            ].examples[
                                                                exIndex
                                                            ].text =
                                                                e.target.value;
                                                            setForm({
                                                                ...form,
                                                                content,
                                                            });
                                                        }}
                                                        style={{
                                                            marginLeft: 10,
                                                            padding: 5,
                                                            width: '100%',
                                                        }}
                                                    />
                                                </div>
                                            ),
                                        )}

                                        <button
                                            onClick={() =>
                                                handleAddExample(
                                                    partIndex,
                                                    defIndex,
                                                )
                                            }
                                            style={{ marginTop: 5 }}>
                                            添加例句
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={() =>
                                        handleAddDefinition(partIndex)
                                    }
                                    style={{ marginTop: 10 }}>
                                    添加定义
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={handleAddPart}
                            style={{ marginTop: 10 }}>
                            添加词性
                        </button>

                        <div style={{ marginTop: 20 }}>
                            <button
                                onClick={handleSubmit}
                                style={{
                                    marginRight: 10,
                                    padding: '10px 20px',
                                }}>
                                {editTarget ? '更新' : '添加'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowAdd(false);
                                    setEditTarget(null);
                                    setForm({
                                        name: '',
                                        pronunciation: '',
                                        vocabulary: '',
                                        category: '',
                                        tags: [],
                                        level: '',
                                        queryCount: 0,
                                        partsOfSpeech: '',
                                        content: [],
                                    });
                                }}>
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { useState } from 'react';

export interface Example {
    text: string;
}
export interface Definition {
    definition: string;
    examples: Example[];
}
export interface PartContent {
    partOfSpeech: string;
    definitions: Definition[];
}
export interface Word {
    id: number;
    word: string;
    category: string;
    tags: string[];
    pronunciation: string;
    level: string;
    lookupCount: number;
    partsOfSpeech: string[];
    content: PartContent[];
}

interface WordManagerProps {
    words: Word[];
    onAdd: (word: Omit<Word, 'id'>) => void;
    onEdit: (word: Word) => void;
    onDelete: (id: number) => void;
}

export default function WordManager({
    words,
    onAdd,
    onEdit,
    onDelete,
}: WordManagerProps) {
    const [localWords, setLocalWords] = useState<Word[]>([]);
    const [localNextId, setLocalNextId] = useState(1);

    const [selectedWord, setSelectedWord] = useState<Word | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [editTarget, setEditTarget] = useState<Word | null>(null);

    const [form, setForm] = useState<Omit<Word, 'id'>>({
        word: '',
        category: '',
        tags: [],
        pronunciation: '',
        level: '',
        lookupCount: 0,
        partsOfSpeech: [],
        content: [],
    });

    React.useEffect(() => {
        setLocalWords(words);
    }, [words]);

    const handleAddPart = () => {
        setForm((f) => ({
            ...f,
            content: [...f.content, { partOfSpeech: '', definitions: [] }],
        }));
    };
    const handleRemovePart = (i: number) => {
        setForm((f) => ({
            ...f,
            content: f.content.filter((_, idx) => idx !== i),
        }));
    };
    const handleAddDefinition = (pi: number) => {
        setForm((f) => {
            const content = [...f.content];
            content[pi].definitions.push({ definition: '', examples: [] });
            return { ...f, content };
        });
    };
    const handleRemoveDefinition = (pi: number, di: number) => {
        setForm((f) => {
            const content = [...f.content];
            content[pi].definitions = content[pi].definitions.filter(
                (_, idx) => idx !== di,
            );
            return { ...f, content };
        });
    };
    const handleAddExample = (pi: number, di: number) => {
        setForm((f) => {
            const content = [...f.content];
            content[pi].definitions[di].examples.push({ text: '' });
            return { ...f, content };
        });
    };
    const handleRemoveExample = (pi: number, di: number, ei: number) => {
        setForm((f) => {
            const content = [...f.content];
            content[pi].definitions[di].examples = content[pi].definitions[
                di
            ].examples.filter((_, idx) => idx !== ei);
            return { ...f, content };
        });
    };

    const handleFormChange = (key: keyof Omit<Word, 'id'>, value: any) => {
        setForm((f) => ({ ...f, [key]: value }));
    };

    const handlePartChange = (i: number, value: string) => {
        setForm((f) => {
            const content = [...f.content];
            content[i].partOfSpeech = value;
            return { ...f, content };
        });
    };
    const handleDefinitionChange = (pi: number, di: number, value: string) => {
        setForm((f) => {
            const content = [...f.content];
            content[pi].definitions[di].definition = value;
            return { ...f, content };
        });
    };
    const handleExampleChange = (
        pi: number,
        di: number,
        ei: number,
        value: string,
    ) => {
        setForm((f) => {
            const content = [...f.content];
            content[pi].definitions[di].examples[ei].text = value;
            return { ...f, content };
        });
    };

    const handleSubmit = () => {
        if (editTarget) {
            const updated = { ...editTarget, ...form };
            setLocalWords((ws) =>
                ws.map((w) => (w.id === updated.id ? updated : w)),
            );
            onEdit(updated);
            setEditTarget(null);
        } else {
            const newWord = { ...form, id: localNextId };
            setLocalWords((ws) => [...ws, newWord]);
            setLocalNextId((id) => id + 1);
            onAdd(form);
        }
        setForm({
            word: '',
            category: '',
            tags: [],
            pronunciation: '',
            level: '',
            lookupCount: 0,
            partsOfSpeech: [],
            content: [],
        });
        setShowAdd(false);
        setSelectedWord(null);
    };

    const handleEditClick = (w: Word) => {
        setEditTarget(w);
        setForm({
            ...w,
            tags: w.tags.slice(),
            partsOfSpeech: w.partsOfSpeech.slice(),
            content: JSON.parse(JSON.stringify(w.content)),
        });
        setShowAdd(true);
    };

    const handleDelete = (id: number) => {
        setLocalWords((ws) => ws.filter((w) => w.id !== id));
    };

    const renderForm = () => (
        <div
            style={{
                background: '#fafbfc',
                borderRadius: 8,
                padding: 24,
                marginBottom: 24,
            }}>
            <h3>{editTarget ? '编辑单词' : '添加单词'}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <input
                    placeholder="名称"
                    value={form.word}
                    onChange={(e) => handleFormChange('word', e.target.value)}
                    style={{ width: 120 }}
                />
                <input
                    placeholder="分类"
                    value={form.category}
                    onChange={(e) =>
                        handleFormChange('category', e.target.value)
                    }
                    style={{ width: 120 }}
                />
                <input
                    placeholder="标签(逗号分隔)"
                    value={form.tags.join(',')}
                    onChange={(e) =>
                        handleFormChange(
                            'tags',
                            e.target.value
                                .split(',')
                                .map((t) => t.trim())
                                .filter(Boolean),
                        )
                    }
                    style={{ width: 160 }}
                />
                <input
                    placeholder="发音"
                    value={form.pronunciation}
                    onChange={(e) =>
                        handleFormChange('pronunciation', e.target.value)
                    }
                    style={{ width: 120 }}
                />
                <input
                    placeholder="等级"
                    value={form.level}
                    onChange={(e) => handleFormChange('level', e.target.value)}
                    style={{ width: 80 }}
                />
                <input
                    placeholder="查询次数"
                    type="number"
                    value={form.lookupCount}
                    onChange={(e) =>
                        handleFormChange('lookupCount', Number(e.target.value))
                    }
                    style={{ width: 80 }}
                />
                <input
                    placeholder="词性(逗号分隔)"
                    value={form.partsOfSpeech.join(',')}
                    onChange={(e) =>
                        handleFormChange(
                            'partsOfSpeech',
                            e.target.value
                                .split(',')
                                .map((t) => t.trim())
                                .filter(Boolean),
                        )
                    }
                    style={{ width: 160 }}
                />
            </div>
            <div style={{ marginTop: 16 }}>
                <b>内容：</b>
                {form.content.map((part, pi) => (
                    <div
                        key={pi}
                        style={{
                            border: '1px solid #eee',
                            margin: 8,
                            padding: 8,
                            borderRadius: 4,
                        }}>
                        <input
                            placeholder="词性"
                            value={part.partOfSpeech}
                            onChange={(e) =>
                                handlePartChange(pi, e.target.value)
                            }
                            style={{ marginRight: 8 }}
                        />
                        <button
                            onClick={() => handleRemovePart(pi)}
                            style={{ color: 'red', marginRight: 8 }}>
                            删除词性
                        </button>
                        <button
                            onClick={() => handleAddDefinition(pi)}
                            style={{ marginRight: 8 }}>
                            添加定义
                        </button>
                        {part.definitions.map((def, di) => (
                            <div
                                key={di}
                                style={{ marginLeft: 16, marginBottom: 4 }}>
                                <input
                                    placeholder="定义"
                                    value={def.definition}
                                    onChange={(e) =>
                                        handleDefinitionChange(
                                            pi,
                                            di,
                                            e.target.value,
                                        )
                                    }
                                    style={{ marginRight: 8 }}
                                />
                                <button
                                    onClick={() =>
                                        handleRemoveDefinition(pi, di)
                                    }
                                    style={{ color: 'red', marginRight: 8 }}>
                                    删除定义
                                </button>
                                <button
                                    onClick={() => handleAddExample(pi, di)}
                                    style={{ marginRight: 8 }}>
                                    添加例句
                                </button>
                                {def.examples.map((ex, ei) => (
                                    <span key={ei}>
                                        <input
                                            placeholder={`例句${ei + 1}`}
                                            value={ex.text}
                                            onChange={(e) =>
                                                handleExampleChange(
                                                    pi,
                                                    di,
                                                    ei,
                                                    e.target.value,
                                                )
                                            }
                                            style={{
                                                marginRight: 8,
                                                marginLeft: 8,
                                            }}
                                        />
                                        <button
                                            onClick={() =>
                                                handleRemoveExample(pi, di, ei)
                                            }
                                            style={{
                                                color: 'red',
                                                marginRight: 8,
                                            }}>
                                            删除例句
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
                <button
                    onClick={handleAddPart}
                    style={{ marginTop: 8 }}>
                    添加词性
                </button>
            </div>
            <div style={{ marginTop: 16 }}>
                <button
                    onClick={handleSubmit}
                    style={{ marginRight: 8 }}>
                    {editTarget ? '保存' : '添加'}
                </button>
                <button
                    onClick={() => {
                        setShowAdd(false);
                        setEditTarget(null);
                        setForm({
                            word: '',
                            category: '',
                            tags: [],
                            pronunciation: '',
                            level: '',
                            lookupCount: 0,
                            partsOfSpeech: [],
                            content: [],
                        });
                    }}>
                    取消
                </button>
            </div>
        </div>
    );

    return (
        <div
            style={{
                maxWidth: 900,
                margin: '0 auto',
                textAlign: 'left',
                padding: 24,
                background: '#f7f9fa',
                borderRadius: 12,
                boxShadow: '0 2px 8px #eee',
            }}>
            <h2
                style={{
                    textAlign: 'center',
                    marginBottom: 32,
                    color: '#2d5be3',
                    letterSpacing: 2,
                }}>
                单词词汇管理
            </h2>
            {showAdd && renderForm()}
            {!showAdd && selectedWord && (
                <div
                    style={{
                        padding: 32,
                        background: '#fff',
                        borderRadius: 10,
                        marginBottom: 24,
                        boxShadow: '0 1px 4px #eee',
                    }}>
                    <button
                        onClick={() => setSelectedWord(null)}
                        style={{
                            marginBottom: 16,
                            background: '#e3eafc',
                            border: 'none',
                            borderRadius: 4,
                            padding: '4px 12px',
                            cursor: 'pointer',
                        }}>
                        返回列表
                    </button>
                    <h3 style={{ color: '#2d5be3', marginBottom: 16 }}>
                        单词详情
                    </h3>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '120px 1fr',
                            rowGap: 8,
                            columnGap: 8,
                        }}>
                        <b>名称：</b>
                        <span>{selectedWord.word}</span>
                        <b>分类：</b>
                        <span>{selectedWord.category}</span>
                        <b>标签：</b>
                        <span>{selectedWord.tags?.join(', ')}</span>
                        <b>发音：</b>
                        <span>{selectedWord.pronunciation}</span>
                        <b>等级：</b>
                        <span>{selectedWord.level}</span>
                        <b>查询次数：</b>
                        <span>{selectedWord.lookupCount}</span>
                        <b>词性：</b>
                        <span>{selectedWord.partsOfSpeech?.join(', ')}</span>
                        <b>内容：</b>
                        <span>
                            {selectedWord.content?.map((part, i) => (
                                <div
                                    key={i}
                                    style={{ marginLeft: 8, marginBottom: 8 }}>
                                    <b style={{ color: '#2d5be3' }}>
                                        {part.partOfSpeech}
                                    </b>
                                    {part.definitions.map((def, j) => (
                                        <div
                                            key={j}
                                            style={{
                                                marginLeft: 12,
                                                marginBottom: 4,
                                            }}>
                                            <span style={{ color: '#333' }}>
                                                定义: {def.definition}
                                            </span>
                                            {def.examples.map((ex, k) => (
                                                <div
                                                    key={k}
                                                    style={{
                                                        marginLeft: 16,
                                                        color: '#888',
                                                    }}>
                                                    例句: {ex.text}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </span>
                    </div>
                </div>
            )}
            {!showAdd && !selectedWord && (
                <>
                    <button
                        onClick={() => {
                            setShowAdd(true);
                            setEditTarget(null);
                            setForm({
                                word: '',
                                category: '',
                                tags: [],
                                pronunciation: '',
                                level: '',
                                lookupCount: 0,
                                partsOfSpeech: [],
                                content: [],
                            });
                        }}
                        style={{
                            marginBottom: 20,
                            background: '#2d5be3',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            padding: '8px 20px',
                            fontWeight: 500,
                            fontSize: 16,
                            cursor: 'pointer',
                        }}>
                        添加单词
                    </button>
                    <div
                        style={{
                            overflowX: 'auto',
                            background: '#fff',
                            borderRadius: 8,
                            boxShadow: '0 1px 4px #eee',
                            padding: 16,
                        }}>
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: 15,
                            }}>
                            <thead>
                                <tr style={{ background: '#f0f4fa' }}>
                                    <th style={{ padding: 8 }}>名称</th>
                                    <th style={{ padding: 8 }}>词性</th>
                                    <th style={{ padding: 8 }}>查询次数</th>
                                    <th style={{ padding: 8 }}>发音</th>
                                    <th style={{ padding: 8 }}>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {localWords.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            style={{
                                                textAlign: 'center',
                                                color: '#aaa',
                                                padding: 24,
                                            }}>
                                            暂无单词，请点击“添加单词”
                                        </td>
                                    </tr>
                                ) : (
                                    localWords.map((w) => (
                                        <tr
                                            key={w.id}
                                            style={{
                                                borderBottom:
                                                    '1px solid #f0f0f0',
                                            }}>
                                            <td style={{ padding: 8 }}>
                                                <a
                                                    href="#"
                                                    onClick={() =>
                                                        setSelectedWord(w)
                                                    }
                                                    style={{
                                                        color: '#2d5be3',
                                                        textDecoration:
                                                            'underline',
                                                        cursor: 'pointer',
                                                    }}>
                                                    {w.word}
                                                </a>
                                            </td>
                                            <td style={{ padding: 8 }}>
                                                {w.partsOfSpeech?.join(', ')}
                                            </td>
                                            <td style={{ padding: 8 }}>
                                                {w.lookupCount}
                                            </td>
                                            <td style={{ padding: 8 }}>
                                                {w.pronunciation}
                                            </td>
                                            <td style={{ padding: 8 }}>
                                                <button
                                                    style={{
                                                        marginRight: 8,
                                                        background: '#e3eafc',
                                                        border: 'none',
                                                        borderRadius: 4,
                                                        padding: '4px 10px',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() =>
                                                        handleEditClick(w)
                                                    }>
                                                    编辑
                                                </button>
                                                <button
                                                    style={{
                                                        color: '#fff',
                                                        background: '#e34d59',
                                                        border: 'none',
                                                        borderRadius: 4,
                                                        padding: '4px 10px',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() =>
                                                        handleDelete(w.id)
                                                    }>
                                                    删除
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

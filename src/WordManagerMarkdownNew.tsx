// @ts-ignore
import React, { useState } from 'react';
import { Word } from './MarkdownWordStorage';

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
    const [selectedWord, setSelectedWord] = useState<Word | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [editTarget, setEditTarget] = useState<Word | null>(null);

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

    const handleSubmit = () => {
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
        setSelectedWord(null);
    };

    const handleEditClick = (word: Word) => {
        setEditTarget(word);
        setForm({
            ...word,
            tags: [...word.tags],
            content: JSON.parse(JSON.stringify(word.content)),
        });
        setShowAdd(true);
    };

    const handleAddPart = () => {
        setForm((f) => ({
            ...f,
            content: [...f.content, { type: '', definitions: [] }],
        }));
    };

    const handleAddDefinition = (partIndex: number) => {
        setForm((f) => {
            const content = [...f.content];
            content[partIndex].definitions.push({
                definition: '',
                examples: [],
            });
            return { ...f, content };
        });
    };

    const handleAddExample = (partIndex: number, defIndex: number) => {
        setForm((f) => {
            const content = [...f.content];
            content[partIndex].definitions[defIndex].examples.push({
                text: '',
            });
            return { ...f, content };
        });
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>单词管理</h1>
            <button onClick={() => setShowAdd(true)}>添加新单词</button>

            {showAdd && (
                <div
                    style={{
                        margin: '20px 0',
                        padding: 20,
                        border: '1px solid #ccc',
                        borderRadius: 8,
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
                            style={{ marginLeft: 10, padding: 5 }}
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
                            style={{ marginLeft: 10, padding: 5 }}
                        />
                    </div>

                    <div style={{ marginBottom: 10 }}>
                        <label>分类:</label>
                        <input
                            type="text"
                            value={form.category}
                            onChange={(e) =>
                                setForm({ ...form, category: e.target.value })
                            }
                            style={{ marginLeft: 10, padding: 5 }}
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
                            style={{ marginLeft: 10, padding: 5 }}
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
                            style={{ marginLeft: 10, padding: 5 }}
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
                                                content[partIndex].definitions[
                                                    defIndex
                                                ].definition = e.target.value;
                                                setForm({ ...form, content });
                                            }}
                                            style={{
                                                marginLeft: 10,
                                                padding: 5,
                                                width: '100%',
                                            }}
                                        />
                                    </div>

                                    {def.examples.map((example, exIndex) => (
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
                                                    ].examples[exIndex].text =
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
                                    ))}

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
                                onClick={() => handleAddDefinition(partIndex)}
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
                            style={{ marginRight: 10, padding: '10px 20px' }}>
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
            )}

            <h2>现有单词</h2>
            <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
                {words.map((word) => (
                    <div
                        key={word.name}
                        style={{
                            padding: 15,
                            border: '1px solid #ddd',
                            borderRadius: 8,
                        }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                            <h3>{word.name}</h3>
                            <div>
                                <button
                                    onClick={() => handleEditClick(word)}
                                    style={{ marginRight: 10 }}>
                                    编辑
                                </button>
                                <button onClick={() => onDelete(word.name)}>
                                    删除
                                </button>
                            </div>
                        </div>
                        <p>
                            <strong>发音:</strong> {word.pronunciation}
                        </p>
                        <p>
                            <strong>分类:</strong> {word.category}
                        </p>
                        <p>
                            <strong>标签:</strong> {word.tags.join(', ')}
                        </p>
                        <p>
                            <strong>等级:</strong> {word.level}
                        </p>
                        <p>
                            <strong>词性:</strong> {word.partsOfSpeech}
                        </p>
                        <p>
                            <strong>查询次数:</strong> {word.queryCount}
                        </p>

                        <div style={{ marginTop: 10 }}>
                            <strong>详细内容:</strong>
                            {word.content.map((part, partIndex) => (
                                <div
                                    key={partIndex}
                                    style={{ marginLeft: 20, marginTop: 5 }}>
                                    <strong>{part.type}</strong>
                                    {part.definitions.map((def, defIndex) => (
                                        <div
                                            key={defIndex}
                                            style={{
                                                marginLeft: 20,
                                                marginTop: 3,
                                            }}>
                                            <div>• {def.definition}</div>
                                            {def.examples.map(
                                                (example, exIndex) => (
                                                    <div
                                                        key={exIndex}
                                                        style={{
                                                            marginLeft: 20,
                                                            fontStyle: 'italic',
                                                            color: '#666',
                                                        }}>
                                                        - {example.text}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

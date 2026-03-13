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
    // 新增字段的本地 state
    const [newWord, setNewWord] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newTags, setNewTags] = useState('');
    const [newPronunciation, setNewPronunciation] = useState('');
    const [newLevel, setNewLevel] = useState('');
    const [newLookupCount, setNewLookupCount] = useState(0);
    const [newPartsOfSpeech, setNewPartsOfSpeech] = useState('');
    // 嵌套内容结构
    const [newContent, setNewContent] = useState<PartContent[]>([
        {
            partOfSpeech: '',
            definitions: [{ definition: '', examples: [{ text: '' }] }],
        },
    ]);

    const [editing, setEditing] = useState<Word | null>(null);
    const [editWord, setEditWord] = useState('');
    const [editMeaning, setEditMeaning] = useState('');

    // 本地数据用于演示静态功能
    const [localWords, setLocalWords] = useState<Word[]>([]);
    const [localNextId, setLocalNextId] = useState(1);

    const [selectedWord, setSelectedWord] = useState<Word | null>(null);

    const handleAdd = () => {
        if (!newWord) return;
        const newEntry: Word = {
            id: localNextId,
            word: newWord,
            category: newCategory,
            tags: newTags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            pronunciation: newPronunciation,
            level: newLevel,
            lookupCount: newLookupCount,
            partsOfSpeech: newPartsOfSpeech
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            content: newContent,
        };
        setLocalWords((ws) => [...ws, newEntry]);
        setLocalNextId((id) => id + 1);
        setNewWord('');
        setNewCategory('');
        setNewTags('');
        setNewPronunciation('');
        setNewLevel('');
        setNewLookupCount(0);
        setNewPartsOfSpeech('');
        setNewContent([
            {
                partOfSpeech: '',
                definitions: [{ definition: '', examples: [{ text: '' }] }],
            },
        ]);
    };

    const handleEdit = () => {
        if (editing && editWord && editMeaning) {
            setLocalWords((ws) =>
                ws.map((w) =>
                    w.id === editing.id
                        ? { ...editing, word: editWord, meaning: editMeaning }
                        : w,
                ),
            );
            setEditing(null);
        }
    };

    const handleDelete = (id: number) => {
        setLocalWords((ws) => ws.filter((w) => w.id !== id));
    };

    // 嵌套内容UI（只做静态展示/编辑，后续可细化交互）
    const renderContentEditor = () => (
        <div style={{ border: '1px solid #eee', padding: 8, marginTop: 8 }}>
            {newContent.map((part, i) => (
                <div
                    key={i}
                    style={{ marginBottom: 8 }}>
                    <input
                        placeholder="词性"
                        value={part.partOfSpeech}
                        onChange={(e) => {
                            const arr = [...newContent];
                            arr[i].partOfSpeech = e.target.value;
                            setNewContent(arr);
                        }}
                        style={{ marginRight: 8 }}
                    />
                    {part.definitions.map((def, j) => (
                        <div
                            key={j}
                            style={{ marginLeft: 16, marginBottom: 4 }}>
                            <input
                                placeholder="定义"
                                value={def.definition}
                                onChange={(e) => {
                                    const arr = [...newContent];
                                    arr[i].definitions[j].definition =
                                        e.target.value;
                                    setNewContent(arr);
                                }}
                                style={{ marginRight: 8 }}
                            />
                            {def.examples.map((ex, k) => (
                                <input
                                    key={k}
                                    placeholder={`例句${k + 1}`}
                                    value={ex.text}
                                    onChange={(e) => {
                                        const arr = [...newContent];
                                        arr[i].definitions[j].examples[k].text =
                                            e.target.value;
                                        setNewContent(arr);
                                    }}
                                    style={{ marginRight: 8, marginLeft: 8 }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    // 详情页面渲染
    const renderDetail = () => {
        if (!selectedWord) return null;
        const w = selectedWord;
        return (
            <div
                style={{
                    padding: 24,
                    background: '#fafbfc',
                    borderRadius: 8,
                    marginBottom: 24,
                }}>
                <button
                    onClick={() => setSelectedWord(null)}
                    style={{ marginBottom: 12 }}>
                    返回列表
                </button>
                <h3>单词详情</h3>
                <div>
                    <b>名称：</b>
                    {w.word}
                </div>
                <div>
                    <b>分类：</b>
                    {w.category}
                </div>
                <div>
                    <b>标签：</b>
                    {w.tags?.join(', ')}
                </div>
                <div>
                    <b>发音：</b>
                    {w.pronunciation}
                </div>
                <div>
                    <b>等级：</b>
                    {w.level}
                </div>
                <div>
                    <b>查询次数：</b>
                    {w.lookupCount}
                </div>
                <div>
                    <b>词性：</b>
                    {w.partsOfSpeech?.join(', ')}
                </div>
                <div>
                    <b>内容：</b>
                    {w.content?.map((part, i) => (
                        <div
                            key={i}
                            style={{ marginLeft: 8 }}>
                            <b>{part.partOfSpeech}</b>
                            {part.definitions.map((def, j) => (
                                <div
                                    key={j}
                                    style={{ marginLeft: 8 }}>
                                    <span>定义: {def.definition}</span>
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
                </div>
            </div>
        );
    };

    return (
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'left' }}>
            <h2>单词词汇管理</h2>
            {renderDetail()}
            {!selectedWord && (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <input
                            placeholder="名称"
                            value={newWord}
                            onChange={(e) => setNewWord(e.target.value)}
                            style={{ marginRight: 8 }}
                        />
                        <input
                            placeholder="分类"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            style={{ marginRight: 8 }}
                        />
                        <input
                            placeholder="标签(逗号分隔)"
                            value={newTags}
                            onChange={(e) => setNewTags(e.target.value)}
                            style={{ marginRight: 8 }}
                        />
                        <input
                            placeholder="发音"
                            value={newPronunciation}
                            onChange={(e) =>
                                setNewPronunciation(e.target.value)
                            }
                            style={{ marginRight: 8 }}
                        />
                        <input
                            placeholder="等级"
                            value={newLevel}
                            onChange={(e) => setNewLevel(e.target.value)}
                            style={{ marginRight: 8 }}
                        />
                        <input
                            placeholder="查询次数"
                            type="number"
                            value={newLookupCount}
                            onChange={(e) =>
                                setNewLookupCount(Number(e.target.value))
                            }
                            style={{ marginRight: 8, width: 80 }}
                        />
                        <input
                            placeholder="词性(逗号分隔)"
                            value={newPartsOfSpeech}
                            onChange={(e) =>
                                setNewPartsOfSpeech(e.target.value)
                            }
                            style={{ marginRight: 8 }}
                        />
                        {renderContentEditor()}
                        <button onClick={handleAdd}>添加</button>
                    </div>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: 14,
                        }}>
                        <thead>
                            <tr>
                                <th>名称</th>
                                <th>分类</th>
                                <th>标签</th>
                                <th>发音</th>
                                <th>等级</th>
                                <th>查询次数</th>
                                <th>词性</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {localWords.map((w) => (
                                <tr key={w.id}>
                                    <td>
                                        <a
                                            href="#"
                                            onClick={() => setSelectedWord(w)}>
                                            {w.word}
                                        </a>
                                    </td>
                                    <td>{w.category}</td>
                                    <td>{w.tags?.join(', ')}</td>
                                    <td>{w.pronunciation}</td>
                                    <td>{w.level}</td>
                                    <td>{w.lookupCount}</td>
                                    <td>{w.partsOfSpeech?.join(', ')}</td>
                                    <td>
                                        <button
                                            style={{ color: 'red' }}
                                            onClick={() => handleDelete(w.id)}>
                                            删除
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}

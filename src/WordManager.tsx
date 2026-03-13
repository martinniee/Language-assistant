import React, { useState } from 'react';

export interface Word {
    id: number;
    word: string;
    meaning: string;
}

interface WordManagerProps {
    words: Word[];
    onAdd: (word: Omit<Word, 'id'>) => void;
    onEdit: (word: Word) => void;
}

export default function WordManager({
    words,
    onAdd,
    onEdit,
}: WordManagerProps) {
    const [newWord, setNewWord] = useState('');
    const [newMeaning, setNewMeaning] = useState('');
    const [editing, setEditing] = useState<Word | null>(null);
    const [editWord, setEditWord] = useState('');
    const [editMeaning, setEditMeaning] = useState('');

    const handleAdd = () => {
        if (newWord && newMeaning) {
            onAdd({ word: newWord, meaning: newMeaning });
            setNewWord('');
            setNewMeaning('');
        }
    };

    const handleEdit = () => {
        if (editing && editWord && editMeaning) {
            onEdit({ ...editing, word: editWord, meaning: editMeaning });
            setEditing(null);
        }
    };

    return (
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'left' }}>
            <h2>单词词汇管理</h2>
            <div style={{ marginBottom: 16 }}>
                <input
                    placeholder="单词"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    style={{ marginRight: 8 }}
                />
                <input
                    placeholder="释义"
                    value={newMeaning}
                    onChange={(e) => setNewMeaning(e.target.value)}
                    style={{ marginRight: 8 }}
                />
                <button onClick={handleAdd}>添加</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ borderBottom: '1px solid #ccc' }}>单词</th>
                        <th style={{ borderBottom: '1px solid #ccc' }}>释义</th>
                        <th style={{ borderBottom: '1px solid #ccc' }}>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {words.map((w) =>
                        editing?.id === w.id ? (
                            <tr key={w.id}>
                                <td>
                                    <input
                                        value={editWord}
                                        onChange={(e) =>
                                            setEditWord(e.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        value={editMeaning}
                                        onChange={(e) =>
                                            setEditMeaning(e.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <button onClick={handleEdit}>保存</button>
                                    <button onClick={() => setEditing(null)}>
                                        取消
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            <tr key={w.id}>
                                <td>{w.word}</td>
                                <td>{w.meaning}</td>
                                <td>
                                    <button
                                        onClick={() => {
                                            setEditing(w);
                                            setEditWord(w.word);
                                            setEditMeaning(w.meaning);
                                        }}>
                                        编辑
                                    </button>
                                </td>
                            </tr>
                        ),
                    )}
                </tbody>
            </table>
        </div>
    );
}

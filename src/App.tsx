import { useState } from 'react';
import WordManager from './WordManager';
import type { Word } from './WordManager';
import './App.css';

function App() {
    const [words, setWords] = useState<Word[]>([]);
    const [nextId, setNextId] = useState(1);

    const handleAdd = (word: Omit<Word, 'id'>) => {
        setWords((ws) => [...ws, { ...word, id: nextId }]);
        setNextId((id) => id + 1);
    };
    const handleEdit = (word: Word) => {
        setWords((ws) => ws.map((w) => (w.id === word.id ? word : w)));
    };

    return (
        <div style={{ padding: 32 }}>
            <WordManager
                words={words}
                onAdd={handleAdd}
                onEdit={handleEdit}
            />
        </div>
    );
}

export default App;

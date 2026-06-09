import { Word } from '../MarkdownWordStorage';

export interface WordManagerProps {
    words: Word[];
    onAdd: (word: Word) => void;
    onEdit: (word: Word, originalWord?: Word, silent?: boolean) => void;
    onDelete: (name: string) => void;
    onJumpToSource: (wordId: string) => void;
}
export type ViewMode =
    | 'home'
    | 'srs'
    | 'statistics'
    | 'import-export'
    | 'settings'
    | 'global-meta';
export interface MainAppProps {
    words: Word[];
    onAdd: (word: Word) => void;
    onEdit: (word: Word, originalWord?: Word, silent?: boolean) => void;
    onDelete: (name: string) => void;
    onBatchUpdate?: (words: Word[]) => void; // 新增批量更新方法
    onJumpToSource: (wordId: string) => void;
}
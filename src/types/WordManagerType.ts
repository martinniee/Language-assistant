import { Word } from '../MarkdownWordStorage';
import type { App } from 'obsidian';

export interface WordManagerProps {
    app: App;
    markdownSourcePath: string;
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
    app: App;
    markdownSourcePath: string;
    words: Word[];
    onAdd: (word: Word) => void;
    onEdit: (word: Word, originalWord?: Word, silent?: boolean) => void;
    onDelete: (name: string) => void;
    onBatchUpdate?: (words: Word[]) => Promise<void> | void; // 新增批量更新方法
    onJumpToSource: (wordId: string) => void;
}

// @ts-ignore
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Word, WordHelper } from './MarkdownWordStorage';

// 使用 WordHelper 创建空白单词
const createEmptyWord = (): Word => WordHelper.createEmpty();

const getWordId = (word: Word): string => WordHelper.getId(word);
const getWordQueryCount = (word: Word): number =>
    WordHelper.getQueryCount(word);

// 预定义词性选项 - 分组显示
const PARTS_OF_SPEECH_GROUPS = {
    基础词性: ['名词', '动词', '形容词', '副词'],
    功能词性: ['介词', '代词', '连词', '感叹词'],
    特殊词性: ['助动词', '情态动词', '数词', '冠词'],
    动词形式: ['不定式', '动名词', '分词'],
};

interface WordManagerProps {
    words: Word[];
    onAdd: (word: Word) => void;
    onEdit: (word: Word, originalWord?: Word, silent?: boolean) => void;
    onDelete: (name: string) => void;
    onJumpToSource: (wordId: string) => void;
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

// 缩略卡片组件 - iOS 风格
const WordCard: React.FC<{
    word: Word;
    searchTerm: string;
    onEdit: () => void;
    onDelete: () => void;
    onViewDetail: () => void;
    onJumpToSource: () => void;
    enableFullHighlight: boolean;
}> = React.memo(
    ({
        word,
        searchTerm,
        onEdit,
        onDelete,
        onViewDetail,
        onJumpToSource,
        enableFullHighlight,
    }) => {
        return (
            <div
                style={{
                    padding: '20px',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    fontFamily:
                        '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                        '0 4px 16px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                        '0 2px 8px rgba(0,0,0,0.04)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12,
                    }}>
                    <h3
                        style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#1C1C1E',
                            letterSpacing: '-0.3px',
                        }}>
                        <HighlightText
                            text={word.name}
                            searchTerm={searchTerm}
                        />
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            style={{
                                padding: '8px 14px',
                                fontSize: '13px',
                                backgroundColor: '#F2F2F7',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                color: '#007AFF',
                                fontWeight: '600',
                                transition:
                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                fontFamily:
                                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#E5E5EA';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#F2F2F7';
                            }}>
                            ✏️ 编辑
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            style={{
                                padding: '8px 14px',
                                fontSize: '13px',
                                backgroundColor: '#FFEBEE',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                color: '#FF3B30',
                                fontWeight: '600',
                                transition:
                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                fontFamily:
                                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#FF3B30';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#FFEBEE';
                                e.currentTarget.style.color = '#FF3B30';
                            }}>
                            🗑️ 删除
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onJumpToSource();
                            }}
                            style={{
                                padding: '8px 14px',
                                fontSize: '13px',
                                backgroundColor: '#E3F2FD',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                color: '#007AFF',
                                fontWeight: '600',
                                transition:
                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                fontFamily:
                                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#007AFF';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#E3F2FD';
                                e.currentTarget.style.color = '#007AFF';
                            }}>
                            🔗 跳转
                        </button>
                    </div>
                </div>

                <div
                    onClick={onViewDetail}
                    style={{ cursor: 'pointer' }}>
                    <p
                        style={{
                            margin: '8px 0',
                            fontSize: '15px',
                            color: '#8E8E93',
                            lineHeight: '1.5',
                        }}>
                        <strong style={{ color: '#48484A' }}>发音:</strong>{' '}
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
                            margin: '8px 0',
                            fontSize: '15px',
                            color: '#8E8E93',
                            lineHeight: '1.5',
                        }}>
                        <strong style={{ color: '#48484A' }}>分类:</strong>{' '}
                        {enableFullHighlight ? (
                            <HighlightText
                                text={WordHelper.getCategory(word)}
                                searchTerm={searchTerm}
                            />
                        ) : (
                            WordHelper.getCategory(word)
                        )}
                    </p>
                    <p
                        style={{
                            margin: '8px 0',
                            fontSize: '15px',
                            color: '#8E8E93',
                            lineHeight: '1.5',
                        }}>
                        <strong style={{ color: '#48484A' }}>标签:</strong>{' '}
                        {enableFullHighlight ? (
                            <HighlightText
                                text={WordHelper.getTags(word).join(', ')}
                                searchTerm={searchTerm}
                            />
                        ) : (
                            WordHelper.getTags(word).join(', ')
                        )}
                    </p>

                    {word.notes && word.notes.trim() && (
                        <p
                            style={{
                                margin: '12px 0 8px 0',
                                fontSize: '15px',
                                color: '#8E8E93',
                                fontStyle: 'normal',
                                backgroundColor: '#FFF9E6',
                                padding: '10px 12px',
                                borderRadius: '10px',
                                borderLeft: '3px solid #FF9500',
                                lineHeight: '1.5',
                            }}>
                            <strong style={{ color: '#FF9500' }}>
                                💡 备注:
                            </strong>{' '}
                            {enableFullHighlight ? (
                                <HighlightText
                                    text={word.notes}
                                    searchTerm={searchTerm}
                                />
                            ) : (
                                word.notes
                            )}
                        </p>
                    )}

                    <div
                        style={{
                            marginTop: 12,
                            fontSize: '13px',
                            color: '#C7C7CC',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                        <span
                            style={{
                                padding: '4px 10px',
                                backgroundColor: '#F2F2F7',
                                borderRadius: '8px',
                                color: '#8E8E93',
                                fontWeight: '500',
                            }}>
                            等级: {WordHelper.getLevel(word)}
                        </span>
                        <span
                            style={{
                                color: '#007AFF',
                                fontWeight: '500',
                            }}>
                            点击查看详情 →
                        </span>
                    </div>
                </div>
            </div>
        );
    },
);

// 列表视图单词组件 - iOS 风格
const WordListItem: React.FC<{
    word: Word;
    searchTerm: string;
    onEdit: () => void;
    onDelete: () => void;
    onViewDetail: () => void;
    onJumpToSource: () => void;
    enableFullHighlight: boolean;
    isLast?: boolean;
}> = React.memo(
    ({
        word,
        searchTerm,
        onEdit,
        onDelete,
        onViewDetail,
        onJumpToSource,
        enableFullHighlight,
        isLast = false,
    }) => {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    border: 'none',
                    borderBottom: isLast
                        ? 'none'
                        : '1px solid rgba(0,0,0,0.06)',
                    borderRadius: isLast ? '0 0 16px 16px' : '0',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    backgroundColor: '#ffffff',
                    minHeight: '68px',
                    fontFamily:
                        '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F2F2F7';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                }}
                onClick={onViewDetail}>
                {/* 单词名称 */}
                <div
                    style={{
                        flex: '0 0 200px',
                        fontWeight: '600',
                        fontSize: '17px',
                        color: '#1C1C1E',
                        letterSpacing: '-0.3px',
                    }}>
                    <HighlightText
                        text={word.name}
                        searchTerm={searchTerm}
                    />
                </div>
                {/* 发音 */}
                <div
                    style={{
                        flex: '0 0 180px',
                        fontSize: '15px',
                        color: '#8E8E93',
                    }}>
                    {enableFullHighlight ? (
                        <HighlightText
                            text={word.pronunciation}
                            searchTerm={searchTerm}
                        />
                    ) : (
                        word.pronunciation
                    )}
                </div>
                {/* 分类 */}
                <div style={{ flex: '0 0 120px', fontSize: '15px' }}>
                    <span
                        style={{
                            padding: '4px 12px',
                            backgroundColor: '#E3F2FD',
                            color: '#007AFF',
                            borderRadius: 14,
                            fontSize: '13px',
                            fontWeight: '600',
                        }}>
                        {enableFullHighlight ? (
                            <HighlightText
                                text={WordHelper.getCategory(word)}
                                searchTerm={searchTerm}
                            />
                        ) : (
                            WordHelper.getCategory(word)
                        )}
                    </span>
                </div>
                {/* 标签 */}
                <div style={{ flex: '1', fontSize: '15px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {WordHelper.getTags(word)
                            .slice(0, 3)
                            .map((tag, index) => (
                                <span
                                    key={index}
                                    style={{
                                        padding: '4px 10px',
                                        backgroundColor: '#E8F5E9',
                                        color: '#34C759',
                                        borderRadius: 12,
                                        fontSize: '12px',
                                        fontWeight: '500',
                                    }}>
                                    {enableFullHighlight ? (
                                        <HighlightText
                                            text={tag}
                                            searchTerm={searchTerm}
                                        />
                                    ) : (
                                        tag
                                    )}
                                </span>
                            ))}
                        {WordHelper.getTags(word).length > 3 && (
                            <span
                                style={{
                                    fontSize: '12px',
                                    color: '#8E8E93',
                                    fontWeight: '500',
                                }}>
                                +{WordHelper.getTags(word).length - 3}
                            </span>
                        )}
                    </div>
                </div>
                {/* 查询次数 */}
                <div
                    style={{
                        flex: '0 0 80px',
                        fontSize: '15px',
                        color: '#8E8E93',
                        textAlign: 'center',
                        fontWeight: '500',
                    }}>
                    {getWordQueryCount(word)}
                </div>
                {/* 等级 */}
                <div
                    style={{
                        flex: '0 0 60px',
                        fontSize: '13px',
                        textAlign: 'center',
                    }}>
                    <span
                        style={{
                            padding: '4px 8px',
                            backgroundColor:
                                WordHelper.getLevel(word) === '高级'
                                    ? '#FFEBEE'
                                    : WordHelper.getLevel(word) === '中级'
                                    ? '#FFF3E0'
                                    : '#E8F5E9',
                            color:
                                WordHelper.getLevel(word) === '高级'
                                    ? '#FF3B30'
                                    : WordHelper.getLevel(word) === '中级'
                                    ? '#FF9500'
                                    : '#34C759',
                            borderRadius: 10,
                            fontSize: '12px',
                            fontWeight: '600',
                        }}>
                        {WordHelper.getLevel(word)}
                    </span>
                </div>
                {/* 操作按钮 */}
                <div
                    style={{
                        flex: '0 0 140px',
                        display: 'flex',
                        gap: '6px',
                        justifyContent: 'flex-end',
                    }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            backgroundColor: '#F2F2F7',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#007AFF',
                            fontWeight: '600',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            fontFamily:
                                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#E5E5EA';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#F2F2F7';
                        }}>
                        ✏️
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            backgroundColor: '#FFEBEE',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#FF3B30',
                            fontWeight: '600',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            fontFamily:
                                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#FF3B30';
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFEBEE';
                            e.currentTarget.style.color = '#FF3B30';
                        }}>
                        🗑️
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onJumpToSource();
                        }}
                        style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            backgroundColor: '#E3F2FD',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#007AFF',
                            fontWeight: '600',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            fontFamily:
                                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#007AFF';
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#E3F2FD';
                            e.currentTarget.style.color = '#007AFF';
                        }}>
                        🔗
                    </button>
                </div>
            </div>
        );
    },
);

interface WordManagerProps {
    words: Word[];
    onAdd: (word: Word) => void;
    onEdit: (word: Word, originalWord?: Word, silent?: boolean) => void;
    onDelete: (name: string) => void;
    onJumpToSource: (wordId: string) => void;
}

export default function WordManagerMarkdown({
    words,
    onAdd,
    onEdit,
    onDelete,
    onJumpToSource,
}: WordManagerProps) {
    const [showAdd, setShowAdd] = useState(false);
    const [editTarget, setEditTarget] = useState<Word | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [enableFullHighlight, setEnableFullHighlight] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'filter'>(
        'list',
    );
    const [currentWord, setCurrentWord] = useState<Word | null>(null);

    // 添加搜索框引用
    const searchInputRef = useRef<HTMLInputElement>(null);

    // 添加快捷键支持
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+F 或 Cmd+F 或 / 快捷键聚焦搜索框
            if (((e.ctrlKey || e.metaKey) && e.key === 'f') || e.key === '/') {
                e.preventDefault();
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                    console.log('⌨️ 快捷键聚焦搜索框');
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 监控数据变化 - 避免频繁打印
    React.useEffect(() => {
        console.log(
            `📝 WordManager received ${words.length} words, updating interface`,
        );
    }, [words.length]);

    // 监控 words 数组内容变化 - 使用 useMemo 优化
    const wordsHash = useMemo(() => {
        return words.map((w) => w.name).join(',');
    }, [words]);

    React.useEffect(() => {
        console.log(
            `🔄 Words data changed, hash: ${wordsHash.slice(0, 50)}...`,
        );
    }, [wordsHash]);

    // 监控视图模式变化
    React.useEffect(() => {
        console.log('🎯 ViewMode changed to:', viewMode);
    }, [viewMode]);

    // 监控当前单词变化
    React.useEffect(() => {
        console.log(
            '📖 CurrentWord changed to:',
            currentWord ? currentWord.name : 'null',
        );
    }, [currentWord]);

    // 新增：标签和分类过滤状态
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [selectedPartsOfSpeech, setSelectedPartsOfSpeech] = useState<
        string[]
    >([]);
    const [showFilters, setShowFilters] = useState(false);

    // 新增：展示功能状态
    const [displayMode, setDisplayMode] = useState<'list' | 'grid'>('grid');
    const [sortBy, setSortBy] = useState<
        'name' | 'date' | 'queryCount' | 'category'
    >('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12); // 新增：错误提示状态
    const [errorMessage, setErrorMessage] = useState(''); // 新增：新建标签输入状态
    const [newTagInput, setNewTagInput] = useState('');

    // 优化的搜索函数 - 提前退出和缓存
    const searchInWord = useCallback((word: Word, term: string): boolean => {
        if (!term) return true;

        const lowerTerm = term.toLowerCase(); // 基本字段搜索 - 提前退出
        if (word.name.toLowerCase().includes(lowerTerm)) return true;
        if (WordHelper.getCategory(word).toLowerCase().includes(lowerTerm))
            return true;
        if (WordHelper.getLevel(word).toLowerCase().includes(lowerTerm))
            return true;
        if (word.partsOfSpeech.toLowerCase().includes(lowerTerm)) return true;
        if (word.pronunciation.toLowerCase().includes(lowerTerm)) return true;
        if (word.notes && word.notes.toLowerCase().includes(lowerTerm))
            return true;

        // 标签搜索
        if (
            WordHelper.getTags(word).some((tag) =>
                tag.toLowerCase().includes(lowerTerm),
            )
        )
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
    }, []);

    // 提取所有唯一的标签和分类
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        words.forEach((word) => {
            WordHelper.getTags(word).forEach((tag) => {
                if (tag.trim()) tagSet.add(tag.trim());
            });
        });
        return Array.from(tagSet).sort();
    }, [words]);
    const allCategories = useMemo(() => {
        const categorySet = new Set<string>();
        words.forEach((word) => {
            if (WordHelper.getCategory(word).trim())
                categorySet.add(WordHelper.getCategory(word).trim());
        });
        return Array.from(categorySet).sort();
    }, [words]);

    // 提取所有唯一的等级
    const allLevels = useMemo(() => {
        const levelSet = new Set<string>();
        words.forEach((word) => {
            if (WordHelper.getLevel(word).trim())
                levelSet.add(WordHelper.getLevel(word).trim());
        });
        return Array.from(levelSet).sort();
    }, [words]);

    // 提取所有唯一的词性
    const allPartsOfSpeech = useMemo(() => {
        const partsOfSpeechSet = new Set<string>();
        words.forEach((word) => {
            if (word.partsOfSpeech.trim())
                partsOfSpeechSet.add(word.partsOfSpeech.trim());
        });
        return Array.from(partsOfSpeechSet).sort();
    }, [words]); // 综合过滤函数：搜索 + 标签 + 分类 + 等级 + 词性
    const applyFilters = useCallback(
        (word: Word): boolean => {
            // 搜索过滤
            if (!searchInWord(word, searchTerm)) return false;

            // 标签过滤
            if (selectedTags.length > 0) {
                const hasSelectedTag = selectedTags.some((selectedTag) =>
                    WordHelper.getTags(word).some(
                        (wordTag) => wordTag.trim() === selectedTag,
                    ),
                );
                if (!hasSelectedTag) return false;
            }

            // 分类过滤
            if (selectedCategories.length > 0) {
                if (
                    !selectedCategories.includes(
                        WordHelper.getCategory(word).trim(),
                    )
                )
                    return false;
            }

            // 等级过滤
            if (selectedLevels.length > 0) {
                if (!selectedLevels.includes(WordHelper.getLevel(word).trim()))
                    return false;
            }

            // 词性过滤
            if (selectedPartsOfSpeech.length > 0) {
                if (!selectedPartsOfSpeech.includes(word.partsOfSpeech.trim()))
                    return false;
            }

            return true;
        },
        [
            searchInWord,
            searchTerm,
            selectedTags,
            selectedCategories,
            selectedLevels,
            selectedPartsOfSpeech,
        ],
    ); // 使用 useMemo 缓存过滤结果
    const filteredWords = useMemo(() => {
        return words.filter(applyFilters);
    }, [words, applyFilters]);

    // 排序逻辑
    const sortedWords = useMemo(() => {
        const sorted = [...filteredWords];

        sorted.sort((a, b) => {
            let compareResult = 0;
            switch (sortBy) {
                case 'name':
                    compareResult = a.name.localeCompare(b.name);
                    break;
                case 'category':
                    compareResult = WordHelper.getCategory(a).localeCompare(
                        WordHelper.getCategory(b),
                    );
                    break;
                case 'queryCount':
                    compareResult = getWordQueryCount(a) - getWordQueryCount(b);
                    break;
                case 'date':
                    // 假设按字母顺序作为时间替代（实际项目中应该有时间戳字段）
                    compareResult = a.name.localeCompare(b.name);
                    break;
                default:
                    compareResult = 0;
            }

            return sortOrder === 'asc' ? compareResult : -compareResult;
        });

        return sorted;
    }, [filteredWords, sortBy, sortOrder]);

    // 分页逻辑
    const paginatedWords = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedWords.slice(startIndex, endIndex);
    }, [sortedWords, currentPage, itemsPerPage]); // 总页数
    const totalPages = Math.ceil(sortedWords.length / itemsPerPage);
    const [form, setForm] = useState<Word>(createEmptyWord());
    const handleSubmit = useCallback(() => {
        // 清除之前的错误消息
        setErrorMessage('');

        // 验证单词名称不能为空
        if (!form.name.trim()) {
            setErrorMessage('单词名称不能为空');
            return;
        }

        // 检查单词名称是否重复
        const trimmedName = form.name.trim();
        const isDuplicate = words.some(
            (word) =>
                word.name.toLowerCase() === trimmedName.toLowerCase() &&
                (!editTarget || word.name !== editTarget.name),
        );

        if (isDuplicate) {
            setErrorMessage(`单词 "${trimmedName}" 已存在，请使用不同的名称`);
            return;
        }

        // 记录操作类型用于调试
        const operation = editTarget ? '编辑' : '添加';
        console.log(`🔄 ${operation}单词操作开始:`, trimmedName);

        try {
            if (editTarget) {
                // 编辑时保留原有元数据
                onEdit(
                    {
                        ...form,
                        name: trimmedName,
                    },
                    editTarget,
                );
                setEditTarget(null);
                console.log(`✅ ${operation}单词请求已发送，等待界面更新`);
            } else {
                // 添加新单词时，让后端生成ID
                onAdd({ ...form, name: trimmedName });
                console.log(`✅ ${operation}单词请求已发送，等待界面更新`);
            }

            // 重置表单和错误消息
            setForm(createEmptyWord());
            setErrorMessage('');
            setNewTagInput('');
            setShowAdd(false);

            // 如果在详细视图中，返回列表视图以查看更新
            if (viewMode === 'detail') {
                setViewMode('list');
                setCurrentWord(null);
                console.log('🔄 返回列表视图以查看更新');
            }
        } catch (error) {
            console.error(`❌ ${operation}单词时发生错误:`, error);
            setErrorMessage(`${operation}失败，请重试`);
        }
    }, [editTarget, form, onEdit, onAdd, words, viewMode]);
    const handleEditClick = useCallback((word: Word) => {
        setEditTarget(word);
        setForm({
            ...word,
            content: JSON.parse(JSON.stringify(word.content)),
        });
        setNewTagInput(''); // 重置新标签输入
        setShowAdd(true);
    }, []);

    // 标签和分类过滤处理函数
    const handleTagToggle = useCallback((tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
        );
    }, []);
    const handleCategoryToggle = useCallback((category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category],
        );
    }, []);

    const handleLevelToggle = useCallback((level: string) => {
        setSelectedLevels((prev) =>
            prev.includes(level)
                ? prev.filter((l) => l !== level)
                : [...prev, level],
        );
    }, []);

    const handlePartsOfSpeechToggle = useCallback((partsOfSpeech: string) => {
        setSelectedPartsOfSpeech((prev) =>
            prev.includes(partsOfSpeech)
                ? prev.filter((p) => p !== partsOfSpeech)
                : [...prev, partsOfSpeech],
        );
    }, []);

    const clearAllFilters = useCallback(() => {
        setSelectedTags([]);
        setSelectedCategories([]);
        setSelectedLevels([]);
        setSelectedPartsOfSpeech([]);
        setSearchTerm('');
        console.log('🔄 清除所有筛选');
    }, []);
    const handleAddPart = useCallback(() => {
        setForm((f) => ({
            ...f,
            content: [
                ...f.content,
                {
                    type: '',
                    definitions: [
                        {
                            definition: '',
                            examples: [],
                        },
                    ],
                },
            ],
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
    ); // 删除功能的回调函数 - 带确认提示
    const handleRemovePart = useCallback(
        (partIndex: number) => {
            const partType = form.content[partIndex].type || '未命名词性';
            const definitionsCount = form.content[partIndex].definitions.length;

            if (
                window.confirm(
                    `确定要删除词性"${partType}"吗？\n` +
                        `这将同时删除该词性下的 ${definitionsCount} 个定义及其所有例句。\n\n` +
                        `此操作无法撤销。`,
                )
            ) {
                setForm((f) => {
                    const content = [...f.content];
                    content.splice(partIndex, 1);
                    return { ...f, content };
                });
            }
        },
        [form.content],
    );

    const handleRemoveDefinition = useCallback(
        (partIndex: number, defIndex: number) => {
            const definition =
                form.content[partIndex].definitions[defIndex].definition ||
                '空定义';
            const examplesCount =
                form.content[partIndex].definitions[defIndex].examples.length;
            const shortDefinition =
                definition.length > 20
                    ? definition.substring(0, 20) + '...'
                    : definition;

            if (
                window.confirm(
                    `确定要删除定义"${shortDefinition}"吗？\n` +
                        `这将同时删除该定义下的 ${examplesCount} 个例句。\n\n` +
                        `此操作无法撤销。`,
                )
            ) {
                setForm((f) => {
                    const content = [...f.content];
                    content[partIndex].definitions.splice(defIndex, 1);
                    return { ...f, content };
                });
            }
        },
        [form.content],
    );

    const handleRemoveExample = useCallback(
        (partIndex: number, defIndex: number, exIndex: number) => {
            const example =
                form.content[partIndex].definitions[defIndex].examples[exIndex]
                    .text || '空例句';
            const shortExample =
                example.length > 30
                    ? example.substring(0, 30) + '...'
                    : example;

            if (
                window.confirm(
                    `确定要删除例句"${shortExample}"吗？\n\n` +
                        `此操作无法撤销。`,
                )
            ) {
                setForm((f) => {
                    const content = [...f.content];
                    content[partIndex].definitions[defIndex].examples.splice(
                        exIndex,
                        1,
                    );
                    return { ...f, content };
                });
            }
        },
        [form.content],
    ); // 页面模式切换函数 - 只有通过搜索/筛选后查看才增加查询次数
    const handleViewWord = useCallback(
        (word: Word) => {
            console.log('🔍 handleViewWord called for word:', word.name);

            // 动态读取当前搜索框的值，避免闭包问题
            // 不能依赖 useCallback 的 searchTerm，因为可能捕获旧值
            const currentSearchTerm = searchInputRef.current?.value || '';
            const hasSearchQuery = currentSearchTerm.trim() !== '';

            console.log('🔍 hasSearchQuery:', hasSearchQuery);
            console.log('🔍 current searchTerm from ref:', currentSearchTerm);
            console.log('📊 Current viewCount:', word.itemMeta?.viewCount || 0);

            let updatedWord: Word;

            if (hasSearchQuery) {
                // 搜索框有内容时，增加查询次数
                updatedWord = {
                    ...word,
                    itemMeta: {
                        ...word.itemMeta,
                        viewCount: (word.itemMeta?.viewCount || 0) + 1,
                    },
                };
                console.log(
                    '📊 New viewCount will be:',
                    updatedWord.itemMeta.viewCount,
                );
            } else {
                // 搜索框为空时，不增加查询次数
                updatedWord = word;
                console.log('📊 No search query - viewCount unchanged');
            }

            // 首先立即设置视图状态
            console.log('📝 Setting currentWord and switching to detail view');
            setCurrentWord(updatedWord);
            setViewMode('detail');

            // 只有在搜索框有内容时才更新后端数据
            if (hasSearchQuery) {
                setTimeout(() => {
                    // 静默更新到后端（不显示通知）
                    console.log(
                        '📊 Silent update to backend with viewCount:',
                        updatedWord.itemMeta.viewCount,
                    );
                    onEdit(updatedWord, word, true);
                }, 10);
            }

            console.log('✅ View mode changed to detail, currentWord set');
        },
        [onEdit],
    );
    const handleBackToList = useCallback(() => {
        console.log('🔙 返回列表');
        setViewMode('list');
        setCurrentWord(null);

        // 💡 不需要调用 onRefresh()
        // 因为 viewCount 已经通过 onEdit 静默模式更新到内存中
        // 调用 onRefresh() 会导致整个组件重新渲染，丢失筛选条件
    }, []); // 带确认提示的单词删除函数
    const handleDeleteWord = useCallback(
        (word: Word) => {
            const wordName = word.name;
            const wordCategory = WordHelper.getCategory(word) || '未分类';
            const definitionsCount = word.content.reduce(
                (total, part) => total + part.definitions.length,
                0,
            );
            const examplesCount = word.content.reduce(
                (total, part) =>
                    total +
                    part.definitions.reduce(
                        (defTotal, def) => defTotal + def.examples.length,
                        0,
                    ),
                0,
            );

            if (
                window.confirm(
                    `确定要删除单词"${wordName}"吗？\n\n` +
                        `单词信息：\n` +
                        `• 分类：${wordCategory}\n` +
                        `• 包含 ${definitionsCount} 个定义\n` +
                        `• 包含 ${examplesCount} 个例句\n\n` +
                        `此操作将永久删除该单词的所有信息，无法撤销。`,
                )
            ) {
                console.log(`🗑️ 删除单词操作开始:`, wordName);

                // 如果当前在详细视图中且正在查看要删除的单词，先返回列表
                if (
                    viewMode === 'detail' &&
                    currentWord &&
                    currentWord.name === wordName
                ) {
                    setViewMode('list');
                    setCurrentWord(null);
                    console.log(
                        '🔄 从详细视图返回列表视图（因为正在删除当前查看的单词）',
                    );
                }

                onDelete(wordName);
                console.log('✅ 删除单词请求已发送，等待界面更新');
            }
        },
        [onDelete, viewMode, currentWord],
    );
    return (
        <div
            style={{
                height: '100vh',
                overflow: 'auto',
                padding: 20,
                boxSizing: 'border-box',
            }}>
            {' '}
            {viewMode === 'list' && (
                <>
                    {/* iOS 风格标题栏 */}
                    <div
                        style={{
                            background:
                                'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                            padding: '32px 28px',
                            borderRadius: '20px',
                            marginBottom: '24px',
                            boxShadow: '0 4px 16px rgba(0, 122, 255, 0.2)',
                            fontFamily:
                                '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        }}>
                        <h1
                            style={{
                                margin: 0,
                                color: 'white',
                                fontSize: '34px',
                                fontWeight: '700',
                                letterSpacing: '-1px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}>
                            📚 单词管理
                        </h1>
                        <p
                            style={{
                                margin: '8px 0 0 0',
                                color: 'rgba(255,255,255,0.85)',
                                fontSize: '17px',
                                fontWeight: '400',
                            }}>
                            管理您的单词库，让学习更高效
                        </p>
                    </div>
                    {/* iOS 风格搜索和操作栏 */}
                    <div
                        style={{
                            background: '#ffffff',
                            padding: '20px',
                            borderRadius: '16px',
                            marginBottom: '24px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            border: 'none',
                            fontFamily:
                                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        }}>
                        <div
                            style={{
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                position: 'relative',
                                zIndex: 1,
                            }}>
                            {/* iOS 风格搜索框 */}
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="🔍 搜索单词、分类、标签..."
                                value={searchTerm}
                                onChange={(e) => {
                                    console.log(
                                        '🔍 搜索输入变化:',
                                        e.target.value,
                                    );
                                    setSearchTerm(e.target.value);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    backgroundColor: '#F2F2F7',
                                    transition:
                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    outline: 'none',
                                    pointerEvents: 'auto',
                                    userSelect: 'text',
                                    zIndex: 1,
                                    position: 'relative',
                                    color: '#1C1C1E',
                                    fontFamily:
                                        '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                }}
                                onFocus={(e) => {
                                    console.log('🎯 搜索框获得焦点');
                                    e.currentTarget.style.backgroundColor =
                                        '#E5E5EA';
                                }}
                                onBlur={(e) => {
                                    console.log('😔 搜索框失去焦点');
                                    e.currentTarget.style.backgroundColor =
                                        '#F2F2F7';
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (searchInputRef.current) {
                                        searchInputRef.current.focus();
                                    }
                                }}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                }}
                                tabIndex={0}
                            />

                            {searchTerm && (
                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        fontSize: '15px',
                                        color: '#8E8E93',
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                    }}>
                                    <input
                                        type="checkbox"
                                        checked={enableFullHighlight}
                                        onChange={(e) =>
                                            setEnableFullHighlight(
                                                e.target.checked,
                                            )
                                        }
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            cursor: 'pointer',
                                        }}
                                    />
                                    全部高亮
                                </label>
                            )}

                            {/* iOS 风格添加按钮 */}
                            <button
                                onClick={() => setShowAdd(true)}
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: '#007AFF',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    boxShadow:
                                        '0 2px 8px rgba(0, 122, 255, 0.25)',
                                    transition:
                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontFamily:
                                        '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        '#0051D5';
                                    e.currentTarget.style.transform =
                                        'translateY(-1px)';
                                    e.currentTarget.style.boxShadow =
                                        '0 4px 12px rgba(0, 122, 255, 0.35)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        '#007AFF';
                                    e.currentTarget.style.transform =
                                        'translateY(0)';
                                    e.currentTarget.style.boxShadow =
                                        '0 2px 8px rgba(0, 122, 255, 0.25)';
                                }}>
                                ➕ 添加单词
                            </button>

                            {/* iOS 风格筛选按钮 */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                style={{
                                    padding: '12px 16px',
                                    backgroundColor: showFilters
                                        ? '#E3F2FD'
                                        : '#F2F2F7',
                                    color: showFilters ? '#007AFF' : '#8E8E93',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    transition:
                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontFamily:
                                        '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                }}
                                onMouseEnter={(e) => {
                                    if (!showFilters) {
                                        e.currentTarget.style.backgroundColor =
                                            '#E5E5EA';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!showFilters) {
                                        e.currentTarget.style.backgroundColor =
                                            '#F2F2F7';
                                    }
                                }}>
                                🔍 筛选
                                {selectedTags.length +
                                    selectedCategories.length +
                                    selectedLevels.length +
                                    selectedPartsOfSpeech.length >
                                    0 && (
                                    <span
                                        style={{
                                            background: '#dc3545',
                                            color: 'white',
                                            borderRadius: '12px',
                                            padding: '2px 6px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            minWidth: '18px',
                                            textAlign: 'center',
                                        }}>
                                        {selectedTags.length +
                                            selectedCategories.length +
                                            selectedLevels.length +
                                            selectedPartsOfSpeech.length}
                                    </span>
                                )}{' '}
                            </button>
                        </div>
                    </div>
                    {/* iOS 风格展示控制栏 */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                            padding: '16px 20px',
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            fontFamily:
                                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        }}>
                        <div
                            style={{
                                display: 'flex',
                                gap: 16,
                                alignItems: 'center',
                            }}>
                            {/* iOS 风格视图模式切换 */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}>
                                <span
                                    style={{
                                        fontSize: '15px',
                                        color: '#8E8E93',
                                        fontWeight: '500',
                                    }}>
                                    视图:
                                </span>
                                <div
                                    style={{
                                        display: 'flex',
                                        backgroundColor: '#F2F2F7',
                                        borderRadius: '10px',
                                        padding: '3px',
                                        gap: '2px',
                                    }}>
                                    <button
                                        onClick={() => setDisplayMode('grid')}
                                        style={{
                                            padding: '8px 14px',
                                            fontSize: '14px',
                                            backgroundColor:
                                                displayMode === 'grid'
                                                    ? '#007AFF'
                                                    : 'transparent',
                                            color:
                                                displayMode === 'grid'
                                                    ? '#ffffff'
                                                    : '#8E8E93',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            transition:
                                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                            fontFamily:
                                                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                        }}>
                                        📊 网格
                                    </button>
                                    <button
                                        onClick={() => setDisplayMode('list')}
                                        style={{
                                            padding: '8px 14px',
                                            fontSize: '14px',
                                            backgroundColor:
                                                displayMode === 'list'
                                                    ? '#007AFF'
                                                    : 'transparent',
                                            color:
                                                displayMode === 'list'
                                                    ? '#ffffff'
                                                    : '#8E8E93',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            transition:
                                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                            fontFamily:
                                                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                        }}>
                                        📋 列表
                                    </button>
                                </div>
                            </div>

                            {/* iOS 风格排序选择 */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}>
                                <span
                                    style={{
                                        fontSize: '15px',
                                        color: '#8E8E93',
                                        fontWeight: '500',
                                    }}>
                                    排序:
                                </span>
                                <select
                                    value={sortBy}
                                    onChange={(e) =>
                                        setSortBy(e.target.value as any)
                                    }
                                    style={{
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        border: 'none',
                                        borderRadius: '10px',
                                        backgroundColor: '#F2F2F7',
                                        color: '#1C1C1E',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        fontFamily:
                                            '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                    }}>
                                    <option value="name">名称</option>
                                    <option value="category">分类</option>
                                    <option value="queryCount">查询次数</option>
                                    <option value="date">时间</option>
                                </select>
                                <button
                                    onClick={() =>
                                        setSortOrder(
                                            sortOrder === 'asc'
                                                ? 'desc'
                                                : 'asc',
                                        )
                                    }
                                    style={{
                                        padding: '8px 12px',
                                        fontSize: '16px',
                                        backgroundColor: '#F2F2F7',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        color: '#007AFF',
                                        fontWeight: '600',
                                        transition:
                                            'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            '#E5E5EA';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            '#F2F2F7';
                                    }}>
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>

                            {/* iOS 风格每页显示数量 */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}>
                                <span
                                    style={{
                                        fontSize: '15px',
                                        color: '#8E8E93',
                                        fontWeight: '500',
                                    }}>
                                    每页:
                                </span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    style={{
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        border: 'none',
                                        borderRadius: '10px',
                                        backgroundColor: '#F2F2F7',
                                        color: '#1C1C1E',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        fontFamily:
                                            '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                    }}>
                                    <option value={6}>6</option>
                                    <option value={12}>12</option>
                                    <option value={24}>24</option>
                                    <option value={48}>48</option>
                                </select>
                            </div>
                        </div>

                        {/* iOS 风格结果统计 */}
                        <div
                            style={{
                                fontSize: '15px',
                                color: '#8E8E93',
                                fontWeight: '500',
                            }}>
                            显示{' '}
                            {Math.min(
                                (currentPage - 1) * itemsPerPage + 1,
                                sortedWords.length,
                            )}
                            -
                            {Math.min(
                                currentPage * itemsPerPage,
                                sortedWords.length,
                            )}{' '}
                            / 共 {sortedWords.length} 个
                        </div>
                    </div>
                    {/* iOS 风格过滤器面板 */}
                    {showFilters && (
                        <div
                            style={{
                                marginBottom: 20,
                                padding: 20,
                                border: 'none',
                                borderRadius: 16,
                                backgroundColor: '#ffffff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                fontFamily:
                                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            }}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 20,
                                }}>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '20px',
                                        fontWeight: '600',
                                        color: '#1C1C1E',
                                    }}>
                                    过滤选项
                                </h3>
                                <button
                                    onClick={clearAllFilters}
                                    style={{
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        backgroundColor: '#F2F2F7',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        color: '#FF3B30',
                                        fontWeight: '600',
                                        transition:
                                            'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            '#FFEBEE';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            '#F2F2F7';
                                    }}>
                                    清除筛选
                                </button>
                            </div>

                            {/* 分类过滤 */}
                            {allCategories.length > 0 && (
                                <div style={{ marginBottom: 20 }}>
                                    <div
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            marginBottom: 10,
                                            color: '#48484A',
                                        }}>
                                        分类筛选:
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 8,
                                        }}>
                                        {allCategories.map((category) => (
                                            <button
                                                key={category}
                                                onClick={() =>
                                                    handleCategoryToggle(
                                                        category,
                                                    )
                                                }
                                                style={{
                                                    padding: '8px 16px',
                                                    fontSize: '14px',
                                                    backgroundColor:
                                                        selectedCategories.includes(
                                                            category,
                                                        )
                                                            ? '#007AFF'
                                                            : '#F2F2F7',
                                                    color: selectedCategories.includes(
                                                        category,
                                                    )
                                                        ? '#fff'
                                                        : '#1C1C1E',
                                                    border: 'none',
                                                    borderRadius: '14px',
                                                    cursor: 'pointer',
                                                    fontWeight: '500',
                                                    transition:
                                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                }}>
                                                {category}
                                                {selectedCategories.includes(
                                                    category,
                                                ) && ' ✓'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 标签过滤 */}
                            {allTags.length > 0 && (
                                <div style={{ marginBottom: 20 }}>
                                    <div
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            marginBottom: 10,
                                            color: '#48484A',
                                        }}>
                                        标签筛选:
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 8,
                                        }}>
                                        {allTags.map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() =>
                                                    handleTagToggle(tag)
                                                }
                                                style={{
                                                    padding: '8px 16px',
                                                    fontSize: '14px',
                                                    backgroundColor:
                                                        selectedTags.includes(
                                                            tag,
                                                        )
                                                            ? '#34C759'
                                                            : '#F2F2F7',
                                                    color: selectedTags.includes(
                                                        tag,
                                                    )
                                                        ? '#fff'
                                                        : '#1C1C1E',
                                                    border: 'none',
                                                    borderRadius: '14px',
                                                    cursor: 'pointer',
                                                    fontWeight: '500',
                                                    transition:
                                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                }}>
                                                {tag}
                                                {selectedTags.includes(tag) &&
                                                    ' ✓'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 等级过滤 */}
                            {allLevels.length > 0 && (
                                <div style={{ marginBottom: 20 }}>
                                    <div
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            marginBottom: 10,
                                            color: '#48484A',
                                        }}>
                                        等级筛选:
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 8,
                                        }}>
                                        {allLevels.map((level) => (
                                            <button
                                                key={level}
                                                onClick={() =>
                                                    handleLevelToggle(level)
                                                }
                                                style={{
                                                    padding: '8px 16px',
                                                    fontSize: '14px',
                                                    backgroundColor:
                                                        selectedLevels.includes(
                                                            level,
                                                        )
                                                            ? '#FF9500'
                                                            : '#F2F2F7',
                                                    color: selectedLevels.includes(
                                                        level,
                                                    )
                                                        ? '#fff'
                                                        : '#1C1C1E',
                                                    border: 'none',
                                                    borderRadius: '14px',
                                                    cursor: 'pointer',
                                                    fontWeight: '500',
                                                    transition:
                                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                }}>
                                                {level}
                                                {selectedLevels.includes(
                                                    level,
                                                ) && ' ✓'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 词性过滤 */}
                            {allPartsOfSpeech.length > 0 && (
                                <div>
                                    <div
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            marginBottom: 10,
                                            color: '#48484A',
                                        }}>
                                        词性筛选:
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 8,
                                        }}>
                                        {allPartsOfSpeech.map(
                                            (partsOfSpeech) => (
                                                <button
                                                    key={partsOfSpeech}
                                                    onClick={() =>
                                                        handlePartsOfSpeechToggle(
                                                            partsOfSpeech,
                                                        )
                                                    }
                                                    style={{
                                                        padding: '8px 16px',
                                                        fontSize: '14px',
                                                        backgroundColor:
                                                            selectedPartsOfSpeech.includes(
                                                                partsOfSpeech,
                                                            )
                                                                ? '#AF52DE'
                                                                : '#F2F2F7',
                                                        color: selectedPartsOfSpeech.includes(
                                                            partsOfSpeech,
                                                        )
                                                            ? '#fff'
                                                            : '#1C1C1E',
                                                        border: 'none',
                                                        borderRadius: '14px',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        transition:
                                                            'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                    }}>
                                                    {partsOfSpeech}
                                                    {selectedPartsOfSpeech.includes(
                                                        partsOfSpeech,
                                                    ) && ' ✓'}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}{' '}
                    <h2>
                        现有单词
                        {(searchTerm ||
                            selectedTags.length > 0 ||
                            selectedCategories.length > 0 ||
                            selectedLevels.length > 0 ||
                            selectedPartsOfSpeech.length > 0) && (
                            <span
                                style={{
                                    fontSize: '0.7em',
                                    color: '#666',
                                    marginLeft: '10px',
                                }}>
                                (找到 {sortedWords.length} / {words.length}{' '}
                                个单词
                                {selectedTags.length > 0 &&
                                    ` | 标签: ${selectedTags.join(', ')}`}
                                {selectedCategories.length > 0 &&
                                    ` | 分类: ${selectedCategories.join(', ')}`}
                                {selectedLevels.length > 0 &&
                                    ` | 等级: ${selectedLevels.join(', ')}`}
                                {selectedPartsOfSpeech.length > 0 &&
                                    ` | 词性: ${selectedPartsOfSpeech.join(
                                        ', ',
                                    )}`}
                                )
                            </span>
                        )}
                    </h2>{' '}
                    {/* 列表视图表头 */}
                    {displayMode === 'list' && paginatedWords.length > 0 && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 15px',
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px 8px 0 0',
                                fontWeight: '600',
                                fontSize: '13px',
                                color: '#495057',
                                borderBottom: '2px solid #dee2e6',
                            }}>
                            <div style={{ flex: '0 0 200px' }}>📝 单词名称</div>
                            <div style={{ flex: '0 0 180px' }}>🔊 发音</div>
                            <div style={{ flex: '0 0 120px' }}>📂 分类</div>
                            <div style={{ flex: '1' }}>🏷️ 标签</div>
                            <div
                                style={{
                                    flex: '0 0 80px',
                                    textAlign: 'center',
                                }}>
                                🔢 查询次数
                            </div>
                            <div
                                style={{
                                    flex: '0 0 60px',
                                    textAlign: 'center',
                                }}>
                                📊 等级
                            </div>
                            <div
                                style={{
                                    flex: '0 0 120px',
                                    textAlign: 'center',
                                }}>
                                ⚙️ 操作
                            </div>
                        </div>
                    )}
                    {/* 单词展示区域 */}
                    <div
                        style={{
                            display: displayMode === 'grid' ? 'grid' : 'block',
                            gap: displayMode === 'grid' ? 15 : 0,
                            gridTemplateColumns:
                                displayMode === 'grid'
                                    ? 'repeat(auto-fill, minmax(300px, 1fr))'
                                    : 'none',
                            marginTop:
                                displayMode === 'list' &&
                                paginatedWords.length > 0
                                    ? 0
                                    : 20,
                        }}>
                        {paginatedWords.length === 0 ? (
                            <div
                                style={{
                                    textAlign: 'center',
                                    color: '#666',
                                    padding: '40px',
                                    border: '1px dashed #ccc',
                                    borderRadius: '8px',
                                    gridColumn: '1 / -1',
                                }}>
                                {sortedWords.length === 0
                                    ? searchTerm ||
                                      selectedTags.length > 0 ||
                                      selectedCategories.length > 0
                                        ? '没有找到匹配的单词'
                                        : '暂无单词，点击上方按钮添加'
                                    : '没有更多单词了，请返回上一页'}
                            </div>
                        ) : (
                            paginatedWords.map((word, index) =>
                                displayMode === 'grid' ? (
                                    <WordCard
                                        key={word.name}
                                        word={word}
                                        searchTerm={searchTerm}
                                        onEdit={() => handleEditClick(word)}
                                        onDelete={() => handleDeleteWord(word)}
                                        onViewDetail={() =>
                                            handleViewWord(word)
                                        }
                                        onJumpToSource={() =>
                                            onJumpToSource(getWordId(word))
                                        }
                                        enableFullHighlight={
                                            enableFullHighlight
                                        }
                                    />
                                ) : (
                                    <WordListItem
                                        key={word.name}
                                        word={word}
                                        searchTerm={searchTerm}
                                        onEdit={() => handleEditClick(word)}
                                        onDelete={() => handleDeleteWord(word)}
                                        onViewDetail={() =>
                                            handleViewWord(word)
                                        }
                                        onJumpToSource={() =>
                                            onJumpToSource(getWordId(word))
                                        }
                                        enableFullHighlight={
                                            enableFullHighlight
                                        }
                                        isLast={
                                            index === paginatedWords.length - 1
                                        }
                                    />
                                ),
                            )
                        )}
                    </div>{' '}
                    {/* 分页控件 - iOS 风格 */}
                    {totalPages > 1 && (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 12,
                                marginTop: 24,
                                padding: '20px 0',
                            }}>
                            <button
                                onClick={() =>
                                    setCurrentPage(Math.max(1, currentPage - 1))
                                }
                                disabled={currentPage === 1}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    backgroundColor:
                                        currentPage === 1
                                            ? '#F2F2F7'
                                            : '#007AFF',
                                    color:
                                        currentPage === 1
                                            ? '#C7C7CC'
                                            : '#ffffff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor:
                                        currentPage === 1
                                            ? 'not-allowed'
                                            : 'pointer',
                                    transition:
                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    boxShadow:
                                        currentPage === 1
                                            ? 'none'
                                            : '0 2px 8px rgba(0, 122, 255, 0.25)',
                                    fontFamily:
                                        '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                    letterSpacing: '-0.2px',
                                }}
                                onMouseEnter={(e) => {
                                    if (currentPage !== 1) {
                                        e.currentTarget.style.transform =
                                            'scale(0.98)';
                                        e.currentTarget.style.boxShadow =
                                            '0 4px 12px rgba(0, 122, 255, 0.35)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (currentPage !== 1) {
                                        e.currentTarget.style.transform =
                                            'scale(1)';
                                        e.currentTarget.style.boxShadow =
                                            '0 2px 8px rgba(0, 122, 255, 0.25)';
                                    }
                                }}>
                                ← 上一页
                            </button>

                            <div style={{ display: 'flex', gap: 5 }}>
                                {[...Array(totalPages)].map((_, index) => {
                                    const page = index + 1;
                                    const isCurrentPage = page === currentPage;
                                    const showPage =
                                        Math.abs(page - currentPage) <= 2 ||
                                        page === 1 ||
                                        page === totalPages;

                                    if (!showPage) {
                                        if (
                                            page === currentPage - 3 ||
                                            page === currentPage + 3
                                        ) {
                                            return (
                                                <span
                                                    key={page}
                                                    style={{
                                                        padding: '8px 4px',
                                                        color: '#6c757d',
                                                    }}>
                                                    ...
                                                </span>
                                            );
                                        }
                                        return null;
                                    }

                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            style={{
                                                padding: '8px 12px',
                                                fontSize: '14px',
                                                backgroundColor: isCurrentPage
                                                    ? '#007acc'
                                                    : '#fff',
                                                color: isCurrentPage
                                                    ? '#fff'
                                                    : '#495057',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                minWidth: '40px',
                                            }}>
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() =>
                                    setCurrentPage(
                                        Math.min(totalPages, currentPage + 1),
                                    )
                                }
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '8px 12px',
                                    fontSize: '14px',
                                    backgroundColor:
                                        currentPage === totalPages
                                            ? '#f8f9fa'
                                            : '#fff',
                                    color:
                                        currentPage === totalPages
                                            ? '#6c757d'
                                            : '#495057',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '4px',
                                    cursor:
                                        currentPage === totalPages
                                            ? 'not-allowed'
                                            : 'pointer',
                                }}>
                                下一页 →
                            </button>
                        </div>
                    )}
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
                                    {WordHelper.getTags(currentWord).join(', ')}
                                </p>
                                <p>
                                    <strong>词性:</strong>{' '}
                                    {currentWord.partsOfSpeech}
                                </p>{' '}
                                <p>
                                    <strong>查询次数:</strong>{' '}
                                    {getWordQueryCount(currentWord)}
                                </p>
                                {/* 显示备注信息 */}
                                {currentWord.notes &&
                                    currentWord.notes.trim() && (
                                        <p
                                            style={{
                                                fontStyle: 'italic',
                                                backgroundColor: '#fff8e1',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                borderLeft: '4px solid #ffb300',
                                                marginTop: '10px',
                                            }}>
                                            <strong>💡 备注:</strong>{' '}
                                            {currentWord.notes}
                                        </p>
                                    )}
                            </div>
                        </div>{' '}
                        <div style={{ marginTop: 30 }}>
                            <h3 style={{ marginBottom: 15, color: '#555' }}>
                                详细内容
                            </h3>
                            {currentWord.content &&
                            currentWord.content.length > 0 ? (
                                (() => {
                                    // 更智能的内容过滤和显示逻辑
                                    const validParts =
                                        currentWord.content.filter((part) => {
                                            // 有词性或有有效定义的部分都保留
                                            return (
                                                (part.type &&
                                                    part.type.trim() !== '') ||
                                                (part.definitions &&
                                                    part.definitions.some(
                                                        (def) =>
                                                            def.definition &&
                                                            def.definition.trim() !==
                                                                '',
                                                    ))
                                            );
                                        });

                                    if (validParts.length === 0) {
                                        return (
                                            <div
                                                style={{
                                                    padding: '20px',
                                                    textAlign: 'center',
                                                    color: '#999',
                                                    fontSize: '14px',
                                                    backgroundColor: 'white',
                                                    border: '1px dashed #ccc',
                                                    borderRadius: '6px',
                                                }}>
                                                📝
                                                暂无有效内容，点击"编辑单词"按钮添加词性、定义和例句
                                            </div>
                                        );
                                    }

                                    return validParts.map((part, partIndex) => (
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
                                                {part.type &&
                                                part.type.trim() !== ''
                                                    ? part.type
                                                    : '其他'}
                                            </h4>

                                            {part.definitions &&
                                            part.definitions.length > 0 ? (
                                                part.definitions.map(
                                                    (def, defIndex) => {
                                                        const hasDefinition =
                                                            def.definition &&
                                                            def.definition.trim() !==
                                                                '';
                                                        const validExamples =
                                                            def.examples
                                                                ? def.examples.filter(
                                                                      (ex) =>
                                                                          ex.text &&
                                                                          ex.text.trim() !==
                                                                              '',
                                                                  )
                                                                : [];

                                                        // 如果既没有定义也没有例句，跳过
                                                        if (
                                                            !hasDefinition &&
                                                            validExamples.length ===
                                                                0
                                                        ) {
                                                            return null;
                                                        }

                                                        return (
                                                            <div
                                                                key={defIndex}
                                                                style={{
                                                                    marginBottom: 15,
                                                                    paddingLeft: 15,
                                                                    borderLeft:
                                                                        '3px solid #e0e0e0',
                                                                }}>
                                                                <div
                                                                    style={{
                                                                        marginBottom: 8,
                                                                        fontSize:
                                                                            '16px',
                                                                    }}>
                                                                    <strong>
                                                                        定义:
                                                                    </strong>{' '}
                                                                    {hasDefinition ? (
                                                                        def.definition
                                                                    ) : (
                                                                        <span
                                                                            style={{
                                                                                color: '#999',
                                                                                fontStyle:
                                                                                    'italic',
                                                                            }}>
                                                                            暂无定义
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {validExamples.length >
                                                                    0 && (
                                                                    <div>
                                                                        <strong>
                                                                            例句:
                                                                        </strong>
                                                                        {validExamples.map(
                                                                            (
                                                                                example,
                                                                                exIndex,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        exIndex
                                                                                    }
                                                                                    style={{
                                                                                        marginLeft: 20,
                                                                                        marginTop: 5,
                                                                                        fontStyle:
                                                                                            'italic',
                                                                                        color: '#666',
                                                                                        fontSize:
                                                                                            '14px',
                                                                                    }}>
                                                                                    •{' '}
                                                                                    {
                                                                                        example.text
                                                                                    }
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    },
                                                )
                                            ) : (
                                                <div
                                                    style={{
                                                        paddingLeft: 15,
                                                        borderLeft:
                                                            '3px solid #e0e0e0',
                                                        color: '#999',
                                                        fontStyle: 'italic',
                                                        fontSize: '14px',
                                                    }}>
                                                    暂无定义和例句
                                                </div>
                                            )}
                                        </div>
                                    ));
                                })()
                            ) : (
                                <div
                                    style={{
                                        padding: '20px',
                                        textAlign: 'center',
                                        color: '#999',
                                        fontSize: '14px',
                                        backgroundColor: 'white',
                                        border: '1px dashed #ccc',
                                        borderRadius: '6px',
                                    }}>
                                    📝
                                    暂无详细内容，点击"编辑单词"按钮添加词性、定义和例句
                                </div>
                            )}{' '}
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
                        <h3>{editTarget ? '编辑单词' : '添加单词'}</h3>{' '}
                        <div style={{ marginBottom: 10 }}>
                            <label>单词名称:</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => {
                                    setForm({ ...form, name: e.target.value });
                                    // 输入时清除错误消息
                                    if (errorMessage) {
                                        setErrorMessage('');
                                    }
                                }}
                                style={{
                                    marginLeft: 10,
                                    padding: 5,
                                    width: '200px',
                                    border: errorMessage
                                        ? '2px solid #ff4444'
                                        : '1px solid #ccc',
                                }}
                            />
                            {errorMessage && (
                                <div
                                    style={{
                                        color: '#ff4444',
                                        fontSize: '12px',
                                        marginTop: 5,
                                        marginLeft: 10,
                                        fontWeight: 'bold',
                                    }}>
                                    ⚠️ {errorMessage}
                                </div>
                            )}
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
                            />{' '}
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <label>分类:</label>
                            <div
                                style={{
                                    marginLeft: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}>
                                <select
                                    value={
                                        allCategories.includes(
                                            WordHelper.getCategory(form),
                                        )
                                            ? WordHelper.getCategory(form)
                                            : ''
                                    }
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            const newForm = { ...form };
                                            WordHelper.setCategory(
                                                newForm,
                                                e.target.value,
                                            );
                                            setForm(newForm);
                                        }
                                    }}
                                    style={{
                                        padding: 5,
                                        width: '150px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                    }}>
                                    <option value="">选择已有分类</option>
                                    {allCategories.map((category) => (
                                        <option
                                            key={category}
                                            value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                <span
                                    style={{ color: '#666', fontSize: '12px' }}>
                                    或
                                </span>
                                <input
                                    type="text"
                                    placeholder="新建分类"
                                    value={WordHelper.getCategory(form)}
                                    onChange={(e) => {
                                        const newForm = { ...form };
                                        WordHelper.setCategory(
                                            newForm,
                                            e.target.value,
                                        );
                                        setForm(newForm);
                                    }}
                                    style={{
                                        padding: 5,
                                        width: '150px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label>标签:</label>
                            <div style={{ marginLeft: 10 }}>
                                {/* 已选标签显示区域 */}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 6,
                                        minHeight: 40,
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '6px',
                                        backgroundColor: '#f9f9f9',
                                        marginBottom: 10,
                                    }}>
                                    {WordHelper.getTags(form).length === 0 ? (
                                        <span
                                            style={{
                                                color: '#999',
                                                fontSize: '14px',
                                                padding: '4px',
                                            }}>
                                            请选择或添加标签
                                        </span>
                                    ) : (
                                        WordHelper.getTags(form).map(
                                            (tag, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        padding: '4px 8px',
                                                        backgroundColor:
                                                            '#e3f2fd',
                                                        color: '#1976d2',
                                                        borderRadius: 12,
                                                        fontSize: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 4,
                                                    }}>
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newTags =
                                                                WordHelper.getTags(
                                                                    form,
                                                                ).filter(
                                                                    (_, i) =>
                                                                        i !==
                                                                        index,
                                                                );
                                                            const newForm = {
                                                                ...form,
                                                            };
                                                            WordHelper.setTags(
                                                                newForm,
                                                                newTags,
                                                            );
                                                            setForm(newForm);
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#1976d2',
                                                            cursor: 'pointer',
                                                            padding: '0 2px',
                                                            fontSize: '14px',
                                                            lineHeight: 1,
                                                        }}>
                                                        ×
                                                    </button>
                                                </span>
                                            ),
                                        )
                                    )}
                                </div>

                                {/* 已有标签选择区域 */}
                                {allTags.length > 0 && (
                                    <div style={{ marginBottom: 12 }}>
                                        <div
                                            style={{
                                                fontSize: '13px',
                                                fontWeight: 'bold',
                                                color: '#555',
                                                marginBottom: 6,
                                            }}>
                                            📋 从已有标签中选择:
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 4,
                                                maxHeight: '120px',
                                                overflowY: 'auto',
                                                padding: '4px',
                                            }}>
                                            {allTags
                                                .filter(
                                                    (tag) =>
                                                        !WordHelper.getTags(
                                                            form,
                                                        ).includes(tag),
                                                )
                                                .map((tag) => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => {
                                                            if (
                                                                !WordHelper.getTags(
                                                                    form,
                                                                ).includes(tag)
                                                            ) {
                                                                const newForm =
                                                                    { ...form };
                                                                WordHelper.setTags(
                                                                    newForm,
                                                                    [
                                                                        ...WordHelper.getTags(
                                                                            form,
                                                                        ),
                                                                        tag,
                                                                    ],
                                                                );
                                                                setForm(
                                                                    newForm,
                                                                );
                                                            }
                                                        }}
                                                        style={{
                                                            padding: '4px 8px',
                                                            fontSize: '12px',
                                                            backgroundColor:
                                                                '#f8f9fa',
                                                            border: '1px solid #dee2e6',
                                                            borderRadius:
                                                                '12px',
                                                            cursor: 'pointer',
                                                            transition:
                                                                'all 0.2s',
                                                            color: '#495057',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor =
                                                                '#28a745';
                                                            e.currentTarget.style.color =
                                                                '#ffffff';
                                                            e.currentTarget.style.borderColor =
                                                                '#28a745';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor =
                                                                '#f8f9fa';
                                                            e.currentTarget.style.color =
                                                                '#495057';
                                                            e.currentTarget.style.borderColor =
                                                                '#dee2e6';
                                                        }}>
                                                        + {tag}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* 新建标签输入区域 */}
                                <div>
                                    <div
                                        style={{
                                            fontSize: '13px',
                                            fontWeight: 'bold',
                                            color: '#555',
                                            marginBottom: 6,
                                        }}>
                                        ✨ 添加新标签:
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: 8,
                                            alignItems: 'center',
                                        }}>
                                        <input
                                            type="text"
                                            placeholder="输入新标签名称"
                                            value={newTagInput || ''}
                                            onChange={(e) =>
                                                setNewTagInput(e.target.value)
                                            }
                                            onKeyPress={(e) => {
                                                if (
                                                    newTagInput?.trim() &&
                                                    e.key === 'Enter'
                                                ) {
                                                    const trimmedTag =
                                                        newTagInput.trim();
                                                    if (
                                                        !WordHelper.getTags(
                                                            form,
                                                        ).includes(trimmedTag)
                                                    ) {
                                                        const newForm = {
                                                            ...form,
                                                        };
                                                        WordHelper.setTags(
                                                            newForm,
                                                            [
                                                                ...WordHelper.getTags(
                                                                    form,
                                                                ),
                                                                trimmedTag,
                                                            ],
                                                        );
                                                        setForm(newForm);
                                                        setNewTagInput('');
                                                    }
                                                }
                                            }}
                                            style={{
                                                padding: '6px 10px',
                                                width: '180px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '13px',
                                            }}
                                        />{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (newTagInput?.trim()) {
                                                    const trimmedTag =
                                                        newTagInput.trim();
                                                    if (
                                                        !WordHelper.getTags(
                                                            form,
                                                        ).includes(trimmedTag)
                                                    ) {
                                                        const newForm = {
                                                            ...form,
                                                        };
                                                        WordHelper.setTags(
                                                            newForm,
                                                            [
                                                                ...WordHelper.getTags(
                                                                    form,
                                                                ),
                                                                trimmedTag,
                                                            ],
                                                        );
                                                        setForm(newForm);
                                                        setNewTagInput('');
                                                    }
                                                }
                                            }}
                                            style={{
                                                padding: '6px 12px',
                                                fontSize: '12px',
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    '#218838';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    '#28a745';
                                            }}>
                                            添加标签
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <label>等级:</label>
                            <select
                                value={WordHelper.getLevel(form)}
                                onChange={(e) => {
                                    const newForm = { ...form };
                                    WordHelper.setLevel(
                                        newForm,
                                        e.target.value,
                                    );
                                    setForm(newForm);
                                }}
                                style={{ marginLeft: 10, padding: 5 }}>
                                <option value="">请选择</option>
                                <option value="初级">初级</option>
                                <option value="中级">中级</option>
                                <option value="高级">高级</option>
                            </select>
                        </div>{' '}
                        <div style={{ marginBottom: 10 }}>
                            <label>词性概述:</label>
                            <div style={{ marginLeft: 10, flex: 1 }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 8,
                                        marginBottom: 8,
                                        minHeight: 32,
                                        padding: 5,
                                        border: '1px solid #ccc',
                                        borderRadius: 4,
                                        backgroundColor: '#f9f9f9',
                                    }}>
                                    {form.partsOfSpeech
                                        .split(',')
                                        .filter((p) => p.trim())
                                        .map((selectedType, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#e3f2fd',
                                                    color: '#1976d2',
                                                    borderRadius: 12,
                                                    fontSize: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                }}>
                                                {selectedType.trim()}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const types =
                                                            form.partsOfSpeech
                                                                .split(',')
                                                                .map((t) =>
                                                                    t.trim(),
                                                                )
                                                                .filter(
                                                                    (t) =>
                                                                        t !==
                                                                        selectedType.trim(),
                                                                );
                                                        setForm({
                                                            ...form,
                                                            partsOfSpeech:
                                                                types.join(','),
                                                        });
                                                    }}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#1976d2',
                                                        cursor: 'pointer',
                                                        padding: '0 2px',
                                                        fontSize: '14px',
                                                        lineHeight: 1,
                                                    }}>
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    {form.partsOfSpeech
                                        .split(',')
                                        .filter((p) => p.trim()).length ===
                                        0 && (
                                        <span
                                            style={{
                                                color: '#999',
                                                fontSize: '14px',
                                                padding: '4px',
                                            }}>
                                            点击下方选项添加词性
                                        </span>
                                    )}
                                </div>
                                {/* 分组显示词性选项 */}
                                {Object.entries(PARTS_OF_SPEECH_GROUPS).map(
                                    ([groupName, options]) => (
                                        <div
                                            key={groupName}
                                            style={{ marginBottom: 12 }}>
                                            <div
                                                style={{
                                                    fontSize: '13px',
                                                    fontWeight: 'bold',
                                                    color: '#555',
                                                    marginBottom: 6,
                                                    padding: '2px 0',
                                                }}>
                                                {groupName}:
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: 6,
                                                    paddingLeft: 12,
                                                }}>
                                                {options.map((option) => {
                                                    const isSelected =
                                                        form.partsOfSpeech
                                                            .split(',')
                                                            .map((t) =>
                                                                t.trim(),
                                                            )
                                                            .includes(option);
                                                    return (
                                                        <button
                                                            key={option}
                                                            type="button"
                                                            onClick={() => {
                                                                if (
                                                                    isSelected
                                                                ) {
                                                                    // 移除选中的词性
                                                                    const types =
                                                                        form.partsOfSpeech
                                                                            .split(
                                                                                ',',
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    t,
                                                                                ) =>
                                                                                    t.trim(),
                                                                            )
                                                                            .filter(
                                                                                (
                                                                                    t,
                                                                                ) =>
                                                                                    t !==
                                                                                    option,
                                                                            );
                                                                    setForm({
                                                                        ...form,
                                                                        partsOfSpeech:
                                                                            types.join(
                                                                                ',',
                                                                            ),
                                                                    });
                                                                } else {
                                                                    // 添加词性
                                                                    const currentTypes =
                                                                        form.partsOfSpeech
                                                                            .split(
                                                                                ',',
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    t,
                                                                                ) =>
                                                                                    t.trim(),
                                                                            )
                                                                            .filter(
                                                                                (
                                                                                    t,
                                                                                ) =>
                                                                                    t !==
                                                                                    '',
                                                                            );
                                                                    currentTypes.push(
                                                                        option,
                                                                    );
                                                                    setForm({
                                                                        ...form,
                                                                        partsOfSpeech:
                                                                            currentTypes.join(
                                                                                ',',
                                                                            ),
                                                                    });
                                                                }
                                                            }}
                                                            style={{
                                                                padding:
                                                                    '5px 10px',
                                                                fontSize:
                                                                    '12px',
                                                                backgroundColor:
                                                                    isSelected
                                                                        ? '#1976d2'
                                                                        : '#fff',
                                                                color: isSelected
                                                                    ? '#fff'
                                                                    : '#333',
                                                                border: '1px solid #ccc',
                                                                borderRadius:
                                                                    '12px',
                                                                cursor: 'pointer',
                                                                transition:
                                                                    'all 0.2s',
                                                                fontWeight:
                                                                    isSelected
                                                                        ? '500'
                                                                        : 'normal',
                                                            }}>
                                                            {option}{' '}
                                                            {isSelected && '✓'}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ),
                                )}{' '}
                            </div>
                        </div>
                        {/* 备注字段 */}
                        <div style={{ marginBottom: 10 }}>
                            <label>备注 (记忆技巧、标注等):</label>
                            <textarea
                                value={form.notes}
                                onChange={(e) =>
                                    setForm({ ...form, notes: e.target.value })
                                }
                                placeholder="在此输入记忆技巧、学习笔记或其他备注信息..."
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ccc',
                                    borderRadius: 4,
                                    fontSize: '14px',
                                    resize: 'vertical',
                                    minHeight: '60px',
                                    maxHeight: '120px',
                                    backgroundColor: '#fafafa',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>
                        <h4>详细内容</h4>{' '}
                        {form.content.map((part, partIndex) => (
                            <div
                                key={partIndex}
                                style={{
                                    margin: '10px 0',
                                    padding: 10,
                                    border: '1px solid #ddd',
                                    borderRadius: 4,
                                }}>
                                <div
                                    style={{
                                        marginBottom: 10,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                    }}>
                                    {' '}
                                    <label>词性:</label>{' '}
                                    <select
                                        value={part.type}
                                        onChange={(e) => {
                                            const content = [...form.content];
                                            content[partIndex].type =
                                                e.target.value;
                                            setForm({ ...form, content });
                                        }}
                                        style={{
                                            marginLeft: 10,
                                            padding: 5,
                                            flex: 1,
                                            border: '1px solid #ccc',
                                            borderRadius: 4,
                                        }}>
                                        <option value="">请选择词性</option>
                                        {Object.entries(
                                            PARTS_OF_SPEECH_GROUPS,
                                        ).map(([groupName, options]) => (
                                            <optgroup
                                                key={groupName}
                                                label={groupName}>
                                                {options.map((option) => (
                                                    <option
                                                        key={option}
                                                        value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                    {form.content.length > 1 && (
                                        <button
                                            onClick={() =>
                                                handleRemovePart(partIndex)
                                            }
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: '12px',
                                                backgroundColor: '#ffe6e6',
                                                border: '1px solid #ffb3b3',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                color: '#cc0000',
                                            }}
                                            title="删除该词性">
                                            删除词性
                                        </button>
                                    )}
                                </div>{' '}
                                {part.definitions.map((def, defIndex) => (
                                    <div
                                        key={defIndex}
                                        style={{
                                            margin: '10px 0',
                                            paddingLeft: 20,
                                            borderLeft: '2px solid #eee',
                                        }}>
                                        <div
                                            style={{
                                                marginBottom: 5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                            }}>
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
                                                    flex: 1,
                                                }}
                                            />
                                            {part.definitions.length > 1 && (
                                                <button
                                                    onClick={() =>
                                                        handleRemoveDefinition(
                                                            partIndex,
                                                            defIndex,
                                                        )
                                                    }
                                                    style={{
                                                        padding: '2px 6px',
                                                        fontSize: '11px',
                                                        backgroundColor:
                                                            '#ffe6e6',
                                                        border: '1px solid #ffb3b3',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        color: '#cc0000',
                                                    }}
                                                    title="删除该定义">
                                                    删除
                                                </button>
                                            )}
                                        </div>{' '}
                                        {def.examples.map(
                                            (example, exIndex) => (
                                                <div
                                                    key={exIndex}
                                                    style={{
                                                        margin: '5px 0',
                                                        paddingLeft: 20,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 10,
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
                                                            flex: 1,
                                                        }}
                                                    />
                                                    {def.examples.length >
                                                        0 && (
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveExample(
                                                                    partIndex,
                                                                    defIndex,
                                                                    exIndex,
                                                                )
                                                            }
                                                            style={{
                                                                padding:
                                                                    '1px 4px',
                                                                fontSize:
                                                                    '10px',
                                                                backgroundColor:
                                                                    '#ffe6e6',
                                                                border: '1px solid #ffb3b3',
                                                                borderRadius:
                                                                    '3px',
                                                                cursor: 'pointer',
                                                                color: '#cc0000',
                                                            }}
                                                            title="删除该例句">
                                                            ×
                                                        </button>
                                                    )}
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
                            </button>{' '}
                            <button
                                onClick={() => {
                                    setShowAdd(false);
                                    setEditTarget(null);
                                    setErrorMessage(''); // 清除错误消息
                                    setNewTagInput(''); // 清除新标签输入
                                    setForm(createEmptyWord());
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

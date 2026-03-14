// @ts-ignore
import React, { useState, useMemo, useCallback } from 'react';
import { Word, WordHelper } from './MarkdownWordStorage';

// 辅助函数来处理新的Word接口
const createEmptyWord = (): Word => ({
    metadata: {
        id: '',
        queryCount: 0,
        createBy: 'user',
        lastUpdate: new Date().toISOString(),
        // 间隔学习默认值
        srsLevel: 0,
        reviewCount: 0,
        correctCount: 0,
        ease: 2.5,
        interval: 1,
    },
    name: '',
    pronunciation: '',
    vocabulary: '',
    category: '',
    tags: [],
    level: '',
    partsOfSpeech: '',
    notes: '',
    content: [
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
});

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
    onEdit: (word: Word, originalWord?: Word) => void;
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

// 缩略卡片组件
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
                    border: '1px solid rgba(0,0,0,0.05)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(0,0,0,0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor =
                        'rgba(0, 102, 204, 0.2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                        '0 2px 4px rgba(0,0,0,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
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
                    </h3>{' '}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #e9ecef',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                color: '#495057',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#e9ecef';
                                e.currentTarget.style.borderColor = '#adb5bd';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#f8f9fa';
                                e.currentTarget.style.borderColor = '#e9ecef';
                            }}>
                            ✏️ 编辑
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                backgroundColor: '#fff5f5',
                                border: '1px solid #fed7d7',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                color: '#c53030',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#c53030';
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.borderColor = '#c53030';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#fff5f5';
                                e.currentTarget.style.color = '#c53030';
                                e.currentTarget.style.borderColor = '#fed7d7';
                            }}>
                            {' '}
                            🗑️ 删除
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onJumpToSource();
                            }}
                            style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                color: '#1d4ed8',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#1d4ed8';
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.borderColor = '#1d4ed8';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#eff6ff';
                                e.currentTarget.style.color = '#1d4ed8';
                                e.currentTarget.style.borderColor = '#bfdbfe';
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
                        )}{' '}
                    </p>

                    {/* 显示备注信息 */}
                    {word.notes && word.notes.trim() && (
                        <p
                            style={{
                                margin: '5px 0',
                                fontSize: '14px',
                                color: '#666',
                                fontStyle: 'italic',
                                backgroundColor: '#fff8e1',
                                padding: '6px 8px',
                                borderRadius: '4px',
                                borderLeft: '3px solid #ffb300',
                            }}>
                            <strong>💡 备注:</strong>{' '}
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

// 列表视图单词组件
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
                    padding: '12px 15px',
                    border: '1px solid #dee2e6',
                    borderTop: 'none',
                    borderRadius: isLast ? '0 0 8px 8px' : '0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff',
                    minHeight: '60px',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateX(0)';
                }}
                onClick={onViewDetail}>
                {/* 单词名称 */}
                <div style={{ flex: '0 0 200px', fontWeight: 'bold' }}>
                    <HighlightText
                        text={word.name}
                        searchTerm={searchTerm}
                    />
                </div>
                {/* 发音 */}
                <div
                    style={{
                        flex: '0 0 180px',
                        fontSize: '14px',
                        color: '#666',
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
                <div style={{ flex: '0 0 120px', fontSize: '14px' }}>
                    <span
                        style={{
                            padding: '2px 8px',
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                            borderRadius: 12,
                            fontSize: '12px',
                        }}>
                        {enableFullHighlight ? (
                            <HighlightText
                                text={word.category}
                                searchTerm={searchTerm}
                            />
                        ) : (
                            word.category
                        )}
                    </span>
                </div>
                {/* 标签 */}
                <div style={{ flex: '1', fontSize: '14px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {word.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                style={{
                                    padding: '2px 6px',
                                    backgroundColor: '#f1f8e9',
                                    color: '#689f38',
                                    borderRadius: 10,
                                    fontSize: '11px',
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
                        {word.tags.length > 3 && (
                            <span style={{ fontSize: '11px', color: '#999' }}>
                                +{word.tags.length - 3}
                            </span>
                        )}
                    </div>
                </div>
                {/* 查询次数 */}
                <div
                    style={{
                        flex: '0 0 80px',
                        fontSize: '14px',
                        color: '#666',
                        textAlign: 'center',
                    }}>
                    {word.metadata.queryCount || 0}
                </div>
                {/* 等级 */}
                <div
                    style={{
                        flex: '0 0 60px',
                        fontSize: '12px',
                        textAlign: 'center',
                    }}>
                    <span
                        style={{
                            padding: '2px 6px',
                            backgroundColor:
                                word.level === '高级'
                                    ? '#ffebee'
                                    : word.level === '中级'
                                    ? '#fff3e0'
                                    : '#e8f5e8',
                            color:
                                word.level === '高级'
                                    ? '#c62828'
                                    : word.level === '中级'
                                    ? '#ef6c00'
                                    : '#2e7d32',
                            borderRadius: 8,
                            fontSize: '11px',
                        }}>
                        {word.level}
                    </span>
                </div>{' '}
                {/* 操作按钮 */}
                <div
                    style={{
                        flex: '0 0 120px',
                        display: 'flex',
                        gap: '4px',
                        justifyContent: 'flex-end',
                    }}>
                    {' '}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#495057',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e9ecef';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }}>
                        ✏️ 编辑
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: '#fff5f5',
                            border: '1px solid #fed7d7',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#c53030',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#c53030';
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fff5f5';
                            e.currentTarget.style.color = '#c53030';
                        }}>
                        🗑️ 删除
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onJumpToSource();
                        }}
                        style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#0284c7',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#0284c7';
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f9ff';
                            e.currentTarget.style.color = '#0284c7';
                        }}>
                        🔗 跳转
                    </button>
                </div>
            </div>
        );
    },
);

interface WordManagerProps {
    words: Word[];
    onAdd: (word: Word) => void;
    onEdit: (word: Word, originalWord?: Word) => void;
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

    // 监控数据变化
    React.useEffect(() => {
        console.log(
            `📝 WordManager received ${words.length} words, updating interface`,
        );
    }, [words.length]);

    // 监控 words 数组内容变化
    React.useEffect(() => {
        console.log(
            `🔄 Words data changed:`,
            words.map((w) => w.name).slice(0, 5),
        );
    }, [words]); // 新增：标签和分类过滤状态
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
    const [errorMessage, setErrorMessage] = useState('');

    // 新增：新建标签输入状态
    const [newTagInput, setNewTagInput] = useState('');

    // 优化的搜索函数 - 提前退出和缓存
    const searchInWord = useCallback((word: Word, term: string): boolean => {
        if (!term) return true;

        const lowerTerm = term.toLowerCase(); // 基本字段搜索 - 提前退出
        if (word.name.toLowerCase().includes(lowerTerm)) return true;
        if (word.category.toLowerCase().includes(lowerTerm)) return true;
        if (word.level.toLowerCase().includes(lowerTerm)) return true;
        if (word.partsOfSpeech.toLowerCase().includes(lowerTerm)) return true;
        if (word.pronunciation.toLowerCase().includes(lowerTerm)) return true;
        if (word.notes && word.notes.toLowerCase().includes(lowerTerm))
            return true;

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
    }, []);

    // 提取所有唯一的标签和分类
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        words.forEach((word) => {
            word.tags.forEach((tag) => {
                if (tag.trim()) tagSet.add(tag.trim());
            });
        });
        return Array.from(tagSet).sort();
    }, [words]);
    const allCategories = useMemo(() => {
        const categorySet = new Set<string>();
        words.forEach((word) => {
            if (word.category.trim()) categorySet.add(word.category.trim());
        });
        return Array.from(categorySet).sort();
    }, [words]);

    // 提取所有唯一的等级
    const allLevels = useMemo(() => {
        const levelSet = new Set<string>();
        words.forEach((word) => {
            if (word.level.trim()) levelSet.add(word.level.trim());
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
                    word.tags.some((wordTag) => wordTag.trim() === selectedTag),
                );
                if (!hasSelectedTag) return false;
            }

            // 分类过滤
            if (selectedCategories.length > 0) {
                if (!selectedCategories.includes(word.category.trim()))
                    return false;
            }

            // 等级过滤
            if (selectedLevels.length > 0) {
                if (!selectedLevels.includes(word.level.trim())) return false;
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
                    compareResult = a.category.localeCompare(b.category);
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
                        metadata: {
                            ...editTarget.metadata,
                            ...form.metadata,
                        },
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
            tags: [...word.tags],
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
            // 检查是否有搜索或筛选条件
            const hasSearchFilters =
                searchTerm.trim() !== '' ||
                selectedTags.length > 0 ||
                selectedCategories.length > 0 ||
                selectedLevels.length > 0 ||
                selectedPartsOfSpeech.length > 0;

            let updatedWord: Word;

            if (hasSearchFilters) {
                // 有搜索/筛选条件时，查询次数+1
                updatedWord = {
                    ...word,
                    metadata: {
                        ...word.metadata,
                        queryCount: (word.metadata.queryCount || 0) + 1,
                    },
                };
                // 同步更新到数据存储中
                onEdit(updatedWord);
            } else {
                // 没有搜索/筛选条件时，不增加查询次数
                updatedWord = word;
            }

            // 更新当前单词状态
            setCurrentWord(updatedWord);
            setViewMode('detail');
        },
        [
            onEdit,
            searchTerm,
            selectedTags,
            selectedCategories,
            selectedLevels,
            selectedPartsOfSpeech,
        ],
    );
    const handleBackToList = useCallback(() => {
        setViewMode('list');
        setCurrentWord(null);
    }, []); // 带确认提示的单词删除函数
    const handleDeleteWord = useCallback(
        (word: Word) => {
            const wordName = word.name;
            const wordCategory = word.category || '未分类';
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
                    <div
                        style={{
                            background:
                                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '24px',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        }}>
                        <h1
                            style={{
                                margin: 0,
                                color: 'white',
                                fontSize: '28px',
                                fontWeight: '600',
                                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}>
                            📚 单词管理中心
                        </h1>
                        <p
                            style={{
                                margin: '8px 0 0 0',
                                color: 'rgba(255,255,255,0.9)',
                                fontSize: '16px',
                                fontWeight: '300',
                            }}>
                            管理您的单词库，让学习更高效
                        </p>
                    </div>{' '}
                    <div
                        style={{
                            background: '#ffffff',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(0,0,0,0.05)',
                        }}>
                        <div
                            style={{
                                display: 'flex',
                                gap: '16px',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                            }}>
                            <input
                                type="text"
                                placeholder="🔍 搜索单词、分类、标签、发音或内容..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    border: '2px solid #e1e5e9',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    backgroundColor: '#ffffff',
                                    transition: 'all 0.2s ease',
                                    outline: 'none',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor =
                                        '#0066cc';
                                    e.currentTarget.style.boxShadow =
                                        '0 0 0 3px rgba(0, 102, 204, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor =
                                        '#e1e5e9';
                                    e.currentTarget.style.boxShadow =
                                        '0 2px 4px rgba(0,0,0,0.05)';
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
                                            setEnableFullHighlight(
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    全部高亮
                                </label>
                            )}{' '}
                            <button
                                onClick={() => setShowAdd(true)}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#0066cc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        '#0052a3';
                                    e.currentTarget.style.transform =
                                        'translateY(-1px)';
                                    e.currentTarget.style.boxShadow =
                                        '0 4px 8px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        '#0066cc';
                                    e.currentTarget.style.transform =
                                        'translateY(0)';
                                    e.currentTarget.style.boxShadow =
                                        '0 2px 4px rgba(0,0,0,0.1)';
                                }}>
                                ➕ 添加新单词
                            </button>{' '}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                style={{
                                    padding: '12px 16px',
                                    backgroundColor: showFilters
                                        ? '#e6f3ff'
                                        : '#ffffff',
                                    color: showFilters ? '#0066cc' : '#6c757d',
                                    border: showFilters
                                        ? '2px solid #0066cc'
                                        : '2px solid #e1e5e9',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                }}
                                onMouseEnter={(e) => {
                                    if (!showFilters) {
                                        e.currentTarget.style.borderColor =
                                            '#0066cc';
                                        e.currentTarget.style.color = '#0066cc';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!showFilters) {
                                        e.currentTarget.style.borderColor =
                                            '#e1e5e9';
                                        e.currentTarget.style.color = '#6c757d';
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
                    {/* 展示控制栏 */}{' '}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                            padding: '16px 20px',
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid rgba(0,0,0,0.05)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        }}>
                        <div
                            style={{
                                display: 'flex',
                                gap: 15,
                                alignItems: 'center',
                            }}>
                            {/* 视图模式切换 */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                }}>
                                {' '}
                                <span
                                    style={{
                                        fontSize: '14px',
                                        color: '#374151',
                                        fontWeight: '500',
                                        marginRight: '8px',
                                    }}>
                                    视图:
                                </span>
                                <div
                                    style={{
                                        display: 'flex',
                                        backgroundColor: '#f3f4f6',
                                        borderRadius: '8px',
                                        padding: '2px',
                                        gap: '2px',
                                    }}>
                                    <button
                                        onClick={() => setDisplayMode('grid')}
                                        style={{
                                            padding: '8px 12px',
                                            fontSize: '13px',
                                            backgroundColor:
                                                displayMode === 'grid'
                                                    ? '#0066cc'
                                                    : 'transparent',
                                            color:
                                                displayMode === 'grid'
                                                    ? '#ffffff'
                                                    : '#6b7280',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            transition: 'all 0.2s ease',
                                        }}>
                                        📊 网格
                                    </button>
                                    <button
                                        onClick={() => setDisplayMode('list')}
                                        style={{
                                            padding: '8px 12px',
                                            fontSize: '13px',
                                            backgroundColor:
                                                displayMode === 'list'
                                                    ? '#0066cc'
                                                    : 'transparent',
                                            color:
                                                displayMode === 'list'
                                                    ? '#ffffff'
                                                    : '#6b7280',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            transition: 'all 0.2s ease',
                                        }}>
                                        📋 列表
                                    </button>
                                </div>
                            </div>

                            {/* 排序选择 */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                }}>
                                <span
                                    style={{ fontSize: '14px', color: '#555' }}>
                                    排序:
                                </span>
                                <select
                                    value={sortBy}
                                    onChange={(e) =>
                                        setSortBy(e.target.value as any)
                                    }
                                    style={{
                                        padding: '6px 8px',
                                        fontSize: '12px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        backgroundColor: '#fff',
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
                                        padding: '6px 8px',
                                        fontSize: '12px',
                                        backgroundColor: '#fff',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}>
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>

                            {/* 每页显示数量 */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                }}>
                                <span
                                    style={{ fontSize: '14px', color: '#555' }}>
                                    每页:
                                </span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    style={{
                                        padding: '6px 8px',
                                        fontSize: '12px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        backgroundColor: '#fff',
                                    }}>
                                    <option value={6}>6</option>
                                    <option value={12}>12</option>
                                    <option value={24}>24</option>
                                    <option value={48}>48</option>
                                </select>
                            </div>
                        </div>

                        {/* 结果统计 */}
                        <div style={{ fontSize: '14px', color: '#666' }}>
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
                            / 共 {sortedWords.length} 个单词
                        </div>
                    </div>
                    {/* 过滤器面板 */}
                    {showFilters && (
                        <div
                            style={{
                                marginBottom: 20,
                                padding: 15,
                                border: '1px solid #ddd',
                                borderRadius: 8,
                                backgroundColor: '#f9f9f9',
                            }}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 15,
                                }}>
                                <h3 style={{ margin: 0, fontSize: '16px' }}>
                                    过滤选项
                                </h3>
                                <button
                                    onClick={clearAllFilters}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        backgroundColor: '#fff',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}>
                                    清除所有
                                </button>
                            </div>
                            {/* 分类过滤 */}
                            {allCategories.length > 0 && (
                                <div style={{ marginBottom: 15 }}>
                                    <div
                                        style={{
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            marginBottom: 8,
                                            color: '#555',
                                        }}>
                                        分类筛选:
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 6,
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
                                                    padding: '6px 12px',
                                                    fontSize: '12px',
                                                    backgroundColor:
                                                        selectedCategories.includes(
                                                            category,
                                                        )
                                                            ? '#007acc'
                                                            : '#fff',
                                                    color: selectedCategories.includes(
                                                        category,
                                                    )
                                                        ? '#fff'
                                                        : '#333',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '15px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}>
                                                {category}
                                                {selectedCategories.includes(
                                                    category,
                                                ) && ' ✓'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}{' '}
                            {/* 标签过滤 */}
                            {allTags.length > 0 && (
                                <div style={{ marginBottom: 15 }}>
                                    <div
                                        style={{
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            marginBottom: 8,
                                            color: '#555',
                                        }}>
                                        标签筛选:
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 6,
                                        }}>
                                        {allTags.map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() =>
                                                    handleTagToggle(tag)
                                                }
                                                style={{
                                                    padding: '6px 12px',
                                                    fontSize: '12px',
                                                    backgroundColor:
                                                        selectedTags.includes(
                                                            tag,
                                                        )
                                                            ? '#28a745'
                                                            : '#fff',
                                                    color: selectedTags.includes(
                                                        tag,
                                                    )
                                                        ? '#fff'
                                                        : '#333',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '15px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
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
                                <div style={{ marginBottom: 15 }}>
                                    <div
                                        style={{
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            marginBottom: 8,
                                            color: '#555',
                                        }}>
                                        等级筛选:
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 6,
                                        }}>
                                        {allLevels.map((level) => (
                                            <button
                                                key={level}
                                                onClick={() =>
                                                    handleLevelToggle(level)
                                                }
                                                style={{
                                                    padding: '6px 12px',
                                                    fontSize: '12px',
                                                    backgroundColor:
                                                        selectedLevels.includes(
                                                            level,
                                                        )
                                                            ? '#ffc107'
                                                            : '#fff',
                                                    color: selectedLevels.includes(
                                                        level,
                                                    )
                                                        ? '#000'
                                                        : '#333',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '15px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
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
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            marginBottom: 8,
                                            color: '#555',
                                        }}>
                                        词性筛选:
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 6,
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
                                                        padding: '6px 12px',
                                                        fontSize: '12px',
                                                        backgroundColor:
                                                            selectedPartsOfSpeech.includes(
                                                                partsOfSpeech,
                                                            )
                                                                ? '#6f42c1'
                                                                : '#fff',
                                                        color: selectedPartsOfSpeech.includes(
                                                            partsOfSpeech,
                                                        )
                                                            ? '#fff'
                                                            : '#333',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '15px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
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
                    </div>
                    {/* 分页控件 */}
                    {totalPages > 1 && (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 10,
                                marginTop: 20,
                                padding: '15px 0',
                            }}>
                            <button
                                onClick={() =>
                                    setCurrentPage(Math.max(1, currentPage - 1))
                                }
                                disabled={currentPage === 1}
                                style={{
                                    padding: '8px 12px',
                                    fontSize: '14px',
                                    backgroundColor:
                                        currentPage === 1 ? '#f8f9fa' : '#fff',
                                    color:
                                        currentPage === 1
                                            ? '#6c757d'
                                            : '#495057',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '4px',
                                    cursor:
                                        currentPage === 1
                                            ? 'not-allowed'
                                            : 'pointer',
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
                                    {currentWord.tags.join(', ')}
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
                                        allCategories.includes(form.category)
                                            ? form.category
                                            : ''
                                    }
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            setForm({
                                                ...form,
                                                category: e.target.value,
                                            });
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
                                    value={form.category}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            category: e.target.value,
                                        })
                                    }
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
                                    {form.tags.length === 0 ? (
                                        <span
                                            style={{
                                                color: '#999',
                                                fontSize: '14px',
                                                padding: '4px',
                                            }}>
                                            请选择或添加标签
                                        </span>
                                    ) : (
                                        form.tags.map((tag, index) => (
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
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newTags =
                                                            form.tags.filter(
                                                                (_, i) =>
                                                                    i !== index,
                                                            );
                                                        setForm({
                                                            ...form,
                                                            tags: newTags,
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
                                        ))
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
                                                        !form.tags.includes(
                                                            tag,
                                                        ),
                                                )
                                                .map((tag) => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => {
                                                            if (
                                                                !form.tags.includes(
                                                                    tag,
                                                                )
                                                            ) {
                                                                setForm({
                                                                    ...form,
                                                                    tags: [
                                                                        ...form.tags,
                                                                        tag,
                                                                    ],
                                                                });
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
                                                    e.key === 'Enter' &&
                                                    newTagInput?.trim()
                                                ) {
                                                    const trimmedTag =
                                                        newTagInput.trim();
                                                    if (
                                                        !form.tags.includes(
                                                            trimmedTag,
                                                        )
                                                    ) {
                                                        setForm({
                                                            ...form,
                                                            tags: [
                                                                ...form.tags,
                                                                trimmedTag,
                                                            ],
                                                        });
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
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (newTagInput?.trim()) {
                                                    const trimmedTag =
                                                        newTagInput.trim();
                                                    if (
                                                        !form.tags.includes(
                                                            trimmedTag,
                                                        )
                                                    ) {
                                                        setForm({
                                                            ...form,
                                                            tags: [
                                                                ...form.tags,
                                                                trimmedTag,
                                                            ],
                                                        });
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

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Word, WordHelper } from './MarkdownWordStorage';
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    ChevronLeft,
    ChevronRight,
    Activity,
    BookOpen,
    Filter,
    Grid,
    ChevronUp,
    ChevronDown,
    Tag,
    Layers,
    FileText,
    X,
    Check,
    AlertCircle,
    Sparkles,
    Hash,
    BookMarked,
    AlignLeft,
    MessageSquare,
} from 'lucide-react';
import { PARTS_OF_SPEECH_GROUPS } from './data/data';
import { WordManagerProps } from './types/WordManagerType';
import {
    createEmptyWord,
    getWordId,
    getWordQueryCount,
} from './utils/wordManager';
import {
    WordCard,
    WordDetailOutline,
} from './components/word-manager';
import { RichText } from './components/common';
import { parseTimestamp } from './utils/date';

type WordSortKey = 'name' | 'date' | 'recentAdded' | 'queryCount' | 'category';

const getSortableTimestamp = (
    value?: string | null,
    fallbackValue?: string | null,
): number => {
    const parsed = parseTimestamp(value) || parseTimestamp(fallbackValue);
    return parsed ? parsed.getTime() : 0;
};

export default function WordManagerMarkdown({
    app,
    markdownSourcePath,
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

    // 娣诲姞鎼滅储妗嗗紩鐢?
    const searchInputRef = useRef<HTMLInputElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const listScrollTopRef = useRef(0);
    const shouldRestoreListScrollRef = useRef(false);

    /**
     * 获取当前插件内容区的滚动容器，列表和详情共用该容器。
     */
    const getScrollContainer = useCallback((): HTMLElement | null => {
        try {
            const root = rootRef.current;
            if (!root) return null;
            return root.closest('.la-content') as HTMLElement | null;
        } catch (error) {
            console.error('获取滚动容器失败:', error);
            return null;
        }
    }, []);

    /**
     * 记录单词列表当前滚动位置，详情返回时恢复用户离开前的位置。
     */
    const saveListScrollPosition = useCallback(() => {
        try {
            const scrollContainer = getScrollContainer();
            if (!scrollContainer) return;
            listScrollTopRef.current = scrollContainer.scrollTop;
        } catch (error) {
            console.error('保存单词列表滚动位置失败:', error);
        }
    }, [getScrollContainer]);

    React.useLayoutEffect(() => {
        if (viewMode !== 'list' || !shouldRestoreListScrollRef.current) return;

        try {
            const scrollContainer = getScrollContainer();
            if (!scrollContainer) return;

            scrollContainer.scrollTo({
                top: listScrollTopRef.current,
                left: 0,
                behavior: 'auto',
            });
            shouldRestoreListScrollRef.current = false;
        } catch (error) {
            console.error('恢复单词列表滚动位置失败:', error);
        }
    }, [getScrollContainer, viewMode]);


    // 娣诲姞蹇嵎閿敮鎸?
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const root = rootRef.current;
            const target = e.target as Node | null;
            if (!root || !target || !root.contains(target)) return;

            const element = e.target as HTMLElement | null;
            const tagName = element?.tagName.toLowerCase();
            const isTypingTarget =
                tagName === 'input' ||
                tagName === 'textarea' ||
                tagName === 'select' ||
                element?.isContentEditable;
            if (e.key === '/' && isTypingTarget) return;

            // Ctrl+F 鎴?Cmd+F 鎴?/ 蹇嵎閿仛鐒︽悳绱㈡
            if (((e.ctrlKey || e.metaKey) && e.key === 'f') || e.key === '/') {
                e.preventDefault();
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                    console.log('鈱笍 蹇嵎閿仛鐒︽悳绱㈡');
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 鐩戞帶鏁版嵁鍙樺寲 - 閬垮厤棰戠箒鎵撳嵃
    React.useEffect(() => {
        console.log(
            `馃摑 WordManager received ${words.length} words, updating interface`,
        );
    }, [words.length]);

    // 鐩戞帶 words 鏁扮粍鍐呭鍙樺寲 - 浣跨敤 useMemo 浼樺寲
    const wordsHash = useMemo(() => {
        return words.map((w) => w.name).join(',');
    }, [words]);

    React.useEffect(() => {
        console.log(
            `馃攧 Words data changed, hash: ${wordsHash.slice(0, 50)}...`,
        );
    }, [wordsHash]);

    // 鐩戞帶瑙嗗浘妯″紡鍙樺寲
    React.useEffect(() => {
        console.log('馃幆 ViewMode changed to:', viewMode);
    }, [viewMode]);

    // 鐩戞帶褰撳墠鍗曡瘝鍙樺寲
    React.useEffect(() => {
        console.log(
            '馃摉 CurrentWord changed to:',
            currentWord ? currentWord.name : 'null',
        );
    }, [currentWord]);

    // 鏂板锛氭爣绛惧拰鍒嗙被杩囨护鐘舵€?
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [selectedPartsOfSpeech, setSelectedPartsOfSpeech] = useState<
        string[]
    >([]);
    const [showFilters, setShowFilters] = useState(false);

    // 鏂板锛氬睍绀哄姛鑳界姸鎬?
    const displayMode: 'grid' | 'list' = 'grid';
    const [sortBy, setSortBy] = useState<WordSortKey>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12); // 鏂板锛氶敊璇彁绀虹姸鎬?
    const [errorMessage, setErrorMessage] = useState(''); // 鏂板锛氭柊寤烘爣绛捐緭鍏ョ姸鎬?
    const [newTagInput, setNewTagInput] = useState('');

    // 浼樺寲鐨勬悳绱㈠嚱鏁?- 鎻愬墠閫€鍑哄拰缂撳瓨
    const searchInWord = useCallback((word: Word, term: string): boolean => {
        if (!term) return true;

        const lowerTerm = term.toLowerCase(); // 鍩烘湰瀛楁鎼滅储 - 鎻愬墠閫€鍑?
        if (word.name.toLowerCase().includes(lowerTerm)) return true;
        if (WordHelper.getCategory(word).toLowerCase().includes(lowerTerm))
            return true;
        if (WordHelper.getLevel(word).toLowerCase().includes(lowerTerm))
            return true;
        if (word.partsOfSpeech.toLowerCase().includes(lowerTerm)) return true;
        if (word.pronunciation.toLowerCase().includes(lowerTerm)) return true;
        if (word.notes && word.notes.toLowerCase().includes(lowerTerm))
            return true;

        // 鏍囩鎼滅储
        if (
            WordHelper.getTags(word).some((tag) =>
                tag.toLowerCase().includes(lowerTerm),
            )
        )
            return true;

        // 璇︾粏鍐呭鎼滅储 - 浼樺寲宓屽寰幆
        for (const part of word.content) {
            if (part.type.toLowerCase().includes(lowerTerm)) return true;

            for (const def of part.definitions) {
                if (def.definition.toLowerCase().includes(lowerTerm))
                    return true;

                // 鍙湪蹇呰鏃舵悳绱緥鍙?
                for (const example of def.examples) {
                    if (example.text.toLowerCase().includes(lowerTerm))
                        return true;
                }
            }
        }
        return false;
    }, []);

    // 鎻愬彇鎵€鏈夊敮涓€鐨勬爣绛惧拰鍒嗙被
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

    // 鎻愬彇鎵€鏈夊敮涓€鐨勭瓑绾?
    const allLevels = useMemo(() => {
        const levelSet = new Set<string>();
        words.forEach((word) => {
            if (WordHelper.getLevel(word).trim())
                levelSet.add(WordHelper.getLevel(word).trim());
        });
        return Array.from(levelSet).sort();
    }, [words]);

    // 鎻愬彇鎵€鏈夊敮涓€鐨勮瘝鎬?
    const allPartsOfSpeech = useMemo(() => {
        const partsOfSpeechSet = new Set<string>();
        words.forEach((word) => {
            if (word.partsOfSpeech.trim())
                partsOfSpeechSet.add(word.partsOfSpeech.trim());
        });
        return Array.from(partsOfSpeechSet).sort();
    }, [words]); // 缁煎悎杩囨护鍑芥暟锛氭悳绱?+ 鏍囩 + 鍒嗙被 + 绛夌骇 + 璇嶆€?
    const applyFilters = useCallback(
        (word: Word): boolean => {
            // 鎼滅储杩囨护
            if (!searchInWord(word, searchTerm)) return false;

            // 鏍囩杩囨护
            if (selectedTags.length > 0) {
                const hasSelectedTag = selectedTags.some((selectedTag) =>
                    WordHelper.getTags(word).some(
                        (wordTag) => wordTag.trim() === selectedTag,
                    ),
                );
                if (!hasSelectedTag) return false;
            }

            // 鍒嗙被杩囨护
            if (selectedCategories.length > 0) {
                if (
                    !selectedCategories.includes(
                        WordHelper.getCategory(word).trim(),
                    )
                )
                    return false;
            }

            // 绛夌骇杩囨护
            if (selectedLevels.length > 0) {
                if (!selectedLevels.includes(WordHelper.getLevel(word).trim()))
                    return false;
            }

            // 璇嶆€ц繃婊?
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
    ); // 浣跨敤 useMemo 缂撳瓨杩囨护缁撴灉
    const filteredWords = useMemo(() => {
        return words.filter(applyFilters);
    }, [words, applyFilters]);

    // 鎺掑簭閫昏緫
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
                case 'recentAdded':
                    compareResult =
                        getSortableTimestamp(
                            a.itemMeta?.createAt,
                            a.itemMeta?.lastUpdate,
                        ) -
                        getSortableTimestamp(
                            b.itemMeta?.createAt,
                            b.itemMeta?.lastUpdate,
                        );
                    break;
                case 'date':
                    compareResult =
                        getSortableTimestamp(
                            a.itemMeta?.lastUpdate,
                            a.itemMeta?.createAt,
                        ) -
                        getSortableTimestamp(
                            b.itemMeta?.lastUpdate,
                            b.itemMeta?.createAt,
                        );
                    break;
                default:
                    compareResult = 0;
            }

            return sortOrder === 'asc' ? compareResult : -compareResult;
        });

        return sorted;
    }, [filteredWords, sortBy, sortOrder]);

    // 鍒嗛〉閫昏緫
    const paginatedWords = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedWords.slice(startIndex, endIndex);
    }, [sortedWords, currentPage, itemsPerPage]); // 鎬婚〉鏁?
    const totalPages = Math.ceil(sortedWords.length / itemsPerPage);
    const [form, setForm] = useState<Word>(createEmptyWord());
    // NOTE: 澶勭悊鎻愪氦閫昏緫
    const handleSubmit = useCallback(() => {
        // 娓呴櫎涔嬪墠鐨勯敊璇秷鎭?
        setErrorMessage('');

        // 楠岃瘉鍗曡瘝鍚嶇О涓嶈兘涓虹┖
        if (!form.name.trim()) {
            setErrorMessage('单词名称不能为空');
            return;
        }

        // 妫€鏌ュ崟璇嶅悕绉版槸鍚﹂噸澶?
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

        // 璁板綍鎿嶄綔绫诲瀷鐢ㄤ簬璋冭瘯
        const operation = editTarget ? '编辑' : '添加';
        console.log(`馃攧 ${operation}鍗曡瘝鎿嶄綔寮€濮?`, trimmedName);

        try {
            if (editTarget) {
                // 缂栬緫鏃朵繚鐣欏師鏈夊厓鏁版嵁
                onEdit(
                    {
                        ...form,
                        name: trimmedName,
                    },
                    editTarget,
                );
                setEditTarget(null);
                console.log(`鉁?${operation}鍗曡瘝璇锋眰宸插彂閫侊紝绛夊緟鐣岄潰鏇存柊`);
            } else {
                // 娣诲姞鏂板崟璇嶆椂锛岃鍚庣鐢熸垚ID
                onAdd({ ...form, name: trimmedName });
                console.log(`鉁?${operation}鍗曡瘝璇锋眰宸插彂閫侊紝绛夊緟鐣岄潰鏇存柊`);
            }

            // 閲嶇疆琛ㄥ崟鍜岄敊璇秷鎭?
            setForm(createEmptyWord());
            setErrorMessage('');
            setNewTagInput('');
            setShowAdd(false);

            // 濡傛灉鍦ㄨ缁嗚鍥句腑锛岃繑鍥炲垪琛ㄨ鍥句互鏌ョ湅鏇存柊
            if (viewMode === 'detail') {
                setViewMode('list');
                setCurrentWord(null);
                console.log('返回列表视图以查看更新');
            }
        } catch (error) {
            console.error(`鉂?${operation}鍗曡瘝鏃跺彂鐢熼敊璇?`, error);
            setErrorMessage(`${operation}失败，请重试`);
        }
    }, [editTarget, form, onEdit, onAdd, words, viewMode]);
    const handleEditClick = useCallback((word: Word) => {
        setEditTarget(word);
        setForm({
            ...word,
            content: JSON.parse(JSON.stringify(word.content)),
        });
        setNewTagInput(''); // 閲嶇疆鏂版爣绛捐緭鍏?
        setShowAdd(true);
    }, []);

    // 鏍囩鍜屽垎绫昏繃婊ゅ鐞嗗嚱鏁?
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
        console.log('清除所有筛选');
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
    ); // 鍒犻櫎鍔熻兘鐨勫洖璋冨嚱鏁?- 甯︾‘璁ゆ彁绀?
    const handleRemovePart = useCallback(
        (partIndex: number) => {
            const partType = form.content[partIndex].type || '未命名词性';
            const definitionsCount = form.content[partIndex].definitions.length;

            if (
                window.confirm(
                    `确定要删除词性“${partType}”吗？\n` +
                        `这会同时删除该词性下的 ${definitionsCount} 个定义和所有例句。\n\n` +
                        '此操作无法撤销。',
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
                    `确定要删除定义“${shortDefinition}”吗？\n` +
                        `这会同时删除该定义下的 ${examplesCount} 个例句。\n\n` +
                        '此操作无法撤销。',
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
                    `确定要删除例句“${shortExample}”吗？\n\n` +
                        '此操作无法撤销。',
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
    ); // 椤甸潰妯″紡鍒囨崲鍑芥暟 - 鍙湁閫氳繃鎼滅储/绛涢€夊悗鏌ョ湅鎵嶅鍔犳煡璇㈡鏁?
    const handleViewWord = useCallback(
        (word: Word) => {
            console.log('馃攳 handleViewWord called for word:', word.name);

            // 鍔ㄦ€佽鍙栧綋鍓嶆悳绱㈡鐨勫€硷紝閬垮厤闂寘闂
            // 涓嶈兘渚濊禆 useCallback 鐨?searchTerm锛屽洜涓哄彲鑳芥崟鑾锋棫鍊?
            saveListScrollPosition();

            const currentSearchTerm = searchInputRef.current?.value || '';
            const hasSearchQuery = currentSearchTerm.trim() !== '';

            console.log('馃攳 hasSearchQuery:', hasSearchQuery);
            console.log('馃攳 current searchTerm from ref:', currentSearchTerm);
            console.log('馃搳 Current viewCount:', word.itemMeta?.viewCount || 0);

            let updatedWord: Word;

            if (hasSearchQuery) {
                // 鎼滅储妗嗘湁鍐呭鏃讹紝澧炲姞鏌ヨ娆℃暟
                updatedWord = {
                    ...word,
                    itemMeta: {
                        ...word.itemMeta,
                        viewCount: (word.itemMeta?.viewCount || 0) + 1,
                    },
                };
                console.log(
                    '馃搳 New viewCount will be:',
                    updatedWord.itemMeta.viewCount,
                );
            } else {
                // 鎼滅储妗嗕负绌烘椂锛屼笉澧炲姞鏌ヨ娆℃暟
                updatedWord = word;
                console.log('馃搳 No search query - viewCount unchanged');
            }

            // 棣栧厛绔嬪嵆璁剧疆瑙嗗浘鐘舵€?
            console.log('馃摑 Setting currentWord and switching to detail view');
            setCurrentWord(updatedWord);
            setViewMode('detail');

            // 鍙湁鍦ㄦ悳绱㈡鏈夊唴瀹规椂鎵嶆洿鏂板悗绔暟鎹?
            if (hasSearchQuery) {
                setTimeout(() => {
                    // 闈欓粯鏇存柊鍒板悗绔紙涓嶆樉绀洪€氱煡锛?
                    console.log(
                        '馃搳 Silent update to backend with viewCount:',
                        updatedWord.itemMeta.viewCount,
                    );
                    onEdit(updatedWord, word, true);
                }, 10);
            }

            console.log('鉁?View mode changed to detail, currentWord set');
        },
        [onEdit, saveListScrollPosition],
    );
    const handleBackToList = useCallback(() => {
        console.log('馃敊 杩斿洖鍒楄〃');
        shouldRestoreListScrollRef.current = true;
        setViewMode('list');
        setCurrentWord(null);

        // 馃挕 涓嶉渶瑕佽皟鐢?onRefresh()
        // 鍥犱负 viewCount 宸茬粡閫氳繃 onEdit 闈欓粯妯″紡鏇存柊鍒板唴瀛樹腑
        // 璋冪敤 onRefresh() 浼氬鑷存暣涓粍浠堕噸鏂版覆鏌擄紝涓㈠け绛涢€夋潯浠?
    }, []); // 甯︾‘璁ゆ彁绀虹殑鍗曡瘝鍒犻櫎鍑芥暟
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
                    `确定要删除单词“${wordName}”吗？\n\n` +
                        `单词信息：\n` +
                        `- 分类：${wordCategory}\n` +
                        `- 包含 ${definitionsCount} 个定义\n` +
                        `- 包含 ${examplesCount} 个例句\n\n` +
                        '此操作会永久删除该单词的所有信息，无法撤销。',
                )
            ) {
                console.log(`馃棏锔?鍒犻櫎鍗曡瘝鎿嶄綔寮€濮?`, wordName);

                // 濡傛灉褰撳墠鍦ㄨ缁嗚鍥句腑涓旀鍦ㄦ煡鐪嬭鍒犻櫎鐨勫崟璇嶏紝鍏堣繑鍥炲垪琛?
                if (
                    viewMode === 'detail' &&
                    currentWord &&
                    currentWord.name === wordName
                ) {
                    shouldRestoreListScrollRef.current = true;
                    setViewMode('list');
                    setCurrentWord(null);
                    console.log(
                        '馃攧 浠庤缁嗚鍥捐繑鍥炲垪琛ㄨ鍥撅紙鍥犱负姝ｅ湪鍒犻櫎褰撳墠鏌ョ湅鐨勫崟璇嶏級',
                    );
                }

                onDelete(wordName);
                console.log('鉁?鍒犻櫎鍗曡瘝璇锋眰宸插彂閫侊紝绛夊緟鐣岄潰鏇存柊');
            }
        },
        [onDelete, viewMode, currentWord],
    );
    return (
        <div className="la-word-manager" ref={rootRef}>
            {viewMode === 'list' && (
                <>
                    {/* iOS 椋庢牸鏍囬鏍?*/}
                    <div
                        style={{
                            background:
                                'var(--la-gradient-accent)',
                            padding: '32px 28px',
                            borderRadius: 'var(--la-radius-lg)',
                            marginBottom: '24px',
                            boxShadow: 'var(--la-shadow-sm)',
                            fontFamily:
                                'var(--la-font-display)',
                        }}>
                        <h1
                            style={{
                                margin: 0,
                                color: 'white',
                                fontSize: '34px',
                                fontWeight: '700',
                                letterSpacing: '0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}>
                            <BookOpen size={32} /> 单词管理
                        </h1>
                        <p
                            style={{
                                margin: '8px 0 0 0',
                                color: 'var(--la-on-accent-muted)',
                                fontSize: '17px',
                                fontWeight: '400',
                            }}>
                            管理您的单词库，让学习更高效
                        </p>
                    </div>
                    {/* iOS 椋庢牸鎼滅储鍜屾搷浣滄爮 */}
                    <div
                        style={{
                            background: 'var(--la-surface)',
                            padding: '20px',
                            borderRadius: 'var(--la-radius-md)',
                            marginBottom: '24px',
                            boxShadow: 'var(--la-shadow-sm)',
                            border: 'none',
                            fontFamily:
                                'var(--la-font)',
                        }}>
                        {' '}
                        <div
                            style={{
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                zIndex: 1,
                            }}>
                            {/* iOS 椋庢牸鎼滅储妗?鈥?鍥炬爣鍐呭祵 */}
                            <div
                                style={{
                                    flex: 1,
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    minWidth: '200px',
                                }}>
                                <Search
                                    size={16}
                                    color="var(--la-text-muted)"
                                    style={{
                                        position: 'absolute',
                                        left: '14px',
                                        pointerEvents: 'none',
                                        flexShrink: 0,
                                    }}
                                />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="搜索单词、分类、标签..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: searchTerm
                                            ? '12px 48px 12px 40px'
                                            : '12px 16px 12px 40px',
                                        border: 'none',
                                        borderRadius: 'var(--la-radius-sm)',
                                        fontSize: '15px',
                                        backgroundColor: 'var(--la-surface-subtle)',
                                        transition: 'background-color 0.2s',
                                        outline: 'none',
                                        color: 'var(--la-text-strong)',
                                        WebkitTextFillColor: 'var(--la-text-strong)',
                                        fontFamily:
                                            'var(--la-font)',
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            'var(--la-border)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            'var(--la-surface-subtle)';
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    tabIndex={0}
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        aria-label="清除搜索内容"
                                        title="清除搜索内容"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchTerm('');
                                            setCurrentPage(1);
                                            searchInputRef.current?.focus();
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            width: '30px',
                                            height: '30px',
                                            minWidth: '30px',
                                            minHeight: '30px',
                                            padding: 0,
                                            border: 'none',
                                            borderRadius: '999px',
                                            backgroundColor:
                                                'color-mix(in srgb, var(--la-text-muted) 12%, transparent)',
                                            color: 'var(--la-text-muted)',
                                            boxShadow: 'none',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            {searchTerm && (
                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        fontSize: '15px',
                                        color: 'var(--la-text-muted)',
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

                            {/* iOS 椋庢牸娣诲姞鎸夐挳 */}
                            <button
                                onClick={() => setShowAdd(true)}
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: 'var(--la-accent)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--la-radius-sm)',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    boxShadow:
                                        '0 2px 8px color-mix(in srgb, var(--la-accent) 22%, transparent)',
                                    transition:
                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontFamily:
                                        'var(--la-font)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        'var(--la-accent-strong)';
                                    e.currentTarget.style.transform =
                                        'translateY(-1px)';
                                    e.currentTarget.style.boxShadow =
                                        '0 4px 12px color-mix(in srgb, var(--la-accent) 30%, transparent)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        'var(--la-accent)';
                                    e.currentTarget.style.transform =
                                        'translateY(0)';
                                    e.currentTarget.style.boxShadow =
                                        '0 2px 8px color-mix(in srgb, var(--la-accent) 22%, transparent)';
                                }}>
                                <Plus size={16} /> 添加单词
                            </button>

                            {/* iOS 椋庢牸绛涢€夋寜閽?*/}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                style={{
                                    padding: '12px 16px',
                                    backgroundColor: showFilters
                                        ? 'var(--la-accent-bg)'
                                        : 'var(--la-surface-subtle)',
                                    color: showFilters ? 'var(--la-accent)' : 'var(--la-text-muted)',
                                    border: 'none',
                                    borderRadius: 'var(--la-radius-sm)',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    transition:
                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontFamily:
                                        'var(--la-font)',
                                }}
                                onMouseEnter={(e) => {
                                    if (!showFilters) {
                                        e.currentTarget.style.backgroundColor =
                                            'var(--la-border)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!showFilters) {
                                        e.currentTarget.style.backgroundColor =
                                            'var(--la-surface-subtle)';
                                    }
                                }}>
                                <Filter size={16} /> 筛选
                                {selectedTags.length +
                                    selectedCategories.length +
                                    selectedLevels.length +
                                    selectedPartsOfSpeech.length >
                                    0 && (
                                    <span
                                        style={{
                                            background: 'var(--la-danger)',
                                            color: 'white',
                                            borderRadius: 'var(--la-radius-sm)',
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
                    {/* iOS 椋庢牸灞曠ず鎺у埗鏍?*/}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '16px',
                            flexWrap: 'wrap',
                            marginBottom: '20px',
                            padding: '16px 20px',
                            backgroundColor: 'var(--la-surface)',
                            borderRadius: 'var(--la-radius-md)',
                            border: 'none',
                            boxShadow: 'var(--la-shadow-sm)',
                            fontFamily:
                                'var(--la-font)',
                        }}>
                        <div
                            style={{
                                display: 'flex',
                                gap: 16,
                                alignItems: 'center',
                                flexWrap: 'wrap',
                            }}>
                            {/* iOS 椋庢牸瑙嗗浘妯″紡鍒囨崲 */}
                            <div
                                style={{
                                    display: 'none',
                                    alignItems: 'center',
                                    gap: 8,
                                }}>
                                <span
                                    style={{
                                        fontSize: '15px',
                                        color: 'var(--la-text-muted)',
                                        fontWeight: '500',
                                    }}>
                                    
                                </span>
                                <div
                                    style={{
                                        display: 'flex',
                                        backgroundColor: 'var(--la-surface-subtle)',
                                        borderRadius: 'var(--la-radius-xs)',
                                        padding: '3px',
                                        gap: '2px',
                                    }}>
                                    <button
                                        type="button"
                                        style={{
                                            display: 'none',
                                            padding: '8px 14px',
                                            fontSize: '14px',
                                            backgroundColor:
                                                displayMode === 'grid'
                                                    ? 'var(--la-accent)'
                                                    : 'transparent',
                                            color:
                                                displayMode === 'grid'
                                                    ? 'var(--la-surface)'
                                                    : 'var(--la-text-muted)',
                                            border: 'none',
                                            borderRadius: 'var(--la-radius-xs)',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            transition:
                                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                            fontFamily:
                                                'var(--la-font)',
                                        }}>
                                        <Grid size={16} /> 网格
                                    </button>
                                    <button
                                        type="button"
                                        aria-hidden="true"
                                        style={{
                                            display: 'none',
                                            padding: '8px 14px',
                                            fontSize: '14px',
                                            backgroundColor:
                                                'transparent',
                                            color:
                                                'var(--la-text-muted)',
                                            border: 'none',
                                            borderRadius: 'var(--la-radius-xs)',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            transition:
                                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                            fontFamily:
                                                'var(--la-font)',
                                        }}>
                                        列表
                                    </button>
                                </div>
                            </div>

                            {/* iOS 椋庢牸鎺掑簭閫夋嫨 */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}>
                                <span
                                    style={{
                                        fontSize: '15px',
                                        color: 'var(--la-text-muted)',
                                        fontWeight: '500',
                                    }}>
                                    排序:
                                </span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => {
                                        const nextSortBy = e.target
                                            .value as WordSortKey;
                                        setSortBy(nextSortBy);
                                        if (nextSortBy === 'recentAdded') {
                                            setSortOrder('desc');
                                        }
                                        setCurrentPage(1);
                                    }}
                                    style={{
                                        width: '128px',
                                        height: '44px',
                                        padding: '0 38px 0 18px',
                                        fontSize: '14px',
                                        lineHeight: '44px',
                                        border: 'none',
                                        borderRadius: 'var(--la-radius-xs)',
                                        backgroundColor: 'var(--la-surface-subtle)',
                                        color: 'var(--la-text-strong)',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        textIndent: '0',
                                        fontFamily:
                                            'var(--la-font)',
                                    }}>
                                    <option value="name">名称</option>
                                    <option value="category">分类</option>
                                    <option value="queryCount">查询次数</option>
                                    <option value="recentAdded">最近添加</option>
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
                                        backgroundColor: 'var(--la-surface-subtle)',
                                        border: 'none',
                                        borderRadius: 'var(--la-radius-xs)',
                                        cursor: 'pointer',
                                        color: 'var(--la-accent)',
                                        fontWeight: '600',
                                        transition:
                                            'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            'var(--la-border)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            'var(--la-surface-subtle)';
                                    }}>
                                    {sortOrder === 'asc' ? (
                                        <ChevronUp size={16} />
                                    ) : (
                                        <ChevronDown size={16} />
                                    )}
                                </button>
                            </div>

                            {/* iOS 椋庢牸姣忛〉鏄剧ず鏁伴噺 */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}>
                                <span
                                    style={{
                                        fontSize: '15px',
                                        color: 'var(--la-text-muted)',
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
                                        width: '84px',
                                        height: '44px',
                                        padding: '0 30px 0 18px',
                                        fontSize: '14px',
                                        lineHeight: '44px',
                                        border: 'none',
                                        borderRadius: 'var(--la-radius-xs)',
                                        backgroundColor: 'var(--la-surface-subtle)',
                                        color: 'var(--la-text-strong)',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        textIndent: '0',
                                        fontFamily:
                                            'var(--la-font)',
                                    }}>
                                    <option value={6}>6</option>
                                    <option value={12}>12</option>
                                    <option value={24}>24</option>
                                    <option value={48}>48</option>
                                </select>
                            </div>
                        </div>

                        {/* iOS 椋庢牸缁撴灉缁熻 */}
                        <div
                            style={{
                                fontSize: '15px',
                                color: 'var(--la-text-muted)',
                                fontWeight: '500',
                                marginLeft: 'auto',
                                whiteSpace: 'nowrap',
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
                    {/* iOS 椋庢牸杩囨护鍣ㄩ潰鏉?*/}
                    {showFilters && (
                        <div
                            style={{
                                marginBottom: 20,
                                padding: 20,
                                border: 'none',
                                borderRadius: 'var(--la-radius-md)',
                                backgroundColor: 'var(--la-surface)',
                                boxShadow: 'var(--la-shadow-sm)',
                                fontFamily:
                                    'var(--la-font)',
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
                                        color: 'var(--la-text-strong)',
                                    }}>
                                    筛选选项
                                </h3>
                                <button
                                    onClick={clearAllFilters}
                                    style={{
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        backgroundColor: 'var(--la-surface-subtle)',
                                        border: 'none',
                                        borderRadius: 'var(--la-radius-xs)',
                                        cursor: 'pointer',
                                        color: 'var(--la-danger)',
                                        fontWeight: '600',
                                        transition:
                                            'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            'var(--la-danger-bg)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            'var(--la-surface-subtle)';
                                    }}>
                                    清除筛选
                                </button>
                            </div>

                            {/* 鍒嗙被杩囨护 */}
                            {allCategories.length > 0 && (
                                <div style={{ marginBottom: 20 }}>
                                    <div
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            marginBottom: 10,
                                            color: 'var(--text-muted)',
                                        }}>
                                        分类筛选
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
                                                            ? 'var(--la-accent)'
                                                            : 'var(--la-surface-subtle)',
                                                    color: selectedCategories.includes(
                                                        category,
                                                    )
                                                        ? 'var(--text-on-accent)'
                                                        : 'var(--la-text-strong)',
                                                    border: 'none',
                                                    borderRadius: 'var(--la-radius-sm)',
                                                    cursor: 'pointer',
                                                    fontWeight: '500',
                                                    transition:
                                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                }}>
                                                {category}
                                                {selectedCategories.includes(
                                                    category,
                                                ) && <Check size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 鏍囩杩囨护 */}
                            {allTags.length > 0 && (
                                <div style={{ marginBottom: 20 }}>
                                    <div
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            marginBottom: 10,
                                            color: 'var(--text-muted)',
                                        }}>
                                        标签筛选
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
                                                            ? 'var(--la-success)'
                                                            : 'var(--la-surface-subtle)',
                                                    color: selectedTags.includes(
                                                        tag,
                                                    )
                                                        ? 'var(--text-on-accent)'
                                                        : 'var(--la-text-strong)',
                                                    border: 'none',
                                                    borderRadius: 'var(--la-radius-sm)',
                                                    cursor: 'pointer',
                                                    fontWeight: '500',
                                                    transition:
                                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                }}>
                                                {tag}
                                                {selectedTags.includes(tag) &&
                                                    <Check size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 绛夌骇杩囨护 */}
                            {allLevels.length > 0 && (
                                <div style={{ marginBottom: 20 }}>
                                    <div
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            marginBottom: 10,
                                            color: 'var(--text-muted)',
                                        }}>
                                        等级筛选
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
                                                            ? 'var(--la-warning)'
                                                            : 'var(--la-surface-subtle)',
                                                    color: selectedLevels.includes(
                                                        level,
                                                    )
                                                        ? 'var(--text-on-accent)'
                                                        : 'var(--la-text-strong)',
                                                    border: 'none',
                                                    borderRadius: 'var(--la-radius-sm)',
                                                    cursor: 'pointer',
                                                    fontWeight: '500',
                                                    transition:
                                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                }}>
                                                {level}
                                                {selectedLevels.includes(
                                                    level,
                                                ) && <Check size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 璇嶆€ц繃婊?*/}
                            {allPartsOfSpeech.length > 0 && (
                                <div>
                                    <div
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            marginBottom: 10,
                                            color: 'var(--text-muted)',
                                        }}>
                                        词性筛选
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
                                                                ? 'var(--la-purple)'
                                                                : 'var(--la-surface-subtle)',
                                                        color: selectedPartsOfSpeech.includes(
                                                            partsOfSpeech,
                                                        )
                                                            ? 'var(--text-on-accent)'
                                                            : 'var(--la-text-strong)',
                                                        border: 'none',
                                                        borderRadius: 'var(--la-radius-sm)',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        transition:
                                                            'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                    }}>
                                                    {partsOfSpeech}
                                                    {selectedPartsOfSpeech.includes(
                                                        partsOfSpeech,
                                                    ) && <Check size={14} />}
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
                                    color: 'var(--text-muted)',
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
                    {/* 鍒楄〃瑙嗗浘琛ㄥご */}
                    {false && paginatedWords.length > 0 && (
                        <div className="la-word-list-header">
                            <div style={{ flex: '0 0 200px' }}>单词名称</div>
                            <div style={{ flex: '0 0 180px' }}>发音</div>
                            <div style={{ flex: '0 0 120px' }}>分类</div>
                            <div style={{ flex: '1' }}>标签</div>
                            <div
                                style={{
                                    flex: '0 0 80px',
                                    textAlign: 'center',
                                }}>
                                查询次数
                            </div>
                            <div
                                style={{
                                    flex: '0 0 60px',
                                    textAlign: 'center',
                                }}>
                                等级
                            </div>
                            <div
                                style={{
                                    flex: '0 0 120px',
                                    textAlign: 'center',
                                }}>
                                操作
                            </div>
                        </div>
                    )}
                    {/* 鍗曡瘝灞曠ず鍖哄煙 */}
                    <div
                        className={`la-word-results is-${displayMode}${
                            paginatedWords.length === 0 ? ' is-empty' : ''
                        }`}>
                        {paginatedWords.length === 0 ? (
                            <div className="la-word-empty-state">
                                {sortedWords.length === 0
                                    ? searchTerm ||
                                      selectedTags.length > 0 ||
                                      selectedCategories.length > 0
                                        ? '没有找到匹配的单词'
                                        : '暂无单词，点击上方按钮添加'
                                    : '没有更多单词了，请返回上一页'}
                            </div>
                        ) : (
                            paginatedWords.map((word) => (
                                <WordCard
                                    key={word.name}
                                    word={word}
                                    searchTerm={searchTerm}
                                    onEdit={() => handleEditClick(word)}
                                    onDelete={() => handleDeleteWord(word)}
                                    onViewDetail={() => handleViewWord(word)}
                                    onJumpToSource={() =>
                                        onJumpToSource(getWordId(word))
                                    }
                                    enableFullHighlight={enableFullHighlight}
                                />
                            ))
                        )}
                    </div>{' '}
                    {/* 鍒嗛〉鎺т欢 - iOS 椋庢牸 */}
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
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    backgroundColor:
                                        currentPage === 1
                                            ? 'var(--la-surface-subtle)'
                                            : 'var(--la-accent)',
                                    color:
                                        currentPage === 1
                                            ? 'var(--la-border)'
                                            : 'var(--la-surface)',
                                    WebkitTextFillColor:
                                        currentPage === 1
                                            ? 'var(--la-border)'
                                            : 'var(--la-surface)',
                                    border: 'none',
                                    borderRadius: 'var(--la-radius-sm)',
                                    cursor:
                                        currentPage === 1
                                            ? 'not-allowed'
                                            : 'pointer',
                                    transition:
                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    boxShadow:
                                        currentPage === 1
                                            ? 'none'
                                            : '0 2px 8px color-mix(in srgb, var(--la-accent) 22%, transparent)',
                                    fontFamily:
                                        'var(--la-font)',
                                    letterSpacing: '0',
                                }}
                                onMouseEnter={(e) => {
                                    if (currentPage !== 1) {
                                        e.currentTarget.style.transform =
                                            'scale(0.98)';
                                        e.currentTarget.style.boxShadow =
                                            '0 4px 12px color-mix(in srgb, var(--la-accent) 30%, transparent)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (currentPage !== 1) {
                                        e.currentTarget.style.transform =
                                            'scale(1)';
                                        e.currentTarget.style.boxShadow =
                                            '0 2px 8px color-mix(in srgb, var(--la-accent) 22%, transparent)';
                                    }
                                }}>
                                <ChevronLeft size={16} /> 上一页
                            </button>{' '}
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 6,
                                    alignItems: 'center',
                                }}>
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
                                                        padding: '0 4px',
                                                        fontSize: '15px',
                                                        color: 'var(--la-border)',
                                                        fontWeight: '600',
                                                        lineHeight: '40px',
                                                        userSelect: 'none',
                                                    }}>
                                                    路路路
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
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '15px',
                                                fontWeight: isCurrentPage
                                                    ? '700'
                                                    : '500',
                                                backgroundColor: isCurrentPage
                                                    ? 'var(--la-accent)'
                                                    : 'var(--la-surface-subtle)',
                                                color: isCurrentPage
                                                    ? 'var(--la-surface)'
                                                    : 'var(--la-text-strong)',
                                                WebkitTextFillColor:
                                                    isCurrentPage
                                                        ? 'var(--la-surface)'
                                                        : 'var(--la-text-strong)',
                                                border: 'none',
                                                borderRadius: 'var(--la-radius-sm)',
                                                cursor: 'pointer',
                                                boxShadow: isCurrentPage
                                                    ? '0 2px 8px color-mix(in srgb, var(--la-accent) 26%, transparent)'
                                                    : 'none',
                                                transition:
                                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                fontFamily:
                                                    'var(--la-font)',
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
                                    padding: '10px 20px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    backgroundColor:
                                        currentPage === totalPages
                                            ? 'var(--la-surface-subtle)'
                                            : 'var(--la-accent)',
                                    color:
                                        currentPage === totalPages
                                            ? 'var(--la-border)'
                                            : 'var(--la-surface)',
                                    WebkitTextFillColor:
                                        currentPage === totalPages
                                            ? 'var(--la-border)'
                                            : 'var(--la-surface)',
                                    border: 'none',
                                    borderRadius: 'var(--la-radius-sm)',
                                    cursor:
                                        currentPage === totalPages
                                            ? 'not-allowed'
                                            : 'pointer',
                                    transition:
                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    boxShadow:
                                        currentPage === totalPages
                                            ? 'none'
                                            : '0 2px 8px color-mix(in srgb, var(--la-accent) 22%, transparent)',
                                    fontFamily:
                                        'var(--la-font)',
                                    letterSpacing: '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                                onMouseEnter={(e) => {
                                    if (currentPage !== totalPages) {
                                        e.currentTarget.style.transform =
                                            'scale(0.98)';
                                        e.currentTarget.style.boxShadow =
                                            '0 4px 12px color-mix(in srgb, var(--la-accent) 30%, transparent)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (currentPage !== totalPages) {
                                        e.currentTarget.style.transform =
                                            'scale(1)';
                                        e.currentTarget.style.boxShadow =
                                            '0 2px 8px color-mix(in srgb, var(--la-accent) 22%, transparent)';
                                    }
                                }}>
                                下一页 <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}
            {viewMode === 'detail' && currentWord && (
                <>
                    <div className="la-detail-actions">
                        <button
                            onClick={handleBackToList}
                            className="la-detail-action la-detail-action-secondary">
                            <ChevronLeft size={16} /> 返回列表
                        </button>
                        <button
                            onClick={() => handleEditClick(currentWord)}
                            className="la-detail-action la-detail-action-primary">
                            <Edit2 size={16} /> 编辑单词
                        </button>
                    </div>

                    <div
                        className="la-word-detail">
                        <h1 className="la-word-detail-title">
                            {currentWord.name}
                        </h1>
                        <div
                            className="la-word-detail-meta">
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
                            </div>
                            {/* 鏄剧ず澶囨敞淇℃伅 */}
                            {currentWord.notes &&
                                currentWord.notes.trim() && (
                                    <div className="la-word-detail-note">
                                        <strong>备注:</strong>{' '}
                                        <RichText
                                            app={app}
                                            as="div"
                                            renderMarkdown
                                            sourcePath={markdownSourcePath}
                                            text={currentWord.notes}
                                        />
                                    </div>
                                )}
                        </div>{' '}
                        <div className="la-word-detail-content">
                            <h3 className="la-word-detail-section-title">
                                详细内容
                            </h3>
                            <WordDetailOutline
                                app={app}
                                markdownSourcePath={markdownSourcePath}
                                word={currentWord}
                            />
                        </div>
                    </div>
                </>
            )}{' '}
            {showAdd && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'color-mix(in srgb, black 45%, transparent)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        padding: '20px',
                    }}>
                    <div
                        style={{
                            backgroundColor: 'var(--la-surface-subtle)',
                            borderRadius: 'var(--la-radius-lg)',
                            maxWidth: '640px',
                            maxHeight: '88vh',
                            overflow: 'auto',
                            width: '100%',
                            boxShadow: '0 20px 60px color-mix(in srgb, black 30%, transparent)',
                            fontFamily:
                                'var(--la-font)',
                        }}>
                        {/* 寮圭獥鏍囬鏍?*/}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '20px 24px 16px',
                                borderBottom: '1px solid color-mix(in srgb, black 10%, transparent)',
                                backgroundColor: 'white',
                                borderRadius: '20px 20px 0 0',
                                position: 'sticky',
                                top: 0,
                                zIndex: 10,
                            }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                }}>
                                <div
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 'var(--la-radius-xs)',
                                        background: editTarget
                                            ? 'var(--la-gradient-warning)'
                                            : 'var(--la-gradient-success)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                    {editTarget ? (
                                        <Edit2
                                            size={18}
                                            color="white"
                                        />
                                    ) : (
                                        <Plus
                                            size={18}
                                            color="white"
                                        />
                                    )}
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: '18px',
                                            fontWeight: '700',
                                            color: 'var(--la-text-strong)',
                                        }}>
                                        {editTarget ? '编辑单词' : '添加单词'}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color: 'var(--la-text-muted)',
                                        }}>
                                        {editTarget
                                            ? '修改单词信息'
                                            : '填写新单词的详细信息'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAdd(false);
                                    setEditTarget(null);
                                    setErrorMessage('');
                                    setNewTagInput('');
                                    setForm(createEmptyWord());
                                }}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--la-border)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--la-text-muted)',
                                }}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* 琛ㄥ崟鍐呭 */}
                        <div style={{ padding: '16px 20px 24px' }}>
                            {/* 鍩烘湰淇℃伅鍗＄墖 */}
                            <div
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: 'var(--la-radius-sm)',
                                    padding: '4px 0',
                                    marginBottom: '16px',
                                    boxShadow: 'var(--la-shadow-xs)',
                                }}>
                                {' '}
                                {/* 鍗曡瘝鍚嶇О */}
                                <div
                                    style={{
                                        padding: '14px 16px',
                                        borderBottom: '1px solid var(--la-surface-subtle)',
                                    }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                        }}>
                                        <BookMarked
                                            size={16}
                                            color="var(--la-accent)"
                                            style={{ flexShrink: 0 }}
                                        />
                                        <label
                                            style={{
                                                fontSize: '15px',
                                                fontWeight: '500',
                                                color: 'var(--la-text-strong)',
                                                minWidth: 70,
                                            }}>
                                            单词名称
                                        </label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => {
                                                setForm({
                                                    ...form,
                                                    name: e.target.value,
                                                });
                                                if (errorMessage)
                                                    setErrorMessage('');
                                            }}
                                            placeholder="输入单词..."
                                            style={{
                                                flex: 1,
                                                border: 'none',
                                                outline: 'none',
                                                fontSize: '15px',
                                                color: 'var(--la-text-strong)',
                                                backgroundColor: 'transparent',
                                                textAlign: 'right',
                                                minHeight: '24px',
                                            }}
                                        />
                                    </div>
                                    {errorMessage && (
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                marginTop: '8px',
                                                padding: '8px 12px',
                                                backgroundColor: 'var(--la-danger-bg)',
                                                borderRadius: 'var(--la-radius-xs)',
                                                color: 'var(--la-danger)',
                                                fontSize: '13px',
                                            }}>
                                            <AlertCircle size={14} />
                                            {errorMessage}
                                        </div>
                                    )}
                                </div>{' '}
                                {/* 鍙戦煶 */}
                                <div
                                    style={{
                                        padding: '14px 16px',
                                        borderBottom: '1px solid var(--la-surface-subtle)',
                                    }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                        }}>
                                        <Hash
                                            size={16}
                                            color="var(--la-accent)"
                                            style={{ flexShrink: 0 }}
                                        />
                                        <label
                                            style={{
                                                fontSize: '15px',
                                                fontWeight: '500',
                                                color: 'var(--la-text-strong)',
                                                minWidth: 70,
                                            }}>
                                            发音
                                        </label>
                                        <input
                                            type="text"
                                            value={form.pronunciation}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    pronunciation:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="如 /word/"
                                            style={{
                                                flex: 1,
                                                border: 'none',
                                                outline: 'none',
                                                fontSize: '15px',
                                                color: 'var(--la-text-strong)',
                                                backgroundColor: 'transparent',
                                                textAlign: 'right',
                                                minHeight: '24px',
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* 鍒嗙被 */}
                                <div
                                    style={{
                                        padding: '14px 16px',
                                        borderBottom: '1px solid var(--la-surface-subtle)',
                                    }}>
                                    {/* 鏍囬琛?*/}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginBottom: '10px',
                                        }}>
                                        <Layers
                                            size={16}
                                            color="var(--la-accent)"
                                            style={{ flexShrink: 0 }}
                                        />
                                        <label
                                            style={{
                                                fontSize: '15px',
                                                fontWeight: '500',
                                                color: 'var(--la-text-strong)',
                                            }}>
                                            分类
                                        </label>
                                    </div>{' '}
                                    {/* 宸叉湁鍒嗙被 pill 閫夋嫨鍣?*/}
                                    {allCategories.length > 0 && (
                                        <div
                                            style={{
                                                paddingLeft: '26px',
                                                marginBottom: '10px',
                                            }}>
                                            <div
                                                style={{
                                                    fontSize: '12px',
                                                    color: 'var(--la-text-muted)',
                                                    marginBottom: '6px',
                                                }}>
                                                选择已有分类
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: '6px',
                                                }}>
                                                {allCategories.map(
                                                    (category) => {
                                                        const isSelected =
                                                            WordHelper.getCategory(
                                                                form,
                                                            ) === category;
                                                        return (
                                                            <button
                                                                key={category}
                                                                type="button"
                                                                onClick={() => {
                                                                    const newForm =
                                                                        {
                                                                            ...form,
                                                                        };
                                                                    WordHelper.setCategory(
                                                                        newForm,
                                                                        isSelected
                                                                            ? ''
                                                                            : category,
                                                                    );
                                                                    setForm(
                                                                        newForm,
                                                                    );
                                                                }}
                                                                style={{
                                                                    padding:
                                                                        '5px 14px',
                                                                    fontSize:
                                                                        '13px',
                                                                    fontWeight:
                                                                        isSelected
                                                                            ? '600'
                                                                            : '400',
                                                                    backgroundColor:
                                                                        isSelected
                                                                            ? 'var(--la-accent)'
                                                                            : 'var(--la-surface-subtle)',
                                                                    color: isSelected
                                                                        ? 'var(--la-surface)'
                                                                        : 'var(--la-text-strong)',
                                                                    border: isSelected
                                                                        ? '1.5px solid var(--la-accent)'
                                                                        : '1.5px solid var(--la-border)',
                                                                    borderRadius:
                                                                        '20px',
                                                                    cursor: 'pointer',
                                                                    transition:
                                                                        'all 0.15s',
                                                                    display:
                                                                        'flex',
                                                                    alignItems:
                                                                        'center',
                                                                    gap: '4px',
                                                                }}>
                                                                {isSelected && (
                                                                    <Check
                                                                        size={
                                                                            11
                                                                        }
                                                                    />
                                                                )}
                                                                {category}
                                                            </button>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {/* 鏂板缓鍒嗙被杈撳叆妗?*/}
                                    <div style={{ paddingLeft: '26px' }}>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: 'var(--la-text-muted)',
                                                marginBottom: '5px',
                                            }}>
                                            {allCategories.length > 0
                                                ? '或输入新分类名称'
                                                : '输入分类名称'}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="新建分类名称..."
                                            value={
                                                allCategories.includes(
                                                    WordHelper.getCategory(
                                                        form,
                                                    ),
                                                )
                                                    ? ''
                                                    : WordHelper.getCategory(
                                                          form,
                                                      )
                                            }
                                            onChange={(e) => {
                                                const newForm = { ...form };
                                                WordHelper.setCategory(
                                                    newForm,
                                                    e.target.value,
                                                );
                                                setForm(newForm);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '9px 12px',
                                                fontSize: '15px',
                                                border: '1.5px solid var(--la-border)',
                                                borderRadius: 'var(--la-radius-xs)',
                                                backgroundColor: 'var(--la-surface)',
                                                color: 'var(--la-text-strong)',
                                                outline: 'none',
                                                boxSizing: 'border-box',
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* 绛夌骇 */}
                                <div style={{ padding: '14px 16px' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                        }}>
                                        <Activity
                                            size={16}
                                            color="var(--la-accent)"
                                            style={{ flexShrink: 0 }}
                                        />{' '}
                                        <label
                                            style={{
                                                fontSize: '15px',
                                                fontWeight: '500',
                                                color: 'var(--la-text-strong)',
                                                minWidth: 70,
                                            }}>
                                            等级
                                        </label>
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: '6px',
                                                flex: 1,
                                            }}>
                                            {['初级', '中级', '高级'].map(
                                                (level) => {
                                                    const isSelected =
                                                        WordHelper.getLevel(
                                                            form,
                                                        ) === level;
                                                    const colors: Record<
                                                        string,
                                                        {
                                                            bg: string;
                                                            border: string;
                                                            text: string;
                                                        }
                                                    > = {
                                                        '初级': {
                                                            bg: 'var(--la-success)',
                                                            border: 'var(--la-success)',
                                                            text: 'var(--text-on-accent)',
                                                        },
                                                        '中级': {
                                                            bg: 'var(--la-warning)',
                                                            border: 'var(--la-warning)',
                                                            text: 'var(--text-on-accent)',
                                                        },
                                                        '高级': {
                                                            bg: 'var(--la-danger)',
                                                            border: 'var(--la-danger)',
                                                            text: 'var(--text-on-accent)',
                                                        },
                                                    };
                                                    return (
                                                        <button
                                                            key={level}
                                                            type="button"
                                                            onClick={() => {
                                                                const newForm =
                                                                    { ...form };
                                                                WordHelper.setLevel(
                                                                    newForm,
                                                                    isSelected
                                                                        ? ''
                                                                        : level,
                                                                );
                                                                setForm(
                                                                    newForm,
                                                                );
                                                            }}
                                                            style={{
                                                                flex: 1,
                                                                padding:
                                                                    '8px 0',
                                                                fontSize:
                                                                    '14px',
                                                                fontWeight:
                                                                    '600',
                                                                backgroundColor:
                                                                    isSelected
                                                                        ? colors[
                                                                              level
                                                                          ].bg
                                                                        : 'var(--la-surface-subtle)',
                                                                color: isSelected
                                                                    ? colors[
                                                                          level
                                                                      ].text
                                                                    : 'var(--la-text-muted)',
                                                                border: `1.5px solid ${
                                                                    isSelected
                                                                        ? colors[
                                                                              level
                                                                          ]
                                                                              .border
                                                                        : 'var(--la-border)'
                                                                }`,
                                                                borderRadius:
                                                                    '10px',
                                                                cursor: 'pointer',
                                                                transition:
                                                                    'all 0.15s',
                                                                textAlign:
                                                                    'center',
                                                            }}>
                                                            {level}
                                                        </button>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 鏍囩鍗＄墖 */}
                            <div
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: 'var(--la-radius-sm)',
                                    padding: '16px',
                                    marginBottom: '16px',
                                    boxShadow: 'var(--la-shadow-xs)',
                                }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '12px',
                                    }}>
                                    <Tag
                                        size={16}
                                        color="var(--la-accent)"
                                    />
                                    <span
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            color: 'var(--la-text-strong)',
                                        }}>
                                        标签
                                    </span>
                                </div>

                                {/* 宸查€夋爣绛?*/}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '6px',
                                        minHeight: '38px',
                                        padding: '8px 10px',
                                        border: '1.5px dashed var(--la-border)',
                                        borderRadius: 'var(--la-radius-xs)',
                                        backgroundColor: 'var(--la-surface-raised)',
                                        marginBottom: '12px',
                                    }}>
                                    {WordHelper.getTags(form).length === 0 ? (
                                        <span
                                            style={{
                                                color: 'var(--la-border)',
                                                fontSize: '14px',
                                                lineHeight: '22px',
                                            }}>
                                            请选择或添加标签
                                        </span>
                                    ) : (
                                        WordHelper.getTags(form).map(
                                            (tag, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        padding:
                                                            '3px 10px 3px 10px',
                                                        background:
                                                            'var(--la-gradient-accent)',
                                                        color: 'white',
                                                        borderRadius: 'var(--la-radius-lg)',
                                                        fontSize: '13px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        fontWeight: '500',
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
                                                            background:
                                                                'color-mix(in srgb, white 25%, transparent)',
                                                            border: 'none',
                                                            color: 'white',
                                                            cursor: 'pointer',
                                                            padding: '0',
                                                            width: '16px',
                                                            height: '16px',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'center',
                                                            lineHeight: 1,
                                                        }}>
                                                        <X size={10} />
                                                    </button>
                                                </span>
                                            ),
                                        )
                                    )}
                                </div>

                                {/* 宸叉湁鏍囩閫夋嫨 */}
                                {allTags.length > 0 && (
                                    <div style={{ marginBottom: '12px' }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: 'var(--la-text-muted)',
                                                marginBottom: '8px',
                                            }}>
                                            <BookOpen
                                                size={13}
                                                color="var(--la-text-muted)"
                                            />
                                            从已有标签中选择:
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '6px',
                                                maxHeight: '96px',
                                                overflowY: 'auto',
                                                padding: '2px',
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
                                                            padding: '4px 12px',
                                                            fontSize: '13px',
                                                            backgroundColor:
                                                                'var(--la-surface-subtle)',
                                                            border: '1px solid var(--la-border)',
                                                            borderRadius:
                                                                '20px',
                                                            cursor: 'pointer',
                                                            color: 'var(--la-text-strong)',
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            gap: '4px',
                                                            transition:
                                                                'all 0.15s',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor =
                                                                'var(--la-success)';
                                                            e.currentTarget.style.color =
                                                                'var(--text-on-accent)';
                                                            e.currentTarget.style.borderColor =
                                                                'var(--la-success)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor =
                                                                'var(--la-surface-subtle)';
                                                            e.currentTarget.style.color =
                                                                'var(--la-text-strong)';
                                                            e.currentTarget.style.borderColor =
                                                                'var(--la-border)';
                                                        }}>
                                                        <Plus size={12} />
                                                        {tag}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* 鏂板缓鏍囩杈撳叆 */}
                                <div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: 'var(--la-text-muted)',
                                            marginBottom: '8px',
                                        }}>
                                        <Sparkles
                                            size={13}
                                            color="var(--la-warning)"
                                        />
                                        添加新标签
                                    </div>
                                    <div
                                        style={{ display: 'flex', gap: '8px' }}>
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
                                                flex: 1,
                                                padding: '8px 12px',
                                                fontSize: '14px',
                                                border: '1px solid var(--la-border)',
                                                borderRadius: 'var(--la-radius-xs)',
                                                backgroundColor: 'var(--la-surface-raised)',
                                                color: 'var(--la-text-strong)',
                                                outline: 'none',
                                            }}
                                        />
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
                                                padding: '8px 16px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                background:
                                                    'var(--la-gradient-success)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 'var(--la-radius-xs)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                boxShadow:
                                                    '0 2px 8px color-mix(in srgb, var(--la-success) 24%, transparent)',
                                            }}>
                                            <Plus size={14} />
                                            添加
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 璇嶆€ф杩板崱鐗?*/}
                            <div
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: 'var(--la-radius-sm)',
                                    padding: '16px',
                                    marginBottom: '16px',
                                    boxShadow: 'var(--la-shadow-xs)',
                                }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '12px',
                                    }}>
                                    <FileText
                                        size={16}
                                        color="var(--la-accent)"
                                    />
                                    <span
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            color: 'var(--la-text-strong)',
                                        }}>
                                        词性概览
                                    </span>
                                </div>

                                {/* 宸查€夎瘝鎬у睍绀?*/}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '6px',
                                        minHeight: '38px',
                                        padding: '8px 10px',
                                        border: '1.5px dashed var(--la-border)',
                                        borderRadius: 'var(--la-radius-xs)',
                                        backgroundColor: 'var(--la-surface-raised)',
                                        marginBottom: '14px',
                                    }}>
                                    {form.partsOfSpeech
                                        .split(',')
                                        .filter((p) => p.trim()).length ===
                                    0 ? (
                                        <span
                                            style={{
                                                color: 'var(--la-border)',
                                                fontSize: '14px',
                                                lineHeight: '22px',
                                            }}>
                                            点击下方选项添加词性
                                        </span>
                                    ) : (
                                        form.partsOfSpeech
                                            .split(',')
                                            .filter((p) => p.trim())
                                            .map((selectedType, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        padding:
                                                            '3px 10px 3px 10px',
                                                        background:
                                                            'var(--la-gradient-purple)',
                                                        color: 'white',
                                                        borderRadius: 'var(--la-radius-lg)',
                                                        fontSize: '13px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        fontWeight: '500',
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
                                                                    types.join(
                                                                        ',',
                                                                    ),
                                                            });
                                                        }}
                                                        style={{
                                                            background:
                                                                'color-mix(in srgb, white 25%, transparent)',
                                                            border: 'none',
                                                            color: 'white',
                                                            cursor: 'pointer',
                                                            padding: '0',
                                                            width: '16px',
                                                            height: '16px',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'center',
                                                        }}>
                                                        <X size={10} />
                                                    </button>
                                                </span>
                                            ))
                                    )}
                                </div>

                                {/* 鍒嗙粍璇嶆€ч€夐」 */}
                                {Object.entries(PARTS_OF_SPEECH_GROUPS).map(
                                    ([groupName, options]) => (
                                        <div
                                            key={groupName}
                                            style={{ marginBottom: '12px' }}>
                                            <div
                                                style={{
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: 'var(--la-text-muted)',
                                                    marginBottom: '6px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                }}>
                                                {groupName}
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: '6px',
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
                                                                    '5px 12px',
                                                                fontSize:
                                                                    '13px',
                                                                backgroundColor:
                                                                    isSelected
                                                                        ? 'var(--la-indigo)'
                                                                        : 'var(--la-surface-subtle)',
                                                                color: isSelected
                                                                    ? 'white'
                                                                    : 'var(--la-text-strong)',
                                                                border: isSelected
                                                                    ? '1px solid var(--la-indigo)'
                                                                    : '1px solid var(--la-border)',
                                                                borderRadius:
                                                                    '20px',
                                                                cursor: 'pointer',
                                                                transition:
                                                                    'all 0.15s',
                                                                fontWeight:
                                                                    isSelected
                                                                        ? '600'
                                                                        : '400',
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                gap: '4px',
                                                            }}>
                                                            {isSelected && (
                                                                <Check
                                                                    size={11}
                                                                />
                                                            )}
                                                            {option}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>

                            {/* 澶囨敞鍗＄墖 */}
                            <div
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: 'var(--la-radius-sm)',
                                    padding: '16px',
                                    marginBottom: '16px',
                                    boxShadow: 'var(--la-shadow-xs)',
                                }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '10px',
                                    }}>
                                    <AlignLeft
                                        size={16}
                                        color="var(--la-accent)"
                                    />
                                    <span
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            color: 'var(--la-text-strong)',
                                        }}>
                                        备注
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '12px',
                                            color: 'var(--la-text-muted)',
                                        }}>
                                        记忆技巧、学习笔记等
                                    </span>
                                </div>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            notes: e.target.value,
                                        })
                                    }
                                    placeholder="在此输入记忆技巧、学习笔记或其他备注信息..."
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        border: '1px solid var(--la-border)',
                                        borderRadius: 'var(--la-radius-xs)',
                                        resize: 'vertical',
                                        minHeight: '72px',
                                        maxHeight: '140px',
                                        backgroundColor: 'var(--la-surface-raised)',
                                        color: 'var(--la-text-strong)',
                                        outline: 'none',
                                        lineHeight: '1.5',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>

                            {/* 璇︾粏鍐呭鍗＄墖 */}
                            <div
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: 'var(--la-radius-sm)',
                                    padding: '16px',
                                    marginBottom: '16px',
                                    boxShadow: 'var(--la-shadow-xs)',
                                }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '14px',
                                    }}>
                                    <BookOpen
                                        size={16}
                                        color="var(--la-accent)"
                                    />
                                    <span
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            color: 'var(--la-text-strong)',
                                        }}>
                                        详细内容
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '12px',
                                            color: 'var(--la-text-muted)',
                                        }}>
                                        词性 / 定义 / 例句
                                    </span>
                                </div>

                                {form.content.map((part, partIndex) => (
                                    <div
                                        key={partIndex}
                                        style={{
                                            marginBottom: '12px',
                                            border: '1px solid var(--la-border)',
                                            borderRadius: 'var(--la-radius-sm)',
                                            overflow: 'hidden',
                                        }}>
                                        {/* 璇嶆€ц */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '10px 14px',
                                                backgroundColor: 'var(--la-surface-subtle)',
                                                borderBottom:
                                                    part.definitions.length > 0
                                                        ? '1px solid var(--la-border)'
                                                        : 'none',
                                            }}>
                                            <Layers
                                                size={14}
                                                color="var(--la-indigo)"
                                                style={{ flexShrink: 0 }}
                                            />
                                            <select
                                                value={part.type}
                                                onChange={(e) => {
                                                    const content = [
                                                        ...form.content,
                                                    ];
                                                    content[partIndex].type =
                                                        e.target.value;
                                                    setForm({
                                                        ...form,
                                                        content,
                                                    });
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '4px 8px',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    border: '1px solid var(--la-border)',
                                                    borderRadius: 'var(--la-radius-xs)',
                                                    backgroundColor: 'white',
                                                    color: 'var(--la-text-strong)',
                                                    outline: 'none',
                                                }}>
                                                <option value="">
                                                    请选择词性
                                                </option>
                                                {Object.entries(
                                                    PARTS_OF_SPEECH_GROUPS,
                                                ).map(
                                                    ([groupName, options]) => (
                                                        <optgroup
                                                            key={groupName}
                                                            label={groupName}>
                                                            {options.map(
                                                                (option) => (
                                                                    <option
                                                                        key={
                                                                            option
                                                                        }
                                                                        value={
                                                                            option
                                                                        }>
                                                                        {option}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </optgroup>
                                                    ),
                                                )}
                                            </select>
                                            {form.content.length > 1 && (
                                                <button
                                                    onClick={() =>
                                                        handleRemovePart(
                                                            partIndex,
                                                        )
                                                    }
                                                    style={{
                                                        padding: '4px 10px',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        backgroundColor:
                                                            'var(--la-danger-bg)',
                                                        color: 'var(--la-danger)',
                                                        border: '1px solid color-mix(in srgb, var(--la-danger) 32%, var(--la-border))',
                                                        borderRadius: 'var(--la-radius-xs)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        flexShrink: 0,
                                                    }}>
                                                    <Trash2 size={12} />
                                                    删除
                                                </button>
                                            )}
                                        </div>

                                        {/* 瀹氫箟鍒楄〃 */}
                                        {part.definitions.map(
                                            (def, defIndex) => (
                                                <div
                                                    key={defIndex}
                                                    style={{
                                                        padding: '10px 14px',
                                                        borderBottom:
                                                            '1px solid var(--la-surface-subtle)',
                                                        backgroundColor:
                                                            'white',
                                                    }}>
                                                    {/* 瀹氫箟琛?*/}
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            gap: '8px',
                                                            marginBottom: '8px',
                                                        }}>
                                                        <AlignLeft
                                                            size={13}
                                                            color="var(--la-success)"
                                                            style={{
                                                                flexShrink: 0,
                                                            }}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={
                                                                def.definition
                                                            }
                                                            placeholder="输入定义..."
                                                            onChange={(e) => {
                                                                const content =
                                                                    [
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
                                                                flex: 1,
                                                                padding:
                                                                    '6px 10px',
                                                                fontSize:
                                                                    '14px',
                                                                border: '1px solid var(--la-border)',
                                                                borderRadius:
                                                                    '8px',
                                                                backgroundColor:
                                                                    'var(--la-surface-raised)',
                                                                color: 'var(--la-text-strong)',
                                                                outline: 'none',
                                                            }}
                                                        />
                                                        {part.definitions
                                                            .length > 1 && (
                                                            <button
                                                                onClick={() =>
                                                                    handleRemoveDefinition(
                                                                        partIndex,
                                                                        defIndex,
                                                                    )
                                                                }
                                                                style={{
                                                                    width: 26,
                                                                    height: 26,
                                                                    border: 'none',
                                                                    backgroundColor:
                                                                        'var(--la-danger-bg)',
                                                                    color: 'var(--la-danger)',
                                                                    borderRadius:
                                                                        '6px',
                                                                    cursor: 'pointer',
                                                                    display:
                                                                        'flex',
                                                                    alignItems:
                                                                        'center',
                                                                    justifyContent:
                                                                        'center',
                                                                    flexShrink: 0,
                                                                }}>
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* 渚嬪彞鍒楄〃 */}
                                                    {def.examples.map(
                                                        (example, exIndex) => (
                                                            <div
                                                                key={exIndex}
                                                                style={{
                                                                    display:
                                                                        'flex',
                                                                    alignItems:
                                                                        'center',
                                                                    gap: '8px',
                                                                    marginBottom:
                                                                        '6px',
                                                                    paddingLeft:
                                                                        '20px',
                                                                }}>
                                                                <MessageSquare
                                                                    size={12}
                                                                    color="var(--la-warning)"
                                                                    style={{
                                                                        flexShrink: 0,
                                                                    }}
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        example.text
                                                                    }
                                                                    placeholder="输入例句..."
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const content =
                                                                            [
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
                                                                        setForm(
                                                                            {
                                                                                ...form,
                                                                                content,
                                                                            },
                                                                        );
                                                                    }}
                                                                    style={{
                                                                        flex: 1,
                                                                        padding:
                                                                            '5px 10px',
                                                                        fontSize:
                                                                            '13px',
                                                                        border: '1px solid var(--la-border)',
                                                                        borderRadius:
                                                                            '8px',
                                                                        backgroundColor:
                                                                            'var(--la-surface-raised)',
                                                                        color: 'var(--la-text-strong)',
                                                                        outline:
                                                                            'none',
                                                                    }}
                                                                />
                                                                <button
                                                                    onClick={() =>
                                                                        handleRemoveExample(
                                                                            partIndex,
                                                                            defIndex,
                                                                            exIndex,
                                                                        )
                                                                    }
                                                                    style={{
                                                                        width: 24,
                                                                        height: 24,
                                                                        border: 'none',
                                                                        backgroundColor:
                                                                            'var(--la-danger-bg)',
                                                                        color: 'var(--la-danger)',
                                                                        borderRadius:
                                                                            '6px',
                                                                        cursor: 'pointer',
                                                                        display:
                                                                            'flex',
                                                                        alignItems:
                                                                            'center',
                                                                        justifyContent:
                                                                            'center',
                                                                        flexShrink: 0,
                                                                    }}>
                                                                    <X
                                                                        size={
                                                                            11
                                                                        }
                                                                    />
                                                                </button>
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
                                                        style={{
                                                            marginTop: '4px',
                                                            marginLeft: '20px',
                                                            padding: '4px 10px',
                                                            fontSize: '12px',
                                                            backgroundColor:
                                                                'transparent',
                                                            color: 'var(--la-warning)',
                                                            border: '1px solid var(--la-warning)',
                                                            borderRadius: 'var(--la-radius-xs)',
                                                            cursor: 'pointer',
                                                            display:
                                                                'inline-flex',
                                                            alignItems:
                                                                'center',
                                                            gap: '4px',
                                                        }}>
                                                        <Plus size={11} />
                                                        添加例句
                                                    </button>
                                                </div>
                                            ),
                                        )}

                                        {/* 娣诲姞瀹氫箟鎸夐挳 */}
                                        <div
                                            style={{
                                                padding: '8px 14px',
                                                backgroundColor: 'white',
                                            }}>
                                            <button
                                                onClick={() =>
                                                    handleAddDefinition(
                                                        partIndex,
                                                    )
                                                }
                                                style={{
                                                    padding: '5px 12px',
                                                    fontSize: '13px',
                                                    backgroundColor:
                                                        'transparent',
                                                    color: 'var(--la-success)',
                                                    border: '1px solid var(--la-success)',
                                                    borderRadius: 'var(--la-radius-xs)',
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                }}>
                                                <Plus size={12} />
                                                添加定义
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={handleAddPart}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        backgroundColor: 'var(--la-surface-subtle)',
                                        color: 'var(--la-accent)',
                                        border: '1.5px dashed var(--la-accent)',
                                        borderRadius: 'var(--la-radius-sm)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        marginTop: '4px',
                                    }}>
                                    <Plus size={15} />
                                    添加词性
                                </button>
                            </div>

                            {/* 搴曢儴鎿嶄綔鎸夐挳 */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => {
                                        setShowAdd(false);
                                        setEditTarget(null);
                                        setErrorMessage('');
                                        setNewTagInput('');
                                        setForm(createEmptyWord());
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        backgroundColor: 'var(--la-surface-subtle)',
                                        color: 'var(--la-text-muted)',
                                        border: 'none',
                                        borderRadius: 'var(--la-radius-sm)',
                                        cursor: 'pointer',
                                    }}>
                                    取消
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    style={{
                                        flex: 2,
                                        padding: '14px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        background: editTarget
                                            ? 'var(--la-gradient-warning)'
                                            : 'var(--la-gradient-success)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--la-radius-sm)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        boxShadow: editTarget
                                            ? '0 4px 16px color-mix(in srgb, var(--la-warning) 28%, transparent)'
                                            : '0 4px 16px color-mix(in srgb, var(--la-success) 28%, transparent)',
                                    }}>
                                    {editTarget ? (
                                        <Edit2 size={17} />
                                    ) : (
                                        <Plus size={17} />
                                    )}
                                    {editTarget ? '保存更新' : '添加单词'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

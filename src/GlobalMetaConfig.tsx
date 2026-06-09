// 全局元数据配置组件
import React, { useState, useEffect } from 'react';
import { GlobalMetaManager, GlobalMetaConfig } from './GlobalMetaManager';
import { formatTimestampForDisplay } from './utils/date';
import {
    AlertTriangle,
    BarChart2,
    CheckCircle,
    FileText,
    Folder,
    HardDrive,
    Layers,
    Lightbulb,
    Loader2,
    Plus,
    Search,
    Settings,
    Tag,
    Wrench,
} from 'lucide-react';

interface GlobalMetaConfigProps {
    words?: any[]; // 可选的单词数组用于统计和管理
    onWordsUpdate?: (words: any[]) => void; // 单词更新回调
}

const GlobalMetaConfigComponent: React.FC<GlobalMetaConfigProps> = ({
    words = [],
    onWordsUpdate,
}) => {
    const [config, setConfig] = useState<GlobalMetaConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<
        'tags' | 'categories' | 'manage' | 'stats'
    >('tags');
    const [newTag, setNewTag] = useState({ alias: '', fullName: '' });
    const [newCategory, setNewCategory] = useState({ alias: '', fullName: '' });
    const [editingTag, setEditingTag] = useState<{
        alias: string;
        fullName: string;
    } | null>(null);
    const [editingCategory, setEditingCategory] = useState<{
        alias: string;
        fullName: string;
    } | null>(null);
    const [usageStats, setUsageStats] = useState<any>(null);

    const globalMetaManager = GlobalMetaManager.getInstance();

    useEffect(() => {
        loadConfig();
    }, []);
    const loadConfig = () => {
        setIsLoading(true);
        const currentConfig = globalMetaManager.getConfig();
        setConfig(currentConfig);

        // 加载使用统计
        if (words.length > 0) {
            const stats = globalMetaManager.getUsageStats(words);
            setUsageStats(stats);
        }

        setIsLoading(false);
    };

    const handleAddTag = () => {
        if (newTag.alias && newTag.fullName) {
            globalMetaManager.addTagAlias(newTag.alias, newTag.fullName);
            setNewTag({ alias: '', fullName: '' });
            loadConfig();
        }
    };

    const handleAddCategory = () => {
        if (newCategory.alias && newCategory.fullName) {
            globalMetaManager.addCategoryAlias(
                newCategory.alias,
                newCategory.fullName,
            );
            setNewCategory({ alias: '', fullName: '' });
            loadConfig();
        }
    };

    const handleEditTag = (
        alias: string,
        newFullName: string,
        updateWords: boolean = false,
    ) => {
        if (!newFullName.trim()) return;

        if (updateWords && words.length > 0 && onWordsUpdate) {
            // 更新单词中的使用
            const updatedWords = globalMetaManager.updateTagAliasInWords(
                alias,
                newFullName,
                words,
            );
            onWordsUpdate(updatedWords);
        }

        globalMetaManager.updateTagName(alias, newFullName);
        setEditingTag(null);
        loadConfig();
    };

    const handleEditCategory = (
        alias: string,
        newFullName: string,
        updateWords: boolean = false,
    ) => {
        if (!newFullName.trim()) return;

        if (updateWords && words.length > 0 && onWordsUpdate) {
            // 更新单词中的使用
            const updatedWords = globalMetaManager.updateCategoryAliasInWords(
                alias,
                newFullName,
                words,
            );
            onWordsUpdate(updatedWords);
        }

        globalMetaManager.updateCategoryName(alias, newFullName);
        setEditingCategory(null);
        loadConfig();
    };
    const handleDeleteTag = (
        alias: string,
        _removeFromWords: boolean = false,
    ) => {
        if (!config) return;

        const tagName = config.tags[alias];
        const usedWords = globalMetaManager.findWordsUsingTagAlias(
            alias,
            words,
        );

        if (usedWords.length > 0) {
            // 对于有使用的标签，提供选择
            const choice = confirm(
                `标签 "${tagName}" (${alias}) 被 ${
                    usedWords.length
                } 个单词使用：\n${usedWords
                    .slice(0, 5)
                    .map((w) => w.name)
                    .join(', ')}${
                    usedWords.length > 5 ? '...' : ''
                }\n\n点击"确定"将同时从这些单词中移除此标签\n点击"取消"将保留单词中的标签引用（可能变为无效）`,
            );

            if (choice) {
                // 用户选择移除引用
                if (onWordsUpdate) {
                    const updatedWords =
                        globalMetaManager.removeTagAliasFromWords(alias, words);
                    onWordsUpdate(updatedWords);
                }
                globalMetaManager.deleteTagMapping(alias);
                loadConfig();
            }
        } else {
            // 未使用的标签直接删除
            if (
                confirm(`确定要删除未使用的标签 "${tagName}" (${alias}) 吗？`)
            ) {
                globalMetaManager.deleteTagMapping(alias);
                loadConfig();
            }
        }
    };
    const handleDeleteCategory = (
        alias: string,
        _removeFromWords: boolean = false,
    ) => {
        if (!config) return;

        const categoryName = config.categories[alias];
        const usedWords = globalMetaManager.findWordsUsingCategoryAlias(
            alias,
            words,
        );

        if (usedWords.length > 0) {
            // 对于有使用的分类，提供选择
            const choice = confirm(
                `分类 "${categoryName}" (${alias}) 被 ${
                    usedWords.length
                } 个单词使用：\n${usedWords
                    .slice(0, 5)
                    .map((w) => w.name)
                    .join(', ')}${
                    usedWords.length > 5 ? '...' : ''
                }\n\n点击"确定"将同时清空这些单词的分类\n点击"取消"将保留单词中的分类引用（可能变为无效）`,
            );

            if (choice) {
                // 用户选择移除引用
                if (onWordsUpdate) {
                    const updatedWords =
                        globalMetaManager.removeCategoryAliasFromWords(
                            alias,
                            words,
                        );
                    onWordsUpdate(updatedWords);
                }
                globalMetaManager.deleteCategoryMapping(alias);
                loadConfig();
            }
        } else {
            // 未使用的分类直接删除
            if (
                confirm(
                    `确定要删除未使用的分类 "${categoryName}" (${alias}) 吗？`,
                )
            ) {
                globalMetaManager.deleteCategoryMapping(alias);
                loadConfig();
            }
        }
    };

    if (isLoading) {
        return (
            <div
                className="la-page la-global-meta-page la-empty-state"
                style={{ padding: '20px', textAlign: 'center' }}>
                <div>
                    <Loader2 size={16} /> 加载配置中...
                </div>
            </div>
        );
    }

    if (!config) {
        return (
            <div
                className="la-page la-global-meta-page la-empty-state"
                style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div>
                    <AlertTriangle size={16} /> 无法加载全局配置
                </div>
            </div>
        );
    }

    const stats = globalMetaManager.getStats();
    return (
        <div
            className="la-page la-global-meta-page"
            style={{
                padding: '20px',
                maxWidth: '900px',
                fontFamily:
                    'var(--la-font)',
            }}>
            {' '}
            {/* iOS 风格标题栏 */}
            <div style={{ marginBottom: '24px' }}>
                <h2
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '34px',
                        fontWeight: '700',
                        color: 'var(--la-text-strong)',
                        letterSpacing: '0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                    <Layers
                        size={32}
                        color="var(--la-accent)"
                    />
                    全局元数据配置
                </h2>
                <p style={{ margin: 0, color: 'var(--la-text-muted)', fontSize: '17px' }}>
                    管理标签和分类的别名映射，节省存储空间
                </p>
            </div>{' '}
            {/* iOS 风格选项卡 */}
            <div
                style={{
                    marginBottom: '24px',
                    backgroundColor: 'var(--la-surface)',
                    borderRadius: 'var(--la-radius-md)',
                    padding: '6px',
                    boxShadow: 'var(--la-shadow-sm)',
                }}>
                {' '}
                <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                        {
                            id: 'tags',
                            icon: <Tag size={15} />,
                            label: '标签管理',
                            count: Object.keys(config.tags).length,
                        },
                        {
                            id: 'categories',
                            icon: <Folder size={15} />,
                            label: '分类管理',
                            count: Object.keys(config.categories).length,
                        },
                        {
                            id: 'manage',
                            icon: <Settings size={15} />,
                            label: '高级管理',
                            count: undefined,
                        },
                        {
                            id: 'stats',
                            icon: <BarChart2 size={15} />,
                            label: '统计信息',
                            count: undefined,
                        },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                flex: 1,
                                padding: '10px 12px',
                                border: 'none',
                                borderRadius: 'var(--la-radius-sm)',
                                backgroundColor:
                                    activeTab === tab.id
                                        ? 'var(--la-accent)'
                                        : 'transparent',
                                color:
                                    activeTab === tab.id
                                        ? 'var(--la-surface)'
                                        : 'var(--la-text-muted)',
                                WebkitTextFillColor:
                                    activeTab === tab.id
                                        ? 'var(--la-surface)'
                                        : 'var(--la-text-muted)',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition:
                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                boxShadow:
                                    activeTab === tab.id
                                        ? '0 2px 8px color-mix(in srgb, var(--la-accent) 22%, transparent)'
                                        : 'none',
                            }}>
                            <span
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    opacity: activeTab === tab.id ? 1 : 0.7,
                                }}>
                                {tab.icon}
                            </span>
                            {tab.label}
                            {tab.count !== undefined && (
                                <span
                                    style={{
                                        backgroundColor:
                                            activeTab === tab.id
                                                ? 'color-mix(in srgb, white 25%, transparent)'
                                                : 'var(--la-surface-subtle)',
                                        color:
                                            activeTab === tab.id
                                                ? 'var(--la-surface)'
                                                : 'var(--la-text-muted)',
                                        WebkitTextFillColor:
                                            activeTab === tab.id
                                                ? 'var(--la-surface)'
                                                : 'var(--la-text-muted)',
                                        padding: '1px 7px',
                                        borderRadius: 'var(--la-radius-xs)',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        minWidth: '22px',
                                        textAlign: 'center',
                                        lineHeight: '18px',
                                    }}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>{' '}
            {/* 标签管理 */}
            {activeTab === 'tags' && (
                <div style={{ paddingBottom: '40px' }}>
                    <h3
                        style={{
                            margin: '0 0 16px 0',
                            fontSize: '22px',
                            fontWeight: '600',
                            color: 'var(--la-text-strong)',
                        }}>
                        标签别名管理
                    </h3>
                    {/* iOS 风格添加新标签 */}
                    <div
                        style={{
                            backgroundColor: 'var(--la-surface)',
                            padding: '20px',
                            borderRadius: 'var(--la-radius-md)',
                            marginBottom: '20px',
                            border: 'none',
                            boxShadow: 'var(--la-shadow-sm)',
                        }}>
                        <h4
                            style={{
                                margin: '0 0 16px 0',
                                fontSize: '17px',
                                fontWeight: '600',
                                color: 'var(--text-muted)',
                            }}>
                            <Plus size={18} /> 添加新标签别名
                        </h4>
                        <div
                            style={{
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'center',
                            }}>
                            <input
                                type="text"
                                placeholder="别名 (如: t1)"
                                value={newTag.alias}
                                onChange={(e) =>
                                    setNewTag({
                                        ...newTag,
                                        alias: e.target.value,
                                    })
                                }
                                style={{
                                    padding: '12px 16px',
                                    border: 'none',
                                    borderRadius: 'var(--la-radius-sm)',
                                    fontSize: '15px',
                                    width: '140px',
                                    backgroundColor: 'var(--la-surface-subtle)',
                                    color: 'var(--la-text-strong)',
                                    outline: 'none',
                                    fontFamily:
                                        'var(--la-font)',
                                }}
                            />
                            <span
                                style={{ color: 'var(--la-text-muted)', fontSize: '18px' }}>
                                →
                            </span>
                            <input
                                type="text"
                                placeholder="完整名称 (如: 水果)"
                                value={newTag.fullName}
                                onChange={(e) =>
                                    setNewTag({
                                        ...newTag,
                                        fullName: e.target.value,
                                    })
                                }
                                style={{
                                    padding: '12px 16px',
                                    border: 'none',
                                    borderRadius: 'var(--la-radius-sm)',
                                    fontSize: '15px',
                                    flex: 1,
                                    backgroundColor: 'var(--la-surface-subtle)',
                                    color: 'var(--la-text-strong)',
                                    outline: 'none',
                                    fontFamily:
                                        'var(--la-font)',
                                }}
                            />
                            <button
                                onClick={handleAddTag}
                                disabled={!newTag.alias || !newTag.fullName}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor:
                                        newTag.alias && newTag.fullName
                                            ? 'var(--la-accent)'
                                            : 'var(--la-border)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--la-radius-sm)',
                                    cursor:
                                        newTag.alias && newTag.fullName
                                            ? 'pointer'
                                            : 'not-allowed',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    transition:
                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    boxShadow:
                                        newTag.alias && newTag.fullName
                                            ? '0 2px 8px color-mix(in srgb, var(--la-accent) 22%, transparent)'
                                            : 'none',
                                }}>
                                添加
                            </button>
                        </div>
                    </div>{' '}
                    {/* iOS 风格标签列表 */}
                    <div
                        style={{
                            border: 'none',
                            borderRadius: 'var(--la-radius-md)',
                            overflow: 'hidden',
                            backgroundColor: 'var(--la-surface)',
                            boxShadow: 'var(--la-shadow-sm)',
                        }}>
                        <div
                            style={{
                                backgroundColor: 'var(--la-surface-subtle)',
                                padding: '16px 20px',
                                fontSize: '15px',
                                fontWeight: '600',
                                color: 'var(--text-muted)',
                            }}>
                            <div style={{ display: 'flex' }}>
                                <div style={{ flex: '1' }}>别名</div>
                                <div style={{ flex: '2' }}>完整名称</div>
                                <div
                                    style={{
                                        width: '80px',
                                        textAlign: 'center',
                                    }}>
                                    使用数
                                </div>
                                <div
                                    style={{
                                        width: '180px',
                                        textAlign: 'center',
                                    }}>
                                    操作
                                </div>
                            </div>
                        </div>
                        {Object.entries(config.tags).length === 0 ? (
                            <div
                                style={{
                                    padding: '40px',
                                    textAlign: 'center',
                                    color: 'var(--la-text-muted)',
                                    fontSize: '15px',
                                }}>
                                暂无标签别名
                            </div>
                        ) : (
                            Object.entries(config.tags).map(
                                ([alias, fullName]) => {
                                    const usageCount =
                                        globalMetaManager.findWordsUsingTagAlias(
                                            alias,
                                            words,
                                        ).length;
                                    const isEditing =
                                        editingTag &&
                                        editingTag.alias === alias;
                                    return (
                                        <div
                                            key={alias}
                                            style={{
                                                display: 'flex',
                                                padding: '16px 20px',
                                                borderBottom:
                                                    '1px solid color-mix(in srgb, black 8%, transparent)',
                                                alignItems: 'center',
                                                transition:
                                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    'var(--la-surface-subtle)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    'transparent';
                                            }}>
                                            <div
                                                style={{
                                                    flex: '1',
                                                    fontSize: '15px',
                                                    fontFamily:
                                                        'Monaco, "SF Mono", monospace',
                                                    fontWeight: '600',
                                                    color: 'var(--la-accent)',
                                                }}>
                                                {alias}
                                            </div>
                                            <div
                                                style={{
                                                    flex: '2',
                                                    fontSize: '15px',
                                                    color: 'var(--la-text-strong)',
                                                }}>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={
                                                            editingTag.fullName
                                                        }
                                                        onChange={(e) =>
                                                            setEditingTag({
                                                                ...editingTag,
                                                                fullName:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        onKeyPress={(e) => {
                                                            if (
                                                                e.key ===
                                                                'Enter'
                                                            ) {
                                                                handleEditTag(
                                                                    alias,
                                                                    editingTag.fullName,
                                                                    true,
                                                                );
                                                            }
                                                        }}
                                                        style={{
                                                            padding: '8px 12px',
                                                            border: 'none',
                                                            borderRadius:
                                                                '10px',
                                                            fontSize: '15px',
                                                            width: '100%',
                                                            backgroundColor:
                                                                'var(--la-surface-subtle)',
                                                            color: 'var(--la-text-strong)',
                                                            outline: 'none',
                                                            fontFamily:
                                                                'var(--la-font)',
                                                        }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    fullName
                                                )}
                                            </div>{' '}
                                            <div
                                                style={{
                                                    width: '80px',
                                                    textAlign: 'center',
                                                    fontSize: '15px',
                                                }}>
                                                <span
                                                    style={{
                                                        backgroundColor:
                                                            usageCount > 0
                                                                ? 'var(--la-success)'
                                                                : 'var(--la-text-muted)',
                                                        color: 'white',
                                                        padding: '4px 10px',
                                                        borderRadius: 'var(--la-radius-sm)',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                    }}>
                                                    {usageCount}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    width: '180px',
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    gap: '6px',
                                                    justifyContent: 'center',
                                                }}>
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                handleEditTag(
                                                                    alias,
                                                                    editingTag.fullName,
                                                                    usageCount >
                                                                        0,
                                                                )
                                                            }
                                                            style={{
                                                                padding:
                                                                    '6px 14px',
                                                                backgroundColor:
                                                                    'var(--la-success)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius:
                                                                    '10px',
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '13px',
                                                                fontWeight:
                                                                    '600',
                                                                transition:
                                                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                            }}>
                                                            保存
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setEditingTag(
                                                                    null,
                                                                )
                                                            }
                                                            style={{
                                                                padding:
                                                                    '6px 14px',
                                                                backgroundColor:
                                                                    'var(--la-text-muted)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius:
                                                                    '10px',
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '13px',
                                                                fontWeight:
                                                                    '600',
                                                                transition:
                                                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                            }}>
                                                            取消
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                setEditingTag({
                                                                    alias,
                                                                    fullName,
                                                                })
                                                            }
                                                            style={{
                                                                padding:
                                                                    '6px 14px',
                                                                backgroundColor:
                                                                    'var(--la-accent)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius:
                                                                    '10px',
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '13px',
                                                                fontWeight:
                                                                    '600',
                                                                transition:
                                                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                            }}>
                                                            编辑
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteTag(
                                                                    alias,
                                                                    usageCount >
                                                                        0,
                                                                )
                                                            }
                                                            style={{
                                                                padding:
                                                                    '6px 14px',
                                                                backgroundColor:
                                                                    'var(--la-danger)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius:
                                                                    '10px',
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '13px',
                                                                fontWeight:
                                                                    '600',
                                                                transition:
                                                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                            }}>
                                                            删除
                                                        </button>{' '}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                },
                            )
                        )}
                    </div>
                </div>
            )}{' '}
            {/* 分类管理 - iOS 风格 */}
            {activeTab === 'categories' && (
                <div style={{ paddingBottom: '40px' }}>
                    <h3
                        style={{
                            margin: '0 0 16px 0',
                            fontSize: '22px',
                            fontWeight: '600',
                            color: 'var(--la-text-strong)',
                        }}>
                        分类别名管理
                    </h3>
                    {/* iOS 风格添加新分类 */}
                    <div
                        style={{
                            backgroundColor: 'var(--la-surface)',
                            padding: '20px',
                            borderRadius: 'var(--la-radius-md)',
                            marginBottom: '20px',
                            border: 'none',
                            boxShadow: 'var(--la-shadow-sm)',
                        }}>
                        <h4
                            style={{
                                margin: '0 0 16px 0',
                                fontSize: '17px',
                                fontWeight: '600',
                                color: 'var(--text-muted)',
                            }}>
                            <Plus size={18} /> 添加新分类别名
                        </h4>
                        <div
                            style={{
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'center',
                            }}>
                            <input
                                type="text"
                                placeholder="别名 (如: c1)"
                                value={newCategory.alias}
                                onChange={(e) =>
                                    setNewCategory({
                                        ...newCategory,
                                        alias: e.target.value,
                                    })
                                }
                                style={{
                                    padding: '12px 16px',
                                    border: 'none',
                                    borderRadius: 'var(--la-radius-sm)',
                                    fontSize: '15px',
                                    width: '140px',
                                    backgroundColor: 'var(--la-surface-subtle)',
                                    color: 'var(--la-text-strong)',
                                    outline: 'none',
                                    fontFamily:
                                        'var(--la-font)',
                                }}
                            />
                            <span
                                style={{ color: 'var(--la-text-muted)', fontSize: '18px' }}>
                                →
                            </span>
                            <input
                                type="text"
                                placeholder="完整名称 (如: 日常用语)"
                                value={newCategory.fullName}
                                onChange={(e) =>
                                    setNewCategory({
                                        ...newCategory,
                                        fullName: e.target.value,
                                    })
                                }
                                style={{
                                    padding: '12px 16px',
                                    border: 'none',
                                    borderRadius: 'var(--la-radius-sm)',
                                    fontSize: '15px',
                                    flex: 1,
                                    backgroundColor: 'var(--la-surface-subtle)',
                                    color: 'var(--la-text-strong)',
                                    outline: 'none',
                                    fontFamily:
                                        'var(--la-font)',
                                }}
                            />
                            <button
                                onClick={handleAddCategory}
                                disabled={
                                    !newCategory.alias || !newCategory.fullName
                                }
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor:
                                        newCategory.alias &&
                                        newCategory.fullName
                                            ? 'var(--la-accent)'
                                            : 'var(--la-border)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--la-radius-sm)',
                                    cursor:
                                        newCategory.alias &&
                                        newCategory.fullName
                                            ? 'pointer'
                                            : 'not-allowed',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    transition:
                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    boxShadow:
                                        newCategory.alias &&
                                        newCategory.fullName
                                            ? '0 2px 8px color-mix(in srgb, var(--la-accent) 22%, transparent)'
                                            : 'none',
                                }}>
                                添加
                            </button>
                        </div>
                    </div>{' '}
                    {/* iOS 风格分类列表 */}
                    <div
                        style={{
                            border: 'none',
                            borderRadius: 'var(--la-radius-md)',
                            overflow: 'hidden',
                            backgroundColor: 'var(--la-surface)',
                            boxShadow: 'var(--la-shadow-sm)',
                        }}>
                        <div
                            style={{
                                backgroundColor: 'var(--la-surface-subtle)',
                                padding: '16px 20px',
                                fontSize: '15px',
                                fontWeight: '600',
                                color: 'var(--text-muted)',
                            }}>
                            <div style={{ display: 'flex' }}>
                                <div style={{ flex: '1' }}>别名</div>
                                <div style={{ flex: '2' }}>完整名称</div>
                                <div
                                    style={{
                                        width: '80px',
                                        textAlign: 'center',
                                    }}>
                                    使用数
                                </div>
                                <div
                                    style={{
                                        width: '180px',
                                        textAlign: 'center',
                                    }}>
                                    操作
                                </div>
                            </div>
                        </div>
                        {Object.entries(config.categories).length === 0 ? (
                            <div
                                style={{
                                    padding: '40px',
                                    textAlign: 'center',
                                    color: 'var(--la-text-muted)',
                                    fontSize: '15px',
                                }}>
                                暂无分类别名
                            </div>
                        ) : (
                            Object.entries(config.categories).map(
                                ([alias, fullName]) => {
                                    const usageCount =
                                        globalMetaManager.findWordsUsingCategoryAlias(
                                            alias,
                                            words,
                                        ).length;
                                    const isEditing =
                                        editingCategory &&
                                        editingCategory.alias === alias;
                                    return (
                                        <div
                                            key={alias}
                                            style={{
                                                display: 'flex',
                                                padding: '16px 20px',
                                                borderBottom:
                                                    '1px solid color-mix(in srgb, black 8%, transparent)',
                                                alignItems: 'center',
                                                transition:
                                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    'var(--la-surface-subtle)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    'transparent';
                                            }}>
                                            <div
                                                style={{
                                                    flex: '1',
                                                    fontSize: '15px',
                                                    fontFamily:
                                                        'Monaco, "SF Mono", monospace',
                                                    fontWeight: '600',
                                                    color: 'var(--la-accent)',
                                                }}>
                                                {alias}
                                            </div>
                                            <div
                                                style={{
                                                    flex: '2',
                                                    fontSize: '15px',
                                                    color: 'var(--la-text-strong)',
                                                }}>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={
                                                            editingCategory.fullName
                                                        }
                                                        onChange={(e) =>
                                                            setEditingCategory({
                                                                ...editingCategory,
                                                                fullName:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        onKeyPress={(e) => {
                                                            if (
                                                                e.key ===
                                                                'Enter'
                                                            ) {
                                                                handleEditCategory(
                                                                    alias,
                                                                    editingCategory.fullName,
                                                                    true,
                                                                );
                                                            }
                                                        }}
                                                        style={{
                                                            padding: '8px 12px',
                                                            border: 'none',
                                                            borderRadius:
                                                                '10px',
                                                            fontSize: '15px',
                                                            width: '100%',
                                                            backgroundColor:
                                                                'var(--la-surface-subtle)',
                                                            color: 'var(--la-text-strong)',
                                                            outline: 'none',
                                                            fontFamily:
                                                                'var(--la-font)',
                                                        }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    fullName
                                                )}
                                            </div>
                                            <div
                                                style={{
                                                    width: '80px',
                                                    textAlign: 'center',
                                                    fontSize: '15px',
                                                }}>
                                                <span
                                                    style={{
                                                        backgroundColor:
                                                            usageCount > 0
                                                                ? 'var(--la-success)'
                                                                : 'var(--la-text-muted)',
                                                        color: 'white',
                                                        padding: '4px 10px',
                                                        borderRadius: 'var(--la-radius-sm)',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                    }}>
                                                    {usageCount}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    width: '180px',
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    gap: '6px',
                                                    justifyContent: 'center',
                                                }}>
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                handleEditCategory(
                                                                    alias,
                                                                    editingCategory.fullName,
                                                                    usageCount >
                                                                        0,
                                                                )
                                                            }
                                                            style={{
                                                                padding:
                                                                    '6px 14px',
                                                                backgroundColor:
                                                                    'var(--la-success)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius:
                                                                    '10px',
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '13px',
                                                                fontWeight:
                                                                    '600',
                                                                transition:
                                                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                            }}>
                                                            保存
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setEditingCategory(
                                                                    null,
                                                                )
                                                            }
                                                            style={{
                                                                padding:
                                                                    '6px 14px',
                                                                backgroundColor:
                                                                    'var(--la-text-muted)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius:
                                                                    '10px',
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '13px',
                                                                fontWeight:
                                                                    '600',
                                                                transition:
                                                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                            }}>
                                                            取消
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                setEditingCategory(
                                                                    {
                                                                        alias,
                                                                        fullName,
                                                                    },
                                                                )
                                                            }
                                                            style={{
                                                                padding:
                                                                    '6px 14px',
                                                                backgroundColor:
                                                                    'var(--la-accent)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius:
                                                                    '10px',
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '13px',
                                                                fontWeight:
                                                                    '600',
                                                                transition:
                                                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                            }}>
                                                            编辑
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteCategory(
                                                                    alias,
                                                                    usageCount >
                                                                        0,
                                                                )
                                                            }
                                                            style={{
                                                                padding:
                                                                    '6px 14px',
                                                                backgroundColor:
                                                                    'var(--la-danger)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius:
                                                                    '10px',
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '13px',
                                                                fontWeight:
                                                                    '600',
                                                                transition:
                                                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                            }}>
                                                            删除
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                },
                            )
                        )}
                    </div>
                </div>
            )}{' '}
            {/* 高级管理 - iOS 风格 */}
            {activeTab === 'manage' && (
                <div style={{ paddingBottom: '40px' }}>
                    <h3
                        style={{
                            margin: '0 0 16px 0',
                            fontSize: '22px',
                            fontWeight: '600',
                            color: 'var(--la-text-strong)',
                        }}>
                        高级管理功能
                    </h3>
                    {/* iOS 风格使用情况分析 */}
                    <div
                        style={{
                            backgroundColor: 'var(--la-surface)',
                            padding: '20px',
                            borderRadius: 'var(--la-radius-md)',
                            marginBottom: '20px',
                            border: 'none',
                            boxShadow: 'var(--la-shadow-sm)',
                        }}>
                        <h4
                            style={{
                                margin: '0 0 16px 0',
                                fontSize: '17px',
                                fontWeight: '600',
                                color: 'var(--text-muted)',
                            }}>
                            <BarChart2 size={18} /> 使用情况分析
                        </h4>
                        {usageStats && (
                            <div
                                style={{
                                    display: 'grid',
                                    gap: '12px',
                                    gridTemplateColumns:
                                        'repeat(auto-fit, minmax(200px, 1fr))',
                                }}>
                                <div
                                    style={{
                                        padding: '16px',
                                        backgroundColor: 'var(--la-surface-subtle)',
                                        borderRadius: 'var(--la-radius-sm)',
                                        border: 'none',
                                    }}>
                                    <div
                                        style={{
                                            fontSize: '28px',
                                            fontWeight: '700',
                                            color: 'var(--la-accent)',
                                            marginBottom: '4px',
                                        }}>
                                        {usageStats.totalTags}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '15px',
                                            color: 'var(--la-text-muted)',
                                            fontWeight: '500',
                                        }}>
                                        总标签数
                                    </div>
                                </div>
                                <div
                                    style={{
                                        padding: '16px',
                                        backgroundColor: 'var(--la-surface-subtle)',
                                        borderRadius: 'var(--la-radius-sm)',
                                        border: 'none',
                                    }}>
                                    <div
                                        style={{
                                            fontSize: '28px',
                                            fontWeight: '700',
                                            color: 'var(--la-success)',
                                            marginBottom: '4px',
                                        }}>
                                        {usageStats.usedTags}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '15px',
                                            color: 'var(--la-text-muted)',
                                            fontWeight: '500',
                                        }}>
                                        使用中标签
                                    </div>
                                </div>
                                <div
                                    style={{
                                        padding: '16px',
                                        backgroundColor: 'var(--la-surface-subtle)',
                                        borderRadius: 'var(--la-radius-sm)',
                                        border: 'none',
                                    }}>
                                    <div
                                        style={{
                                            fontSize: '28px',
                                            fontWeight: '700',
                                            color: 'var(--la-warning)',
                                            marginBottom: '4px',
                                        }}>
                                        {usageStats.totalCategories}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '15px',
                                            color: 'var(--la-text-muted)',
                                            fontWeight: '500',
                                        }}>
                                        总分类数
                                    </div>
                                </div>
                                <div
                                    style={{
                                        padding: '16px',
                                        backgroundColor: 'var(--la-surface-subtle)',
                                        borderRadius: 'var(--la-radius-sm)',
                                        border: 'none',
                                    }}>
                                    <div
                                        style={{
                                            fontSize: '28px',
                                            fontWeight: '700',
                                            color: 'var(--la-purple)',
                                            marginBottom: '4px',
                                        }}>
                                        {usageStats.usedCategories}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '15px',
                                            color: 'var(--la-text-muted)',
                                            fontWeight: '500',
                                        }}>
                                        使用中分类
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>{' '}
                    {/* iOS 风格未使用的标签和分类 */}
                    <div
                        style={{
                            display: 'grid',
                            gap: '16px',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(350px, 1fr))',
                            marginBottom: '20px',
                        }}>
                        {/* 未使用的标签 */}
                        <div
                            style={{
                                backgroundColor: 'var(--la-surface)',
                                borderRadius: 'var(--la-radius-md)',
                                overflow: 'hidden',
                                border: 'none',
                                boxShadow: 'var(--la-shadow-sm)',
                            }}>
                            <div
                                style={{
                                    background:
                                        'var(--la-gradient-warning)',
                                    padding: '14px 20px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: 'white',
                                }}>
                                <Tag size={18} /> 未使用的标签
                            </div>
                            <div
                                style={{
                                    maxHeight: '240px',
                                    overflowY: 'auto',
                                }}>
                                {Object.entries(config.tags)
                                    .filter(
                                        ([alias]) =>
                                            globalMetaManager.findWordsUsingTagAlias(
                                                alias,
                                                words,
                                            ).length === 0,
                                    )
                                    .map(([alias, fullName]) => (
                                        <div
                                            key={alias}
                                            style={{
                                                display: 'flex',
                                                padding: '12px 20px',
                                                borderBottom:
                                                    '1px solid color-mix(in srgb, black 8%, transparent)',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                transition:
                                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    'var(--la-surface-subtle)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    'transparent';
                                            }}>
                                            <div style={{ flex: 1 }}>
                                                <span
                                                    style={{
                                                        fontFamily:
                                                            'Monaco, "SF Mono", monospace',
                                                        color: 'var(--la-text-muted)',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                    }}>
                                                    {alias}
                                                </span>
                                                <span
                                                    style={{
                                                        margin: '0 8px',
                                                        color: 'var(--la-border)',
                                                    }}>
                                                    →
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '15px',
                                                        color: 'var(--text-muted)',
                                                    }}>
                                                    {fullName}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleDeleteTag(
                                                        alias,
                                                        false,
                                                    )
                                                }
                                                style={{
                                                    padding: '6px 14px',
                                                    backgroundColor: 'var(--la-danger)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 'var(--la-radius-xs)',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    transition:
                                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                }}>
                                                删除
                                            </button>
                                        </div>
                                    ))}
                                {Object.entries(config.tags).filter(
                                    ([alias]) =>
                                        globalMetaManager.findWordsUsingTagAlias(
                                            alias,
                                            words,
                                        ).length === 0,
                                ).length === 0 && (
                                    <div
                                        style={{
                                            padding: '40px 20px',
                                            textAlign: 'center',
                                            color: 'var(--la-text-muted)',
                                            fontSize: '15px',
                                        }}>
                                        <CheckCircle size={18} /> 所有标签都在使用中
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 未使用的分类 */}
                        <div
                            style={{
                                backgroundColor: 'var(--la-surface)',
                                borderRadius: 'var(--la-radius-md)',
                                overflow: 'hidden',
                                border: 'none',
                                boxShadow: 'var(--la-shadow-sm)',
                            }}>
                            <div
                                style={{
                                    background:
                                        'linear-gradient(135deg, var(--la-purple) 0%, var(--la-purple) 100%)',
                                    padding: '14px 20px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: 'white',
                                }}>
                                <Folder size={18} /> 未使用的分类
                            </div>
                            <div
                                style={{
                                    maxHeight: '240px',
                                    overflowY: 'auto',
                                }}>
                                {Object.entries(config.categories)
                                    .filter(
                                        ([alias]) =>
                                            globalMetaManager.findWordsUsingCategoryAlias(
                                                alias,
                                                words,
                                            ).length === 0,
                                    )
                                    .map(([alias, fullName]) => (
                                        <div
                                            key={alias}
                                            style={{
                                                display: 'flex',
                                                padding: '12px 20px',
                                                borderBottom:
                                                    '1px solid color-mix(in srgb, black 8%, transparent)',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                transition:
                                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    'var(--la-surface-subtle)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    'transparent';
                                            }}>
                                            <div style={{ flex: 1 }}>
                                                <span
                                                    style={{
                                                        fontFamily:
                                                            'Monaco, "SF Mono", monospace',
                                                        color: 'var(--la-text-muted)',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                    }}>
                                                    {alias}
                                                </span>
                                                <span
                                                    style={{
                                                        margin: '0 8px',
                                                        color: 'var(--la-border)',
                                                    }}>
                                                    →
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '15px',
                                                        color: 'var(--text-muted)',
                                                    }}>
                                                    {fullName}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleDeleteCategory(
                                                        alias,
                                                        false,
                                                    )
                                                }
                                                style={{
                                                    padding: '6px 14px',
                                                    backgroundColor: 'var(--la-danger)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 'var(--la-radius-xs)',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    transition:
                                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                }}>
                                                删除
                                            </button>
                                        </div>
                                    ))}
                                {Object.entries(config.categories).filter(
                                    ([alias]) =>
                                        globalMetaManager.findWordsUsingCategoryAlias(
                                            alias,
                                            words,
                                        ).length === 0,
                                ).length === 0 && (
                                    <div
                                        style={{
                                            padding: '40px 20px',
                                            textAlign: 'center',
                                            color: 'var(--la-text-muted)',
                                            fontSize: '15px',
                                        }}>
                                        <CheckCircle size={18} /> 所有分类都在使用中
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>{' '}
                    {/* iOS 风格批量操作 */}
                    <div
                        style={{
                            backgroundColor: 'var(--la-surface)',
                            padding: '20px',
                            borderRadius: 'var(--la-radius-md)',
                            border: 'none',
                            boxShadow: 'var(--la-shadow-sm)',
                        }}>
                        <h4
                            style={{
                                margin: '0 0 16px 0',
                                fontSize: '17px',
                                fontWeight: '600',
                                color: 'var(--text-muted)',
                            }}>
                            <Wrench size={18} /> 批量操作
                        </h4>
                        <div
                            style={{
                                display: 'flex',
                                gap: '12px',
                                flexWrap: 'wrap',
                            }}>
                            <button
                                onClick={() => {
                                    const unusedTags = Object.entries(
                                        config.tags,
                                    ).filter(
                                        ([alias]) =>
                                            globalMetaManager.findWordsUsingTagAlias(
                                                alias,
                                                words,
                                            ).length === 0,
                                    );
                                    if (
                                        unusedTags.length > 0 &&
                                        confirm(
                                            `确定要删除 ${
                                                unusedTags.length
                                            } 个未使用的标签吗？\n\n${unusedTags
                                                .map(
                                                    ([alias, name]) =>
                                                        `${alias} → ${name}`,
                                                )
                                                .join('\n')}`,
                                        )
                                    ) {
                                        console.log('批量清理未使用标签...');
                                        unusedTags.forEach(([alias]) => {
                                            globalMetaManager.deleteTagMapping(
                                                alias,
                                            );
                                        });

                                        // 立即保存配置更改 (标签删除不需要更新单词数据，因为它们本来就未使用)
                                        loadConfig();
                                        console.log(
                                            `已删除 ${unusedTags.length} 个未使用的标签`,
                                        );
                                    }
                                }}
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: 'var(--la-warning)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--la-radius-sm)',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    transition:
                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    boxShadow:
                                        '0 2px 8px color-mix(in srgb, var(--la-warning) 22%, transparent)',
                                }}>
                                清理未使用标签
                            </button>
                            <button
                                onClick={() => {
                                    const unusedCategories = Object.entries(
                                        config.categories,
                                    ).filter(
                                        ([alias]) =>
                                            globalMetaManager.findWordsUsingCategoryAlias(
                                                alias,
                                                words,
                                            ).length === 0,
                                    );
                                    if (
                                        unusedCategories.length > 0 &&
                                        confirm(
                                            `确定要删除 ${
                                                unusedCategories.length
                                            } 个未使用的分类吗？\n\n${unusedCategories
                                                .map(
                                                    ([alias, name]) =>
                                                        `${alias} → ${name}`,
                                                )
                                                .join('\n')}`,
                                        )
                                    ) {
                                        console.log('批量清理未使用分类...');
                                        unusedCategories.forEach(([alias]) => {
                                            globalMetaManager.deleteCategoryMapping(
                                                alias,
                                            );
                                        });

                                        // 立即保存配置更改 (分类删除不需要更新单词数据，因为它们本来就未使用)
                                        loadConfig();
                                        console.log(
                                            `已删除 ${unusedCategories.length} 个未使用的分类`,
                                        );
                                    }
                                }}
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: 'var(--la-purple)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--la-radius-sm)',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    transition:
                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    boxShadow:
                                        '0 2px 8px color-mix(in srgb, var(--la-purple) 22%, transparent)',
                                }}>
                                清理未使用分类
                            </button>
                            <button
                                onClick={() => {
                                    if (
                                        confirm(
                                            '确定要重新加载配置吗？这将刷新所有统计信息。',
                                        )
                                    ) {
                                        loadConfig();
                                    }
                                }}
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: 'var(--la-text-muted)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--la-radius-sm)',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    transition:
                                        'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                }}>
                                刷新统计
                            </button>
                        </div>
                    </div>
                </div>
            )}{' '}
            {/* iOS 风格统计信息页面 */}
            {activeTab === 'stats' && (
                <div style={{ paddingBottom: '40px' }}>
                    <h3
                        style={{
                            margin: '0 0 16px 0',
                            fontSize: '22px',
                            fontWeight: '600',
                            color: 'var(--la-text-strong)',
                        }}>
                        系统统计信息
                    </h3>

                    {/* iOS 风格统计卡片 */}
                    <div
                        style={{
                            display: 'grid',
                            gap: '16px',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(200px, 1fr))',
                            marginBottom: '20px',
                        }}>
                        <div
                            style={{
                                background:
                                    'var(--la-gradient-accent)',
                                padding: '20px',
                                borderRadius: 'var(--la-radius-md)',
                                border: 'none',
                                boxShadow: 'var(--la-shadow-sm)',
                            }}>
                            <div
                                style={{
                                    fontSize: '32px',
                                    fontWeight: '700',
                                    color: 'white',
                                    marginBottom: '4px',
                                }}>
                                {Object.keys(config.tags).length}
                            </div>
                            <div
                                style={{
                                    color: 'var(--la-on-accent-muted)',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                }}>
                                <Tag size={18} /> 标签别名数量
                            </div>
                        </div>

                        <div
                            style={{
                                background:
                                    'linear-gradient(135deg, var(--la-purple) 0%, var(--la-purple) 100%)',
                                padding: '20px',
                                borderRadius: 'var(--la-radius-md)',
                                border: 'none',
                                boxShadow: '0 4px 16px color-mix(in srgb, var(--la-purple) 18%, transparent)',
                            }}>
                            <div
                                style={{
                                    fontSize: '32px',
                                    fontWeight: '700',
                                    color: 'white',
                                    marginBottom: '4px',
                                }}>
                                {Object.keys(config.categories).length}
                            </div>
                            <div
                                style={{
                                    color: 'var(--la-on-accent-muted)',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                }}>
                                <Folder size={18} /> 分类别名数量
                            </div>
                        </div>

                        <div
                            style={{
                                background:
                                    'var(--la-gradient-success)',
                                padding: '20px',
                                borderRadius: 'var(--la-radius-md)',
                                border: 'none',
                                boxShadow: '0 4px 16px color-mix(in srgb, var(--la-success) 18%, transparent)',
                            }}>
                            <div
                                style={{
                                    fontSize: '32px',
                                    fontWeight: '700',
                                    color: 'white',
                                    marginBottom: '4px',
                                }}>
                                {stats.spaceSaved}
                            </div>
                            <div
                                style={{
                                    color: 'var(--la-on-accent-muted)',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                }}>
                                <HardDrive size={18} /> 节省字符数
                            </div>
                        </div>

                        <div
                            style={{
                                background:
                                    'var(--la-gradient-warning)',
                                padding: '20px',
                                borderRadius: 'var(--la-radius-md)',
                                border: 'none',
                                boxShadow: '0 4px 16px color-mix(in srgb, var(--la-warning) 18%, transparent)',
                            }}>
                            <div
                                style={{
                                    fontSize: '32px',
                                    fontWeight: '700',
                                    color: 'white',
                                    marginBottom: '4px',
                                }}>
                                {words.length}
                            </div>
                            <div
                                style={{
                                    color: 'var(--la-on-accent-muted)',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                }}>
                                <FileText size={18} /> 单词总数
                            </div>
                        </div>
                    </div>

                    {/* iOS 风格详细使用统计 */}
                    {usageStats && (
                        <div
                            style={{
                                marginBottom: '20px',
                                backgroundColor: 'var(--la-surface)',
                                borderRadius: 'var(--la-radius-md)',
                                overflow: 'hidden',
                                border: 'none',
                                boxShadow: 'var(--la-shadow-sm)',
                            }}>
                            <div
                                style={{
                                    backgroundColor: 'var(--la-surface-subtle)',
                                    padding: '16px 20px',
                                    fontSize: '17px',
                                    fontWeight: '600',
                                    color: 'var(--text-muted)',
                                }}>
                                <BarChart2 size={18} /> 详细使用统计
                            </div>
                            <div style={{ padding: '20px' }}>
                                <div
                                    style={{
                                        display: 'grid',
                                        gap: '20px',
                                        gridTemplateColumns:
                                            'repeat(auto-fit, minmax(250px, 1fr))',
                                    }}>
                                    <div>
                                        <h5
                                            style={{
                                                margin: '0 0 12px 0',
                                                color: 'var(--la-accent)',
                                                fontSize: '17px',
                                                fontWeight: '600',
                                            }}>
                                            标签使用情况
                                        </h5>
                                        <div
                                            style={{
                                                fontSize: '15px',
                                                color: 'var(--text-muted)',
                                                lineHeight: '1.8',
                                            }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                }}>
                                                <span>总标签数：</span>
                                                <strong
                                                    style={{
                                                        color: 'var(--la-text-strong)',
                                                    }}>
                                                    {usageStats.totalTags}
                                                </strong>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                }}>
                                                <span>使用中：</span>
                                                <strong
                                                    style={{
                                                        color: 'var(--la-success)',
                                                    }}>
                                                    {usageStats.usedTags}
                                                </strong>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                }}>
                                                <span>未使用：</span>
                                                <strong
                                                    style={{
                                                        color: 'var(--la-danger)',
                                                    }}>
                                                    {usageStats.totalTags -
                                                        usageStats.usedTags}
                                                </strong>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                }}>
                                                <span>使用率：</span>
                                                <strong
                                                    style={{
                                                        color: 'var(--la-text-strong)',
                                                    }}>
                                                    {usageStats.totalTags > 0
                                                        ? Math.round(
                                                              (usageStats.usedTags /
                                                                  usageStats.totalTags) *
                                                                  100,
                                                          )
                                                        : 0}
                                                    %
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h5
                                            style={{
                                                margin: '0 0 12px 0',
                                                color: 'var(--la-purple)',
                                                fontSize: '17px',
                                                fontWeight: '600',
                                            }}>
                                            分类使用情况
                                        </h5>
                                        <div
                                            style={{
                                                fontSize: '15px',
                                                color: 'var(--text-muted)',
                                                lineHeight: '1.8',
                                            }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                }}>
                                                <span>总分类数：</span>
                                                <strong
                                                    style={{
                                                        color: 'var(--la-text-strong)',
                                                    }}>
                                                    {usageStats.totalCategories}
                                                </strong>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                }}>
                                                <span>使用中：</span>
                                                <strong
                                                    style={{
                                                        color: 'var(--la-success)',
                                                    }}>
                                                    {usageStats.usedCategories}
                                                </strong>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                }}>
                                                <span>未使用：</span>
                                                <strong
                                                    style={{
                                                        color: 'var(--la-danger)',
                                                    }}>
                                                    {usageStats.totalCategories -
                                                        usageStats.usedCategories}
                                                </strong>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                }}>
                                                <span>使用率：</span>
                                                <strong
                                                    style={{
                                                        color: 'var(--la-text-strong)',
                                                    }}>
                                                    {usageStats.totalCategories >
                                                    0
                                                        ? Math.round(
                                                              (usageStats.usedCategories /
                                                                  usageStats.totalCategories) *
                                                                  100,
                                                          )
                                                        : 0}
                                                    %
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        marginTop: '20px',
                                        padding: '16px',
                                        backgroundColor: 'var(--la-surface-subtle)',
                                        borderRadius: 'var(--la-radius-sm)',
                                    }}>
                                    <h5
                                        style={{
                                            margin: '0 0 12px 0',
                                            color: 'var(--text-muted)',
                                            fontSize: '17px',
                                            fontWeight: '600',
                                        }}>
                                        空间节省分析
                                    </h5>
                                    <div
                                        style={{
                                            fontSize: '15px',
                                            color: 'var(--text-muted)',
                                            lineHeight: '1.8',
                                        }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                            }}>
                                            <span>总节省字符：</span>
                                            <strong
                                                style={{ color: 'var(--la-success)' }}>
                                                {stats.spaceSaved}
                                            </strong>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                            }}>
                                            <span>平均每个单词节省：</span>
                                            <strong
                                                style={{ color: 'var(--la-text-strong)' }}>
                                                {words.length > 0
                                                    ? Math.round(
                                                          stats.spaceSaved /
                                                              words.length,
                                                      )
                                                    : 0}{' '}
                                                字符
                                            </strong>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                            }}>
                                            <span>预估空间节省率：</span>
                                            <strong
                                                style={{ color: 'var(--la-warning)' }}>
                                                约 35%
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* iOS 风格配置详情 */}
                    <div
                        style={{
                            marginTop: '20px',
                            padding: '20px',
                            backgroundColor: 'var(--la-surface)',
                            borderRadius: 'var(--la-radius-md)',
                            border: 'none',
                            boxShadow: 'var(--la-shadow-sm)',
                        }}>
                        <h4
                            style={{
                                margin: '0 0 16px 0',
                                fontSize: '17px',
                                fontWeight: '600',
                                color: 'var(--text-muted)',
                            }}>
                            <Search size={18} /> 配置详情
                        </h4>
                        <div
                            style={{
                                fontSize: '15px',
                                color: 'var(--text-muted)',
                                lineHeight: '1.8',
                            }}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px',
                                }}>
                                <strong>版本:</strong>{' '}
                                <span style={{ color: 'var(--la-text-muted)' }}>
                                    {config.version}
                                </span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px',
                                }}>
                                <strong>最后更新:</strong>{' '}
                                <span style={{ color: 'var(--la-text-muted)' }}>
                                    {formatTimestampForDisplay(
                                        config.lastUpdate,
                                    ) || '暂无记录'}
                                </span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '12px',
                                }}>
                                <strong>总别名数量:</strong>{' '}
                                <span
                                    style={{
                                        color: 'var(--la-accent)',
                                        fontWeight: '600',
                                    }}>
                                    {Object.keys(config.tags).length +
                                        Object.keys(config.categories).length}
                                </span>
                            </div>
                            <div
                                style={{
                                    marginTop: '16px',
                                    padding: '12px 16px',
                                    backgroundColor: 'var(--la-surface-subtle)',
                                    borderRadius: 'var(--la-radius-sm)',
                                    borderLeft: '4px solid var(--la-accent)',
                                }}>
                                <strong style={{ color: 'var(--la-text-strong)' }}>
                                    <Lightbulb size={16} /> 优势:
                                </strong>
                                <div
                                    style={{
                                        marginTop: '4px',
                                        color: 'var(--text-muted)',
                                    }}>
                                    双层元数据系统通过别名映射显著减少存储空间，提高文档可读性和维护效率
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalMetaConfigComponent;

// 全局元数据配置组件
import React, { useState, useEffect } from 'react';
import { GlobalMetaManager, GlobalMetaConfig } from './GlobalMetaManager';

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
        removeFromWords: boolean = false,
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
        removeFromWords: boolean = false,
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
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <div>⏳ 加载配置中...</div>
            </div>
        );
    }

    if (!config) {
        return (
            <div
                style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                <div>❌ 无法加载全局配置</div>
            </div>
        );
    }

    const stats = globalMetaManager.getStats();

    return (
        <div style={{ padding: '20px', maxWidth: '800px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '24px',
                        color: '#333',
                    }}>
                    🔄 全局元数据配置
                </h2>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    管理标签和分类的别名映射，节省存储空间
                </p>
            </div>
            {/* 选项卡 */}
            <div
                style={{
                    marginBottom: '20px',
                    borderBottom: '1px solid #e0e0e0',
                }}>
                <div style={{ display: 'flex', gap: '0' }}>
                    {' '}
                    {[
                        {
                            id: 'tags',
                            label: '🏷️ 标签管理',
                            count: Object.keys(config.tags).length,
                        },
                        {
                            id: 'categories',
                            label: '📂 分类管理',
                            count: Object.keys(config.categories).length,
                        },
                        {
                            id: 'manage',
                            label: '⚙️ 高级管理',
                            count: words.length,
                        },
                        {
                            id: 'stats',
                            label: '📊 统计信息',
                            count: stats.spaceSaved,
                        },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                padding: '12px 16px',
                                border: 'none',
                                borderBottom:
                                    activeTab === tab.id
                                        ? '2px solid #007ACC'
                                        : '2px solid transparent',
                                backgroundColor:
                                    activeTab === tab.id
                                        ? '#f8f9fa'
                                        : 'transparent',
                                color:
                                    activeTab === tab.id ? '#007ACC' : '#666',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight:
                                    activeTab === tab.id ? '600' : '400',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}>
                            {tab.label}
                            <span
                                style={{
                                    backgroundColor:
                                        activeTab === tab.id
                                            ? '#007ACC'
                                            : '#ddd',
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    fontSize: '12px',
                                    minWidth: '16px',
                                    textAlign: 'center',
                                }}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
            {/* 标签管理 */}
            {activeTab === 'tags' && (
                <div>
                    <h3
                        style={{
                            margin: '0 0 16px 0',
                            fontSize: '18px',
                            color: '#333',
                        }}>
                        标签别名管理
                    </h3>
                    {/* 添加新标签 */}
                    <div
                        style={{
                            backgroundColor: '#f8f9fa',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            border: '1px solid #e9ecef',
                        }}>
                        <h4
                            style={{
                                margin: '0 0 12px 0',
                                fontSize: '14px',
                                color: '#495057',
                            }}>
                            ➕ 添加新标签别名
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
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    width: '120px',
                                }}
                            />
                            <span style={{ color: '#6c757d' }}>→</span>
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
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    flex: 1,
                                }}
                            />
                            <button
                                onClick={handleAddTag}
                                disabled={!newTag.alias || !newTag.fullName}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor:
                                        newTag.alias && newTag.fullName
                                            ? '#007ACC'
                                            : '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor:
                                        newTag.alias && newTag.fullName
                                            ? 'pointer'
                                            : 'not-allowed',
                                    fontSize: '14px',
                                }}>
                                添加
                            </button>
                        </div>
                    </div>{' '}
                    {/* 标签列表 */}
                    <div
                        style={{
                            border: '1px solid #e9ecef',
                            borderRadius: '8px',
                            overflow: 'hidden',
                        }}>
                        <div
                            style={{
                                backgroundColor: '#f8f9fa',
                                padding: '12px 16px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#495057',
                                borderBottom: '1px solid #e9ecef',
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
                                        width: '160px',
                                        textAlign: 'center',
                                    }}>
                                    操作
                                </div>
                            </div>
                        </div>
                        {Object.entries(config.tags).length === 0 ? (
                            <div
                                style={{
                                    padding: '20px',
                                    textAlign: 'center',
                                    color: '#6c757d',
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
                                                padding: '12px 16px',
                                                borderBottom:
                                                    '1px solid #f1f3f4',
                                                alignItems: 'center',
                                            }}>
                                            <div
                                                style={{
                                                    flex: '1',
                                                    fontSize: '14px',
                                                    fontFamily: 'monospace',
                                                }}>
                                                {alias}
                                            </div>
                                            <div
                                                style={{
                                                    flex: '2',
                                                    fontSize: '14px',
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
                                                            padding: '4px 8px',
                                                            border: '1px solid #ced4da',
                                                            borderRadius: '4px',
                                                            fontSize: '14px',
                                                            width: '100%',
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
                                                    fontSize: '14px',
                                                }}>
                                                <span
                                                    style={{
                                                        backgroundColor:
                                                            usageCount > 0
                                                                ? '#28a745'
                                                                : '#6c757d',
                                                        color: 'white',
                                                        padding: '2px 6px',
                                                        borderRadius: '10px',
                                                        fontSize: '12px',
                                                    }}>
                                                    {usageCount}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    width: '160px',
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    gap: '4px',
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
                                                                    '4px 8px',
                                                                backgroundColor:
                                                                    '#28a745',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius:
                                                                    '4px',
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '12px',
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
                                                                    '4px 8px',
                                                                backgroundColor:
                                                                    '#6c757d',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius:
                                                                    '4px',
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '12px',
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
                                                                    '4px 8px',
                                                                backgroundColor:
                                                                    '#007ACC',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius:
                                                                    '4px',
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '12px',
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
                                                                    '4px 8px',
                                                                backgroundColor:
                                                                    '#dc3545',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius:
                                                                    '4px',
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '12px',
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
            )}
            {/* 分类管理 */}
            {activeTab === 'categories' && (
                <div>
                    <h3
                        style={{
                            margin: '0 0 16px 0',
                            fontSize: '18px',
                            color: '#333',
                        }}>
                        分类别名管理
                    </h3>
                    {/* 添加新分类 */}
                    <div
                        style={{
                            backgroundColor: '#f8f9fa',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            border: '1px solid #e9ecef',
                        }}>
                        <h4
                            style={{
                                margin: '0 0 12px 0',
                                fontSize: '14px',
                                color: '#495057',
                            }}>
                            ➕ 添加新分类别名
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
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    width: '120px',
                                }}
                            />
                            <span style={{ color: '#6c757d' }}>→</span>
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
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    flex: 1,
                                }}
                            />
                            <button
                                onClick={handleAddCategory}
                                disabled={
                                    !newCategory.alias || !newCategory.fullName
                                }
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor:
                                        newCategory.alias &&
                                        newCategory.fullName
                                            ? '#007ACC'
                                            : '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor:
                                        newCategory.alias &&
                                        newCategory.fullName
                                            ? 'pointer'
                                            : 'not-allowed',
                                    fontSize: '14px',
                                }}>
                                添加
                            </button>
                        </div>
                    </div>{' '}
                    {/* 分类列表 */}
                    <div
                        style={{
                            border: '1px solid #e9ecef',
                            borderRadius: '8px',
                            overflow: 'hidden',
                        }}>
                        <div
                            style={{
                                backgroundColor: '#f8f9fa',
                                padding: '12px 16px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#495057',
                                borderBottom: '1px solid #e9ecef',
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
                                        width: '160px',
                                        textAlign: 'center',
                                    }}>
                                    操作
                                </div>
                            </div>
                        </div>
                        {Object.entries(config.categories).length === 0 ? (
                            <div
                                style={{
                                    padding: '20px',
                                    textAlign: 'center',
                                    color: '#6c757d',
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
                                                padding: '12px 16px',
                                                borderBottom:
                                                    '1px solid #f1f3f4',
                                                alignItems: 'center',
                                            }}>
                                            <div
                                                style={{
                                                    flex: '1',
                                                    fontSize: '14px',
                                                    fontFamily: 'monospace',
                                                }}>
                                                {alias}
                                            </div>
                                            <div
                                                style={{
                                                    flex: '2',
                                                    fontSize: '14px',
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
                                                            padding: '4px 8px',
                                                            border: '1px solid #ced4da',
                                                            borderRadius: '4px',
                                                            fontSize: '14px',
                                                            width: '100%',
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
                                                    fontSize: '14px',
                                                }}>
                                                <span
                                                    style={{
                                                        backgroundColor:
                                                            usageCount > 0
                                                                ? '#28a745'
                                                                : '#6c757d',
                                                        color: 'white',
                                                        padding: '2px 6px',
                                                        borderRadius: '10px',
                                                        fontSize: '12px',
                                                    }}>
                                                    {usageCount}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    width: '160px',
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    gap: '4px',
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
                                                                    '4px 8px',
                                                                backgroundColor:
                                                                    '#28a745',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius:
                                                                    '4px',
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '12px',
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
                                                                    '4px 8px',
                                                                backgroundColor:
                                                                    '#6c757d',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius:
                                                                    '4px',
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '12px',
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
                                                                    '4px 8px',
                                                                backgroundColor:
                                                                    '#007ACC',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius:
                                                                    '4px',
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '12px',
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
                                                                    '4px 8px',
                                                                backgroundColor:
                                                                    '#dc3545',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius:
                                                                    '4px',
                                                                cursor: 'pointer',
                                                                fontSize:
                                                                    '12px',
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
            )}
            {/* 高级管理 */}
            {activeTab === 'manage' && (
                <div>
                    <h3
                        style={{
                            margin: '0 0 16px 0',
                            fontSize: '18px',
                            color: '#333',
                        }}>
                        高级管理功能
                    </h3>

                    {/* 使用情况分析 */}
                    <div
                        style={{
                            backgroundColor: '#f8f9fa',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            border: '1px solid #e9ecef',
                        }}>
                        <h4
                            style={{
                                margin: '0 0 12px 0',
                                fontSize: '16px',
                                color: '#495057',
                            }}>
                            📊 使用情况分析
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
                                        padding: '12px',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #dee2e6',
                                    }}>
                                    <div
                                        style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: '#007ACC',
                                        }}>
                                        {usageStats.totalTags}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '14px',
                                            color: '#666',
                                        }}>
                                        总标签数
                                    </div>
                                </div>
                                <div
                                    style={{
                                        padding: '12px',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #dee2e6',
                                    }}>
                                    <div
                                        style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: '#28a745',
                                        }}>
                                        {usageStats.usedTags}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '14px',
                                            color: '#666',
                                        }}>
                                        使用中标签
                                    </div>
                                </div>
                                <div
                                    style={{
                                        padding: '12px',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #dee2e6',
                                    }}>
                                    <div
                                        style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: '#ffc107',
                                        }}>
                                        {usageStats.totalCategories}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '14px',
                                            color: '#666',
                                        }}>
                                        总分类数
                                    </div>
                                </div>
                                <div
                                    style={{
                                        padding: '12px',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #dee2e6',
                                    }}>
                                    <div
                                        style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: '#17a2b8',
                                        }}>
                                        {usageStats.usedCategories}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '14px',
                                            color: '#666',
                                        }}>
                                        使用中分类
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 未使用的标签和分类 */}
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
                                border: '1px solid #e9ecef',
                                borderRadius: '8px',
                                overflow: 'hidden',
                            }}>
                            <div
                                style={{
                                    backgroundColor: '#fff3cd',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#856404',
                                    borderBottom: '1px solid #e9ecef',
                                }}>
                                🏷️ 未使用的标签
                            </div>
                            <div
                                style={{
                                    maxHeight: '200px',
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
                                                padding: '8px 16px',
                                                borderBottom:
                                                    '1px solid #f1f3f4',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}>
                                            <div>
                                                <span
                                                    style={{
                                                        fontFamily: 'monospace',
                                                        color: '#6c757d',
                                                    }}>
                                                    {alias}
                                                </span>
                                                <span
                                                    style={{
                                                        margin: '0 8px',
                                                        color: '#dee2e6',
                                                    }}>
                                                    →
                                                </span>
                                                <span>{fullName}</span>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleDeleteTag(
                                                        alias,
                                                        false,
                                                    )
                                                }
                                                style={{
                                                    padding: '2px 8px',
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
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
                                            padding: '16px',
                                            textAlign: 'center',
                                            color: '#6c757d',
                                            fontSize: '14px',
                                        }}>
                                        所有标签都在使用中
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 未使用的分类 */}
                        <div
                            style={{
                                border: '1px solid #e9ecef',
                                borderRadius: '8px',
                                overflow: 'hidden',
                            }}>
                            <div
                                style={{
                                    backgroundColor: '#d1ecf1',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#0c5460',
                                    borderBottom: '1px solid #e9ecef',
                                }}>
                                📂 未使用的分类
                            </div>
                            <div
                                style={{
                                    maxHeight: '200px',
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
                                                padding: '8px 16px',
                                                borderBottom:
                                                    '1px solid #f1f3f4',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}>
                                            <div>
                                                <span
                                                    style={{
                                                        fontFamily: 'monospace',
                                                        color: '#6c757d',
                                                    }}>
                                                    {alias}
                                                </span>
                                                <span
                                                    style={{
                                                        margin: '0 8px',
                                                        color: '#dee2e6',
                                                    }}>
                                                    →
                                                </span>
                                                <span>{fullName}</span>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleDeleteCategory(
                                                        alias,
                                                        false,
                                                    )
                                                }
                                                style={{
                                                    padding: '2px 8px',
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
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
                                            padding: '16px',
                                            textAlign: 'center',
                                            color: '#6c757d',
                                            fontSize: '14px',
                                        }}>
                                        所有分类都在使用中
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 批量操作 */}
                    <div
                        style={{
                            backgroundColor: '#f8f9fa',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef',
                        }}>
                        <h4
                            style={{
                                margin: '0 0 12px 0',
                                fontSize: '16px',
                                color: '#495057',
                            }}>
                            🔧 批量操作
                        </h4>
                        <div
                            style={{
                                display: 'flex',
                                gap: '12px',
                                flexWrap: 'wrap',
                            }}>
                            {' '}
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
                                        console.log('🧹 批量清理未使用标签...');
                                        unusedTags.forEach(([alias]) => {
                                            globalMetaManager.deleteTagMapping(
                                                alias,
                                            );
                                        });

                                        // 立即保存配置更改 (标签删除不需要更新单词数据，因为它们本来就未使用)
                                        loadConfig();
                                        console.log(
                                            `✅ 已删除 ${unusedTags.length} 个未使用的标签`,
                                        );
                                    }
                                }}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#ffc107',
                                    color: '#212529',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
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
                                        console.log('🧹 批量清理未使用分类...');
                                        unusedCategories.forEach(([alias]) => {
                                            globalMetaManager.deleteCategoryMapping(
                                                alias,
                                            );
                                        });

                                        // 立即保存配置更改 (分类删除不需要更新单词数据，因为它们本来就未使用)
                                        loadConfig();
                                        console.log(
                                            `✅ 已删除 ${unusedCategories.length} 个未使用的分类`,
                                        );
                                    }
                                }}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#17a2b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
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
                                    padding: '8px 16px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}>
                                刷新统计
                            </button>
                        </div>
                    </div>
                </div>
            )}{' '}
            {/* 统计信息 */}
            {activeTab === 'stats' && (
                <div>
                    <h3
                        style={{
                            margin: '0 0 16px 0',
                            fontSize: '18px',
                            color: '#333',
                        }}>
                        系统统计信息
                    </h3>

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
                                backgroundColor: '#e3f2fd',
                                padding: '16px',
                                borderRadius: '8px',
                                border: '1px solid #bbdefb',
                            }}>
                            <div
                                style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#1976d2',
                                }}>
                                {Object.keys(config.tags).length}
                            </div>
                            <div
                                style={{
                                    color: '#666',
                                    fontSize: '14px',
                                    marginTop: '4px',
                                }}>
                                🏷️ 标签别名数量
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: '#f3e5f5',
                                padding: '16px',
                                borderRadius: '8px',
                                border: '1px solid #ce93d8',
                            }}>
                            <div
                                style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#7b1fa2',
                                }}>
                                {Object.keys(config.categories).length}
                            </div>
                            <div
                                style={{
                                    color: '#666',
                                    fontSize: '14px',
                                    marginTop: '4px',
                                }}>
                                📂 分类别名数量
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: '#e8f5e8',
                                padding: '16px',
                                borderRadius: '8px',
                                border: '1px solid #a5d6a7',
                            }}>
                            <div
                                style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#388e3c',
                                }}>
                                {stats.spaceSaved}
                            </div>
                            <div
                                style={{
                                    color: '#666',
                                    fontSize: '14px',
                                    marginTop: '4px',
                                }}>
                                💾 节省字符数
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: '#fff3e0',
                                padding: '16px',
                                borderRadius: '8px',
                                border: '1px solid #ffcc02',
                            }}>
                            <div
                                style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#f57c00',
                                }}>
                                {words.length}
                            </div>
                            <div
                                style={{
                                    color: '#666',
                                    fontSize: '14px',
                                    marginTop: '4px',
                                }}>
                                📝 单词总数
                            </div>
                        </div>
                    </div>

                    {/* 详细使用统计 */}
                    {usageStats && (
                        <div
                            style={{
                                marginBottom: '20px',
                                border: '1px solid #e9ecef',
                                borderRadius: '8px',
                                overflow: 'hidden',
                            }}>
                            <div
                                style={{
                                    backgroundColor: '#f8f9fa',
                                    padding: '12px 16px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#495057',
                                    borderBottom: '1px solid #e9ecef',
                                }}>
                                📊 详细使用统计
                            </div>
                            <div style={{ padding: '16px' }}>
                                <div
                                    style={{
                                        display: 'grid',
                                        gap: '16px',
                                        gridTemplateColumns:
                                            'repeat(auto-fit, minmax(250px, 1fr))',
                                    }}>
                                    <div>
                                        <h5
                                            style={{
                                                margin: '0 0 8px 0',
                                                color: '#007ACC',
                                            }}>
                                            标签使用情况
                                        </h5>
                                        <div
                                            style={{
                                                fontSize: '14px',
                                                color: '#666',
                                                lineHeight: '1.6',
                                            }}>
                                            <div>
                                                总标签数：
                                                <strong>
                                                    {usageStats.totalTags}
                                                </strong>
                                            </div>
                                            <div>
                                                使用中：
                                                <strong
                                                    style={{
                                                        color: '#28a745',
                                                    }}>
                                                    {usageStats.usedTags}
                                                </strong>
                                            </div>
                                            <div>
                                                未使用：
                                                <strong
                                                    style={{
                                                        color: '#dc3545',
                                                    }}>
                                                    {usageStats.totalTags -
                                                        usageStats.usedTags}
                                                </strong>
                                            </div>
                                            <div>
                                                使用率：
                                                <strong>
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
                                                margin: '0 0 8px 0',
                                                color: '#7b1fa2',
                                            }}>
                                            分类使用情况
                                        </h5>
                                        <div
                                            style={{
                                                fontSize: '14px',
                                                color: '#666',
                                                lineHeight: '1.6',
                                            }}>
                                            <div>
                                                总分类数：
                                                <strong>
                                                    {usageStats.totalCategories}
                                                </strong>
                                            </div>
                                            <div>
                                                使用中：
                                                <strong
                                                    style={{
                                                        color: '#28a745',
                                                    }}>
                                                    {usageStats.usedCategories}
                                                </strong>
                                            </div>
                                            <div>
                                                未使用：
                                                <strong
                                                    style={{
                                                        color: '#dc3545',
                                                    }}>
                                                    {usageStats.totalCategories -
                                                        usageStats.usedCategories}
                                                </strong>
                                            </div>
                                            <div>
                                                使用率：
                                                <strong>
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
                                        marginTop: '16px',
                                        padding: '12px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '6px',
                                    }}>
                                    <h5
                                        style={{
                                            margin: '0 0 8px 0',
                                            color: '#495057',
                                        }}>
                                        空间节省分析
                                    </h5>
                                    <div
                                        style={{
                                            fontSize: '14px',
                                            color: '#666',
                                            lineHeight: '1.6',
                                        }}>
                                        <div>
                                            总节省字符：
                                            <strong
                                                style={{ color: '#388e3c' }}>
                                                {stats.spaceSaved}
                                            </strong>
                                        </div>
                                        <div>
                                            平均每个单词节省：
                                            <strong>
                                                {words.length > 0
                                                    ? Math.round(
                                                          stats.spaceSaved /
                                                              words.length,
                                                      )
                                                    : 0}
                                            </strong>{' '}
                                            字符
                                        </div>
                                        <div>
                                            预估空间节省率：
                                            <strong
                                                style={{ color: '#f57c00' }}>
                                                约 35%
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div
                        style={{
                            marginTop: '20px',
                            padding: '16px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef',
                        }}>
                        <h4
                            style={{
                                margin: '0 0 12px 0',
                                fontSize: '16px',
                                color: '#495057',
                            }}>
                            🔍 配置详情
                        </h4>
                        <div
                            style={{
                                fontSize: '14px',
                                color: '#6c757d',
                                lineHeight: '1.5',
                            }}>
                            <div>
                                <strong>版本:</strong> {config.version}
                            </div>
                            <div>
                                <strong>最后更新:</strong>{' '}
                                {new Date(
                                    config.lastUpdate || '',
                                ).toLocaleString()}
                            </div>
                            <div>
                                <strong>总别名数量:</strong>{' '}
                                {Object.keys(config.tags).length +
                                    Object.keys(config.categories).length}
                            </div>
                            <div style={{ marginTop: '8px' }}>
                                <strong>优势:</strong>{' '}
                                双层元数据系统通过别名映射显著减少存储空间，提高文档可读性和维护效率
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalMetaConfigComponent;

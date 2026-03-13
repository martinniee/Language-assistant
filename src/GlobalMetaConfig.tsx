// 全局元数据配置组件
import React, { useState, useEffect } from 'react';
import { GlobalMetaManager, GlobalMetaConfig } from './GlobalMetaManager';

const GlobalMetaConfigComponent: React.FC = () => {
    const [config, setConfig] = useState<GlobalMetaConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'tags' | 'categories' | 'stats'>(
        'tags',
    );
    const [newTag, setNewTag] = useState({ alias: '', fullName: '' });
    const [newCategory, setNewCategory] = useState({ alias: '', fullName: '' });

    const globalMetaManager = GlobalMetaManager.getInstance();

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = () => {
        setIsLoading(true);
        const currentConfig = globalMetaManager.getConfig();
        setConfig(currentConfig);
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

    const handleDeleteTag = (alias: string) => {
        if (config && confirm(`确定要删除标签别名 "${alias}" 吗？`)) {
            const newTags = { ...config.tags };
            delete newTags[alias];
            globalMetaManager.setConfig({ ...config, tags: newTags });
            loadConfig();
        }
    };

    const handleDeleteCategory = (alias: string) => {
        if (config && confirm(`确定要删除分类别名 "${alias}" 吗？`)) {
            const newCategories = { ...config.categories };
            delete newCategories[alias];
            globalMetaManager.setConfig({
                ...config,
                categories: newCategories,
            });
            loadConfig();
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
                    </div>

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
                                ([alias, fullName]) => (
                                    <div
                                        key={alias}
                                        style={{
                                            display: 'flex',
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #f1f3f4',
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
                                            {fullName}
                                        </div>
                                        <div
                                            style={{
                                                width: '80px',
                                                textAlign: 'center',
                                            }}>
                                            <button
                                                onClick={() =>
                                                    handleDeleteTag(alias)
                                                }
                                                style={{
                                                    padding: '4px 8px',
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
                                    </div>
                                ),
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
                    </div>

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
                                ([alias, fullName]) => (
                                    <div
                                        key={alias}
                                        style={{
                                            display: 'flex',
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #f1f3f4',
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
                                            {fullName}
                                        </div>
                                        <div
                                            style={{
                                                width: '80px',
                                                textAlign: 'center',
                                            }}>
                                            <button
                                                onClick={() =>
                                                    handleDeleteCategory(alias)
                                                }
                                                style={{
                                                    padding: '4px 8px',
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
                                    </div>
                                ),
                            )
                        )}
                    </div>
                </div>
            )}

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
                                ~35%
                            </div>
                            <div
                                style={{
                                    color: '#666',
                                    fontSize: '14px',
                                    marginTop: '4px',
                                }}>
                                📊 预估空间节省
                            </div>
                        </div>
                    </div>

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

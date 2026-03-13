// 主应用组件 - 支持导航和多模块功能
import React, { useState, useMemo } from 'react';
import { Word } from './MarkdownWordStorage';
import WordManagerMarkdown from './WordManagerMarkdownNew';
import SpacedRepetitionLearning from './SpacedRepetitionLearning';
import DataStatistics from './DataStatistics';
import ImportExport from './ImportExport';
import Settings from './Settings';

type ViewMode = 'home' | 'srs' | 'statistics' | 'import-export' | 'settings';

interface MainAppProps {
    words: Word[];
    onAdd: (word: Word) => void;
    onEdit: (word: Word, originalWord?: Word) => void;
    onDelete: (name: string) => void;
    onJumpToSource: (wordId: string) => void;
}

const MainApp: React.FC<MainAppProps> = ({
    words,
    onAdd,
    onEdit,
    onDelete,
    onJumpToSource,
}) => {
    const [currentView, setCurrentView] = useState<ViewMode>('home');
    const [isCollapsed, setIsCollapsed] = useState(false); // 新增折叠状态

    // 计算统计信息用于导航栏显示
    const stats = useMemo(() => {
        const totalWords = words.length;
        const dueWords = words.filter((word) => {
            const nextReviewDate = word.metadata.nextReviewDate
                ? new Date(word.metadata.nextReviewDate)
                : null;
            return !nextReviewDate || nextReviewDate <= new Date();
        }).length;

        return { totalWords, dueWords };
    }, [words]);

    const navigationItems = [
        {
            id: 'home' as ViewMode,
            label: '单词管理',
            icon: '📚',
            description: '添加、编辑和管理单词',
        },
        {
            id: 'srs' as ViewMode,
            label: '间隔学习',
            icon: '🧠',
            description: '间隔重复学习系统',
            badge: stats.dueWords > 0 ? stats.dueWords : undefined,
        },
        {
            id: 'statistics' as ViewMode,
            label: '数据统计',
            icon: '📊',
            description: '学习进度和统计分析',
        },
        {
            id: 'import-export' as ViewMode,
            label: '导入导出',
            icon: '💾',
            description: '数据导入导出功能',
        },
        {
            id: 'settings' as ViewMode,
            label: '配置设置',
            icon: '⚙️',
            description: '系统设置和偏好配置',
        },
    ];

    const renderContent = () => {
        switch (currentView) {
            case 'home':
                return (
                    <WordManagerMarkdown
                        words={words}
                        onAdd={onAdd}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onJumpToSource={onJumpToSource}
                    />
                );
            case 'srs':
                return (
                    <SpacedRepetitionLearning
                        words={words}
                        onUpdateWord={onEdit}
                    />
                );
            case 'statistics':
                return <DataStatistics words={words} />;
            case 'import-export':
                return (
                    <ImportExport
                        words={words}
                        onImportWords={onAdd}
                        onUpdateWords={onEdit}
                    />
                );
            case 'settings':
                return <Settings />;
            default:
                return <div>页面不存在</div>;
        }
    };
    return (
        <div
            style={{
                display: 'flex',
                height: '100vh',
                backgroundColor: '#f5f5f5',
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
            {/* 左侧导航栏 */}
            <div
                style={{
                    width: isCollapsed ? '80px' : '280px',
                    backgroundColor: '#ffffff',
                    borderRight: '1px solid #e0e0e0',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    transition: 'width 0.3s ease',
                }}>
                {/* 应用标题和折叠按钮 */}
                <div
                    style={{
                        padding: isCollapsed
                            ? '20px 12px 16px'
                            : '20px 20px 16px',
                        borderBottom: '1px solid #f0f0f0',
                        backgroundColor: '#fafafa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed
                            ? 'center'
                            : 'space-between',
                    }}>
                    {!isCollapsed && (
                        <div style={{ flex: 1 }}>
                            <h2
                                style={{
                                    margin: 0,
                                    color: '#2c3e50',
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    letterSpacing: '-0.3px',
                                }}>
                                🎓 语言助手
                            </h2>
                            <p
                                style={{
                                    margin: '4px 0 0',
                                    color: '#7f8c8d',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                }}>
                                共 {stats.totalWords} 个单词
                            </p>
                        </div>
                    )}

                    {/* 折叠/展开按钮 */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            color: '#6b7280',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                            e.currentTarget.style.color = '#374151';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                                'transparent';
                            e.currentTarget.style.color = '#6b7280';
                        }}>
                        {isCollapsed ? '▶' : '◀'}
                    </button>
                </div>

                {/* 今日待学状态卡片 - 折叠时变为小图标 */}
                {!isCollapsed ? (
                    <div
                        style={{
                            margin: '16px 16px 12px',
                            padding: '12px 14px',
                            backgroundColor:
                                stats.dueWords > 0 ? '#fff5f5' : '#f0f9f0',
                            borderRadius: '8px',
                            border: `1px solid ${
                                stats.dueWords > 0 ? '#fed7d7' : '#c6f6d5'
                            }`,
                        }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                            <div>
                                <div
                                    style={{
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#4a5568',
                                        marginBottom: '3px',
                                    }}>
                                    今日待学
                                </div>
                                <div
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        color:
                                            stats.dueWords > 0
                                                ? '#e53e3e'
                                                : '#38a169',
                                    }}>
                                    {stats.dueWords > 0
                                        ? `${stats.dueWords} 个`
                                        : '完成'}
                                </div>
                            </div>
                            <div
                                style={{
                                    fontSize: '20px',
                                    opacity: 0.7,
                                }}>
                                {stats.dueWords > 0 ? '📚' : '🎉'}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            margin: '16px 12px',
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor:
                                    stats.dueWords > 0 ? '#fee2e2' : '#dcfce7',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                position: 'relative',
                            }}>
                            {stats.dueWords > 0 ? '📚' : '🎉'}
                            {stats.dueWords > 0 && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '-4px',
                                        right: '-4px',
                                        backgroundColor: '#dc2626',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '18px',
                                        height: '18px',
                                        fontSize: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '700',
                                    }}>
                                    {stats.dueWords > 9 ? '9+' : stats.dueWords}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 导航菜单 */}
                <nav
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: isCollapsed ? '0 8px' : '0 16px',
                    }}>
                    {navigationItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isCollapsed
                                    ? 'center'
                                    : 'flex-start',
                                padding: isCollapsed ? '12px 8px' : '12px 14px',
                                marginBottom: '4px',
                                border: 'none',
                                backgroundColor:
                                    currentView === item.id
                                        ? '#e3f2fd'
                                        : 'transparent',
                                color:
                                    currentView === item.id
                                        ? '#1565c0'
                                        : '#4a5568',
                                fontSize: '14px',
                                fontWeight:
                                    currentView === item.id ? '600' : '500',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s ease',
                                borderRadius: '8px',
                                outline: 'none',
                                position: 'relative',
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== item.id) {
                                    e.currentTarget.style.backgroundColor =
                                        '#f7fafc';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== item.id) {
                                    e.currentTarget.style.backgroundColor =
                                        'transparent';
                                }
                            }}
                            title={
                                isCollapsed
                                    ? `${item.label} - ${item.description}`
                                    : undefined
                            }>
                            <span
                                style={{
                                    marginRight: isCollapsed ? 0 : '12px',
                                    fontSize: '16px',
                                    width: '18px',
                                    height: '18px',
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                {item.icon}
                            </span>

                            {!isCollapsed && (
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontWeight: 'inherit',
                                            lineHeight: '1.3',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                        {item.label}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            color:
                                                currentView === item.id
                                                    ? '#1976d2'
                                                    : '#9ca3af',
                                            marginTop: '1px',
                                            lineHeight: '1.2',
                                            opacity: 0.8,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                        {item.description}
                                    </div>
                                </div>
                            )}

                            {item.badge && (
                                <span
                                    style={{
                                        position: isCollapsed
                                            ? 'absolute'
                                            : 'static',
                                        top: isCollapsed ? '8px' : 'auto',
                                        right: isCollapsed ? '8px' : 'auto',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        borderRadius: '10px',
                                        padding: isCollapsed
                                            ? '2px 6px'
                                            : '3px 7px',
                                        fontSize: isCollapsed ? '9px' : '10px',
                                        fontWeight: '600',
                                        minWidth: isCollapsed ? '16px' : '18px',
                                        textAlign: 'center',
                                        marginLeft: isCollapsed ? 0 : '8px',
                                        lineHeight: '1',
                                    }}>
                                    {isCollapsed && item.badge > 9
                                        ? '9+'
                                        : item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* 底部版本信息 */}
                {!isCollapsed && (
                    <div
                        style={{
                            padding: '12px 16px',
                            borderTop: '1px solid #f0f0f0',
                            backgroundColor: '#fafafa',
                            fontSize: '11px',
                            color: '#9ca3af',
                            textAlign: 'center',
                        }}>
                        Language Assistant v1.0
                    </div>
                )}
            </div>
            {/* 右侧内容区域 */}
            <div
                style={{
                    flex: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#ffffff',
                }}>
                {/* 内容头部 */}
                <div
                    style={{
                        padding: '24px 32px 20px',
                        backgroundColor: '#ffffff',
                        borderBottom: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                        }}>
                        <span
                            style={{
                                fontSize: '24px',
                                marginRight: '12px',
                            }}>
                            {
                                navigationItems.find(
                                    (item) => item.id === currentView,
                                )?.icon
                            }
                        </span>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: '26px',
                                color: '#1f2937',
                                fontWeight: '700',
                                letterSpacing: '-0.5px',
                            }}>
                            {navigationItems.find(
                                (item) => item.id === currentView,
                            )?.label || '未知页面'}
                        </h1>
                    </div>
                    <p
                        style={{
                            margin: 0,
                            color: '#6b7280',
                            fontSize: '15px',
                            lineHeight: '1.5',
                        }}>
                        {
                            navigationItems.find(
                                (item) => item.id === currentView,
                            )?.description
                        }
                    </p>
                </div>

                {/* 主内容区域 */}
                <div
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        backgroundColor: '#f9fafb',
                        padding: '24px 32px 32px',
                    }}>
                    <div
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            minHeight: 'calc(100vh - 200px)',
                            overflow: 'hidden',
                        }}>
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainApp;

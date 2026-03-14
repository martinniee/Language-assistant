// 主应用组件 - 支持导航和多模块功能
import React, { useState, useMemo } from 'react';
import { Word, WordHelper } from './MarkdownWordStorage';
import {
    BookOpen,
    Brain,
    BarChart2,
    HardDrive,
    Database,
    Settings as SettingsIcon,
    GraduationCap,
    ChevronRight,
    ChevronLeft,
    Target,
    Award,
} from 'lucide-react';
import WordManagerMarkdown from './WordManagerMarkdownNew';
import SpacedRepetitionLearning from './SpacedRepetitionLearning';
import DataStatistics from './DataStatistics';
import ImportExport from './ImportExport';
import Settings from './Settings';
import GlobalMetaConfig from './GlobalMetaConfig';

type ViewMode =
    | 'home'
    | 'srs'
    | 'statistics'
    | 'import-export'
    | 'settings'
    | 'global-meta';

interface MainAppProps {
    words: Word[];
    onAdd: (word: Word) => void;
    onEdit: (word: Word, originalWord?: Word, silent?: boolean) => void;
    onDelete: (name: string) => void;
    onBatchUpdate?: (words: Word[]) => void; // 新增批量更新方法
    onJumpToSource: (wordId: string) => void;
}

const MainApp: React.FC<MainAppProps> = ({
    words,
    onAdd,
    onEdit,
    onDelete,
    onBatchUpdate,
    onJumpToSource,
}) => {
    const [currentView, setCurrentView] = useState<ViewMode>('home');
    const [isCollapsed, setIsCollapsed] = useState(false); // 新增折叠状态

    // 添加调试信息，监控数据变化
    React.useEffect(() => {
        console.log(`📊 MainApp received ${words.length} words`);
    }, [words]); // 计算统计信息用于导航栏显示
    const stats = useMemo(() => {
        const totalWords = words.length;
        const dueWords = words.filter((word) => {
            const nextReviewDate = WordHelper.getNextReviewDate(word);
            return !nextReviewDate || nextReviewDate <= new Date();
        }).length;

        console.log(`📈 Stats updated: ${totalWords} total, ${dueWords} due`);
        return { totalWords, dueWords };
    }, [words]);

    const navigationItems = [
        {
            id: 'home' as ViewMode,
            label: '单词管理',
            icon: <BookOpen size={20} />,
            description: '添加、编辑和管理单词',
        },
        {
            id: 'srs' as ViewMode,
            label: '间隔学习',
            icon: <Brain size={20} />,
            description: '间隔重复学习系统',
            badge: stats.dueWords > 0 ? stats.dueWords : undefined,
        },
        {
            id: 'statistics' as ViewMode,
            label: '数据统计',
            icon: <BarChart2 size={20} />,
            description: '学习进度和统计分析',
        },
        {
            id: 'import-export' as ViewMode,
            label: '导入导出',
            icon: <HardDrive size={20} />,
            description: '数据导入导出功能',
        },
        {
            id: 'global-meta' as ViewMode,
            label: '元数据管理',
            icon: <Database size={20} />,
            description: '全局元数据配置和别名管理',
        },
        {
            id: 'settings' as ViewMode,
            label: '配置设置',
            icon: <SettingsIcon size={20} />,
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
            case 'global-meta':
                return (
                    <GlobalMetaConfig
                        words={words}
                        onWordsUpdate={
                            onBatchUpdate ||
                            (async (updatedWords) => {
                                console.log(
                                    '🔄 GlobalMetaConfig 更新单词数据，使用fallback方法...',
                                );
                                // 批量更新单词 - 每个更新都会立即保存到文件
                                for (const word of updatedWords) {
                                    // 找到原始单词用于比较
                                    const originalWord = words.find(
                                        (w) => w.name === word.name,
                                    );
                                    if (originalWord) {
                                        console.log(
                                            `📝 更新单词: ${word.name}`,
                                        );
                                        await new Promise((resolve) => {
                                            onEdit(word, originalWord);
                                            // 给一点时间让保存操作完成
                                            setTimeout(resolve, 10);
                                        });
                                    }
                                }
                                console.log('✅ 批量更新完成');
                            })
                        }
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
                backgroundColor: '#F2F2F7',
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
            }}>
            {/* 左侧导航栏 - iOS 风格 */}
            <div
                style={{
                    width: isCollapsed ? '72px' : '260px',
                    backgroundColor: '#FAFAFA',
                    borderRight: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                    transition: 'width 0.35s cubic-bezier(0.4, 0.0, 0.2, 1)',
                }}>
                {/* 应用标题和折叠按钮 */}
                <div
                    style={{
                        padding: isCollapsed
                            ? '24px 8px 20px'
                            : '24px 20px 20px',
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                        backgroundColor: '#ffffff',
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
                                    color: '#1C1C1E',
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    letterSpacing: '-0.4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                <GraduationCap
                                    size={22}
                                    color="#007AFF"
                                />{' '}
                                语言助手
                            </h2>
                            <p
                                style={{
                                    margin: '6px 0 0',
                                    color: '#8E8E93',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    letterSpacing: '-0.1px',
                                }}>
                                共 {stats.totalWords} 个单词
                            </p>
                        </div>
                    )}

                    {/* 折叠/展开按钮 - iOS 风格 */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            width: '36px',
                            height: '36px',
                            border: 'none',
                            backgroundColor: '#F2F2F7',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            color: '#8E8E93',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            outline: 'none',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#E5E5EA';
                            e.currentTarget.style.color = '#1C1C1E';
                            e.currentTarget.style.transform = 'scale(0.95)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#F2F2F7';
                            e.currentTarget.style.color = '#8E8E93';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}>
                        {isCollapsed ? (
                            <ChevronRight size={16} />
                        ) : (
                            <ChevronLeft size={16} />
                        )}
                    </button>
                </div>

                {/* 今日待学状态卡片 - iOS 风格 */}
                {!isCollapsed ? (
                    <div
                        style={{
                            margin: '16px 16px 12px',
                            padding: '16px',
                            backgroundColor:
                                stats.dueWords > 0
                                    ? 'linear-gradient(135deg, #FFF5F5 0%, #FFE5E5 100%)'
                                    : 'linear-gradient(135deg, #F0FFF4 0%, #E6F7EB 100%)',
                            borderRadius: '14px',
                            border: 'none',
                            boxShadow:
                                stats.dueWords > 0
                                    ? '0 4px 12px rgba(255, 59, 48, 0.15)'
                                    : '0 4px 12px rgba(52, 199, 89, 0.15)',
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
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#8E8E93',
                                        marginBottom: '4px',
                                        letterSpacing: '-0.1px',
                                    }}>
                                    今日待学
                                </div>
                                <div
                                    style={{
                                        fontSize: '24px',
                                        fontWeight: '700',
                                        color:
                                            stats.dueWords > 0
                                                ? '#FF3B30'
                                                : '#34C759',
                                        letterSpacing: '-0.5px',
                                    }}>
                                    {stats.dueWords > 0
                                        ? `${stats.dueWords} 个`
                                        : '完成'}
                                </div>
                            </div>
                            <div
                                style={{
                                    fontSize: '32px',
                                    opacity: 0.8,
                                    color:
                                        stats.dueWords > 0
                                            ? '#FF3B30'
                                            : '#34C759',
                                    display: 'flex',
                                }}>
                                {stats.dueWords > 0 ? (
                                    <Target size={32} />
                                ) : (
                                    <Award size={32} />
                                )}
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
                                width: '48px',
                                height: '48px',
                                background:
                                    stats.dueWords > 0
                                        ? 'linear-gradient(135deg, #FFE5E5 0%, #FFC9C9 100%)'
                                        : 'linear-gradient(135deg, #E6F7EB 0%, #C6F6D5 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '22px',
                                position: 'relative',
                                boxShadow:
                                    stats.dueWords > 0
                                        ? '0 4px 12px rgba(255, 59, 48, 0.2)'
                                        : '0 4px 12px rgba(52, 199, 89, 0.2)',
                                color:
                                    stats.dueWords > 0 ? '#FF3B30' : '#34C759',
                            }}>
                            {stats.dueWords > 0 ? (
                                <Target size={24} />
                            ) : (
                                <Award size={24} />
                            )}
                            {stats.dueWords > 0 && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '-2px',
                                        right: '-2px',
                                        backgroundColor: '#FF3B30',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '20px',
                                        height: '20px',
                                        fontSize: '11px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '700',
                                        border: '2px solid #FAFAFA',
                                        boxShadow:
                                            '0 2px 8px rgba(255, 59, 48, 0.4)',
                                    }}>
                                    {stats.dueWords > 9 ? '9+' : stats.dueWords}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 导航菜单 - iOS 风格 */}
                <nav
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: isCollapsed ? '0 8px' : '0 12px',
                        paddingBottom: '12px',
                    }}>
                    {' '}
                    {navigationItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            className={`la-nav-item${
                                currentView === item.id ? ' la-nav-active' : ''
                            }`}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isCollapsed
                                    ? 'center'
                                    : 'flex-start',
                                padding: isCollapsed ? '14px 8px' : '14px 16px',
                                marginBottom: '6px',
                                border: 'none',
                                backgroundColor:
                                    currentView === item.id
                                        ? '#007AFF'
                                        : 'transparent',
                                color:
                                    currentView === item.id
                                        ? '#ffffff'
                                        : '#1C1C1E',
                                fontSize: '15px',
                                fontWeight:
                                    currentView === item.id ? '600' : '500',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition:
                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                borderRadius: '12px',
                                outline: 'none',
                                position: 'relative',
                                boxShadow:
                                    currentView === item.id
                                        ? '0 4px 12px rgba(0, 122, 255, 0.25)'
                                        : 'none',
                                letterSpacing: '-0.2px',
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== item.id) {
                                    e.currentTarget.style.backgroundColor =
                                        '#F2F2F7';
                                    e.currentTarget.style.transform =
                                        'scale(0.98)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== item.id) {
                                    e.currentTarget.style.backgroundColor =
                                        'transparent';
                                    e.currentTarget.style.transform =
                                        'scale(1)';
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
                                    width: '20px',
                                    height: '20px',
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                {item.icon}
                            </span>

                            {!isCollapsed && (
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {' '}
                                    <div
                                        style={{
                                            fontWeight: 'inherit',
                                            lineHeight: '1.4',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            color:
                                                currentView === item.id
                                                    ? '#ffffff'
                                                    : '#1C1C1E',
                                            WebkitTextFillColor:
                                                currentView === item.id
                                                    ? '#ffffff'
                                                    : '#1C1C1E',
                                        }}>
                                        {item.label}
                                    </div>{' '}
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color:
                                                currentView === item.id
                                                    ? 'rgba(255,255,255,0.85)'
                                                    : '#636366',
                                            WebkitTextFillColor:
                                                currentView === item.id
                                                    ? 'rgba(255,255,255,0.85)'
                                                    : '#636366',
                                            marginTop: '2px',
                                            lineHeight: '1.2',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            letterSpacing: '-0.1px',
                                            fontWeight: '400',
                                            opacity:
                                                currentView === item.id
                                                    ? 1
                                                    : 0.85,
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
                                        top: isCollapsed ? '6px' : 'auto',
                                        right: isCollapsed ? '6px' : 'auto',
                                        backgroundColor: '#FF3B30',
                                        color: 'white',
                                        borderRadius: '12px',
                                        padding: isCollapsed
                                            ? '3px 7px'
                                            : '4px 8px',
                                        fontSize: isCollapsed ? '10px' : '11px',
                                        fontWeight: '700',
                                        minWidth: isCollapsed ? '18px' : '20px',
                                        textAlign: 'center',
                                        marginLeft: isCollapsed ? 0 : '8px',
                                        lineHeight: '1',
                                        boxShadow:
                                            '0 2px 8px rgba(255, 59, 48, 0.3)',
                                    }}>
                                    {isCollapsed && item.badge > 9
                                        ? '9+'
                                        : item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* 底部版本信息 - iOS 风格 */}
                {!isCollapsed && (
                    <div
                        style={{
                            padding: '16px 20px',
                            borderTop: '1px solid rgba(0,0,0,0.04)',
                            backgroundColor: '#ffffff',
                            fontSize: '12px',
                            color: '#C7C7CC',
                            textAlign: 'center',
                            fontWeight: '500',
                            letterSpacing: '-0.1px',
                        }}>
                        Language Assistant v1.0
                    </div>
                )}
            </div>{' '}
            {/* 右侧内容区域 - iOS 风格 */}
            <div
                style={{
                    flex: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#ffffff',
                }}>
                {/* 内容头部 - iOS 风格 */}
                <div
                    style={{
                        padding: '28px 36px 24px',
                        backgroundColor: '#ffffff',
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                    }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '10px',
                        }}>
                        <span
                            style={{
                                marginRight: '14px',
                                display: 'flex',
                                color: '#007AFF',
                            }}>
                            {navigationItems.find(
                                (item) => item.id === currentView,
                            )?.icon
                                ? React.cloneElement(
                                      navigationItems.find(
                                          (item) => item.id === currentView,
                                      )!.icon as React.ReactElement,
                                      { size: 36 } as any,
                                  )
                                : null}
                        </span>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: '32px',
                                color: '#1C1C1E',
                                fontWeight: '700',
                                letterSpacing: '-1px',
                            }}>
                            {navigationItems.find(
                                (item) => item.id === currentView,
                            )?.label || '未知页面'}
                        </h1>
                    </div>
                    <p
                        style={{
                            margin: 0,
                            color: '#8E8E93',
                            fontSize: '15px',
                            lineHeight: '1.5',
                            fontWeight: '500',
                            letterSpacing: '-0.1px',
                        }}>
                        {
                            navigationItems.find(
                                (item) => item.id === currentView,
                            )?.description
                        }
                    </p>
                </div>

                {/* 主内容区域 - iOS 风格 */}
                <div
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        backgroundColor: '#F2F2F7',
                    }}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default MainApp;

// 主应用组件 - 支持导航和多模块功能
import React, { useState, useMemo } from 'react';
import { Word, WordHelper } from './MarkdownWordStorage';
import {
    BookOpen,
    Brain,
    BarChart2,
    HardDrive,
    Layers,
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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<ViewMode | null>(null);

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
            icon: <Layers size={20} />,
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
            {/* ────────────── 左侧导航栏 ────────────── */}
            <div
                style={{
                    width: isCollapsed ? '68px' : '240px',
                    backgroundColor: '#FAFAFA',
                    borderRight: '1px solid rgba(0,0,0,0.07)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'width 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    overflow: 'hidden',
                    flexShrink: 0,
                }}>
                {/* ── 顶部 Header ── */}
                <div
                    style={{
                        padding: isCollapsed
                            ? '20px 10px 16px'
                            : '20px 16px 16px',
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed
                            ? 'center'
                            : 'space-between',
                        gap: 8,
                        minHeight: '72px',
                        backgroundColor: '#ffffff',
                    }}>
                    {/* App logo + 标题 */}
                    {!isCollapsed && (
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 3,
                                }}>
                                <GraduationCap
                                    size={20}
                                    color="#007AFF"
                                />
                                <span
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        color: '#1C1C1E',
                                        WebkitTextFillColor: '#1C1C1E',
                                        letterSpacing: '-0.4px',
                                        lineHeight: 1,
                                    }}>
                                    语言助手
                                </span>
                            </div>
                            <div
                                style={{
                                    fontSize: '12px',
                                    color: '#8E8E93',
                                    WebkitTextFillColor: '#8E8E93',
                                    fontWeight: '500',
                                    paddingLeft: 28,
                                }}>
                                共 {stats.totalWords} 个单词
                            </div>
                        </div>
                    )}{' '}
                    {/* 折叠时：logo 本身即展开按钮 */}
                    {isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(false)}
                            title="展开侧边栏"
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                backgroundColor: '#EBF4FF',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                                transition: 'all 0.15s ease',
                                flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#D6EBFF';
                                e.currentTarget.style.transform = 'scale(1.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#EBF4FF';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}>
                            <ChevronRight
                                size={18}
                                color="#007AFF"
                            />
                        </button>
                    )}
                    {/* 折叠/展开按钮 */}
                    {!isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(true)}
                            title="折叠侧边栏"
                            style={{
                                width: 30,
                                height: 30,
                                border: 'none',
                                backgroundColor: 'transparent',
                                borderRadius: 8,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#C7C7CC',
                                flexShrink: 0,
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#F2F2F7';
                                e.currentTarget.style.color = '#8E8E93';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    'transparent';
                                e.currentTarget.style.color = '#C7C7CC';
                            }}>
                            <ChevronLeft size={16} />
                        </button>
                    )}
                </div>
                {/* ── 今日待学状态卡片 ── */}
                {!isCollapsed && (
                    <div
                        style={{
                            margin: '12px 12px 4px',
                            padding: '12px 14px',
                            borderRadius: 14,
                            background:
                                stats.dueWords > 0
                                    ? 'linear-gradient(135deg, #FFF0EF 0%, #FFE0DE 100%)'
                                    : 'linear-gradient(135deg, #EDFDF4 0%, #D6F5E3 100%)',
                            boxShadow:
                                stats.dueWords > 0
                                    ? '0 2px 8px rgba(255, 59, 48, 0.12)'
                                    : '0 2px 8px rgba(52, 199, 89, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                        <div>
                            <div
                                style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#8E8E93',
                                    WebkitTextFillColor: '#8E8E93',
                                    letterSpacing: '0.2px',
                                    textTransform: 'uppercase',
                                    marginBottom: 4,
                                }}>
                                今日待学
                            </div>
                            <div
                                style={{
                                    fontSize: '22px',
                                    fontWeight: '700',
                                    color:
                                        stats.dueWords > 0
                                            ? '#FF3B30'
                                            : '#34C759',
                                    WebkitTextFillColor:
                                        stats.dueWords > 0
                                            ? '#FF3B30'
                                            : '#34C759',
                                    letterSpacing: '-0.5px',
                                    lineHeight: 1,
                                }}>
                                {stats.dueWords > 0
                                    ? `${stats.dueWords} 个`
                                    : '全部完成'}
                            </div>
                        </div>
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor:
                                    stats.dueWords > 0
                                        ? 'rgba(255,59,48,0.12)'
                                        : 'rgba(52,199,89,0.12)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color:
                                    stats.dueWords > 0 ? '#FF3B30' : '#34C759',
                                flexShrink: 0,
                            }}>
                            {stats.dueWords > 0 ? (
                                <Target size={22} />
                            ) : (
                                <Award size={22} />
                            )}
                        </div>
                    </div>
                )}
                {/* 折叠状态下的待学徽章 */}
                {isCollapsed && stats.dueWords > 0 && (
                    <div
                        style={{
                            margin: '10px auto',
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,59,48,0.10)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FF3B30',
                            position: 'relative',
                        }}>
                        <Target size={22} />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                backgroundColor: '#FF3B30',
                                color: 'white',
                                WebkitTextFillColor: 'white',
                                borderRadius: 8,
                                padding: '1px 5px',
                                fontSize: '10px',
                                fontWeight: '700',
                                lineHeight: '16px',
                                minWidth: 16,
                                textAlign: 'center',
                                border: '2px solid #FAFAFA',
                            }}>
                            {stats.dueWords > 9 ? '9+' : stats.dueWords}
                        </div>
                    </div>
                )}
                {/* ── 导航菜单 ── */}
                <nav
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: isCollapsed ? '8px 10px' : '8px 10px',
                    }}>
                    {navigationItems.map((item) => {
                        const isActive = currentView === item.id;
                        const isHovered = hoveredItem === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                onMouseEnter={() => setHoveredItem(item.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className={`la-nav-item${
                                    isActive ? ' la-nav-active' : ''
                                }`}
                                title={
                                    isCollapsed
                                        ? `${item.label} — ${item.description}`
                                        : undefined
                                }
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isCollapsed
                                        ? 'center'
                                        : 'flex-start',
                                    padding: isCollapsed
                                        ? '11px 0'
                                        : '10px 12px',
                                    marginBottom: 4,
                                    border: 'none',
                                    borderRadius: 11,
                                    backgroundColor: isActive
                                        ? '#007AFF'
                                        : isHovered
                                        ? '#F0F0F5'
                                        : 'transparent',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    outline: 'none',
                                    position: 'relative',
                                    boxShadow: isActive
                                        ? '0 3px 10px rgba(0, 122, 255, 0.22)'
                                        : 'none',
                                    transition:
                                        'background-color 0.15s ease, box-shadow 0.15s ease',
                                }}>
                                {/* 图标容器 */}
                                <span
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 9,
                                        backgroundColor: isActive
                                            ? 'rgba(255,255,255,0.20)'
                                            : isHovered
                                            ? 'rgba(0,122,255,0.08)'
                                            : '#F2F2F7',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        color: isActive ? '#ffffff' : '#007AFF',
                                        transition: 'all 0.15s ease',
                                        marginRight: isCollapsed ? 0 : 10,
                                    }}>
                                    {item.icon}
                                </span>

                                {/* 文字区域 */}
                                {!isCollapsed && (
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontSize: '14px',
                                                fontWeight: isActive
                                                    ? '600'
                                                    : '500',
                                                color: isActive
                                                    ? '#ffffff'
                                                    : '#1C1C1E',
                                                WebkitTextFillColor: isActive
                                                    ? '#ffffff'
                                                    : '#1C1C1E',
                                                lineHeight: '1.3',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                letterSpacing: '-0.2px',
                                            }}>
                                            {item.label}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '11px',
                                                fontWeight: '400',
                                                color: isActive
                                                    ? 'rgba(255,255,255,0.78)'
                                                    : '#8E8E93',
                                                WebkitTextFillColor: isActive
                                                    ? 'rgba(255,255,255,0.78)'
                                                    : '#8E8E93',
                                                marginTop: 1,
                                                lineHeight: '1.2',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                letterSpacing: '-0.1px',
                                            }}>
                                            {item.description}
                                        </div>
                                    </div>
                                )}

                                {/* 角标 badge */}
                                {item.badge && (
                                    <span
                                        style={{
                                            position: isCollapsed
                                                ? 'absolute'
                                                : 'static',
                                            top: isCollapsed ? 4 : 'auto',
                                            right: isCollapsed ? 4 : 'auto',
                                            backgroundColor: '#FF3B30',
                                            color: 'white',
                                            WebkitTextFillColor: 'white',
                                            borderRadius: 8,
                                            padding: '1px 6px',
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            lineHeight: '16px',
                                            minWidth: 16,
                                            textAlign: 'center',
                                            marginLeft: isCollapsed ? 0 : 6,
                                            border: isCollapsed
                                                ? '2px solid #FAFAFA'
                                                : 'none',
                                            flexShrink: 0,
                                        }}>
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>{' '}
                {/* ── 底部：版本信息 ── */}
                <div
                    style={{
                        padding: '10px 16px',
                        borderTop: '1px solid rgba(0,0,0,0.05)',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 44,
                    }}>
                    {!isCollapsed && (
                        <span
                            style={{
                                fontSize: '11px',
                                color: '#C7C7CC',
                                WebkitTextFillColor: '#C7C7CC',
                                fontWeight: '500',
                                letterSpacing: '0.1px',
                            }}>
                            Language Assistant v1.0
                        </span>
                    )}
                    {isCollapsed && (
                        <div
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: '#D1D1D6',
                            }}
                        />
                    )}
                </div>
            </div>

            {/* ────────────── 右侧内容区域 ────────────── */}
            <div
                style={{
                    flex: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#ffffff',
                    minWidth: 0,
                }}>
                {/* 内容顶部 Header */}
                <div
                    style={{
                        padding: '20px 28px 16px',
                        backgroundColor: '#ffffff',
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        flexShrink: 0,
                    }}>
                    {/* 图标 */}
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 13,
                            backgroundColor: '#EBF4FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: '#007AFF',
                        }}>
                        {navigationItems.find((i) => i.id === currentView)?.icon
                            ? React.cloneElement(
                                  navigationItems.find(
                                      (i) => i.id === currentView,
                                  )!.icon as React.ReactElement,
                                  { size: 24 } as any,
                              )
                            : null}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: '22px',
                                color: '#1C1C1E',
                                WebkitTextFillColor: '#1C1C1E',
                                fontWeight: '700',
                                letterSpacing: '-0.6px',
                                lineHeight: 1.2,
                            }}>
                            {
                                navigationItems.find(
                                    (i) => i.id === currentView,
                                )?.label
                            }
                        </h1>
                        <p
                            style={{
                                margin: '3px 0 0',
                                color: '#8E8E93',
                                WebkitTextFillColor: '#8E8E93',
                                fontSize: '13px',
                                fontWeight: '500',
                                letterSpacing: '-0.1px',
                            }}>
                            {
                                navigationItems.find(
                                    (i) => i.id === currentView,
                                )?.description
                            }
                        </p>
                    </div>
                </div>

                {/* 主内容区域 */}
                <div
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        backgroundColor: '#F2F2F7',
                    }}>
                    {renderContent()}{' '}
                </div>
            </div>
        </div>
    );
};

export default MainApp;

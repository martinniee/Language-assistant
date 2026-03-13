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
            }}>
            {/* 左侧导航栏 */}
            <div
                style={{
                    width: '280px',
                    backgroundColor: '#ffffff',
                    borderRight: '1px solid #e0e0e0',
                    padding: '20px 0',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                    overflowY: 'auto',
                }}>
                {/* 应用标题 */}
                <div
                    style={{
                        padding: '0 20px 20px',
                        borderBottom: '1px solid #f0f0f0',
                        marginBottom: '20px',
                    }}>
                    <h2
                        style={{
                            margin: 0,
                            color: '#2c3e50',
                            fontSize: '18px',
                            fontWeight: 'bold',
                        }}>
                        🎓 语言助手
                    </h2>
                    <p
                        style={{
                            margin: '5px 0 0',
                            color: '#7f8c8d',
                            fontSize: '12px',
                        }}>
                        共 {stats.totalWords} 个单词
                    </p>
                </div>

                {/* 导航菜单 */}
                <nav>
                    {navigationItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 20px',
                                border: 'none',
                                backgroundColor:
                                    currentView === item.id
                                        ? '#e3f2fd'
                                        : 'transparent',
                                color:
                                    currentView === item.id
                                        ? '#1976d2'
                                        : '#555',
                                fontSize: '14px',
                                fontWeight:
                                    currentView === item.id ? '600' : 'normal',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                                borderLeft:
                                    currentView === item.id
                                        ? '3px solid #1976d2'
                                        : '3px solid transparent',
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== item.id) {
                                    e.currentTarget.style.backgroundColor =
                                        '#f8f9fa';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== item.id) {
                                    e.currentTarget.style.backgroundColor =
                                        'transparent';
                                }
                            }}>
                            <span
                                style={{
                                    marginRight: '12px',
                                    fontSize: '16px',
                                }}>
                                {item.icon}
                            </span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'inherit' }}>
                                    {item.label}
                                </div>
                                <div
                                    style={{
                                        fontSize: '11px',
                                        color: '#999',
                                        marginTop: '2px',
                                        display:
                                            currentView === item.id
                                                ? 'block'
                                                : 'none',
                                    }}>
                                    {item.description}
                                </div>
                            </div>
                            {item.badge && (
                                <span
                                    style={{
                                        backgroundColor: '#ff4444',
                                        color: 'white',
                                        borderRadius: '10px',
                                        padding: '2px 8px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        minWidth: '18px',
                                        textAlign: 'center',
                                    }}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* 底部信息 */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '20px',
                        right: '20px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#666',
                    }}>
                    <div style={{ marginBottom: '5px' }}>
                        <strong>今日待学</strong>
                    </div>
                    <div
                        style={{
                            color: stats.dueWords > 0 ? '#e74c3c' : '#27ae60',
                        }}>
                        {stats.dueWords > 0
                            ? `${stats.dueWords} 个单词`
                            : '🎉 已完成'}
                    </div>
                </div>
            </div>

            {/* 右侧内容区域 */}
            <div
                style={{
                    flex: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                {/* 内容头部 */}
                <div
                    style={{
                        padding: '20px 30px 15px',
                        backgroundColor: '#ffffff',
                        borderBottom: '1px solid #e0e0e0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    }}>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: '24px',
                            color: '#2c3e50',
                            fontWeight: '600',
                        }}>
                        {navigationItems.find((item) => item.id === currentView)
                            ?.label || '未知页面'}
                    </h1>
                    <p
                        style={{
                            margin: '5px 0 0',
                            color: '#7f8c8d',
                            fontSize: '14px',
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
                        backgroundColor: '#ffffff',
                    }}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default MainApp;

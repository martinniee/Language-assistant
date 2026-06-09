import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
    Award,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    Target,
} from 'lucide-react';
import { WordHelper } from './MarkdownWordStorage';
import WordManagerMarkdown from './WordManagerMarkdownNew';
import SpacedRepetitionLearning from './SpacedRepetitionLearning';
import DataStatistics from './DataStatistics';
import ImportExport from './ImportExport';
import Settings from './Settings';
import GlobalMetaConfig from './GlobalMetaConfig';
import { MainAppProps, ViewMode } from './types/WordManagerType';
import { getNavigationItems } from './data/data';

const MainApp: React.FC<MainAppProps> = ({
    app,
    markdownSourcePath,
    words,
    onAdd,
    onEdit,
    onDelete,
    onBatchUpdate,
    onJumpToSource,
}) => {
    const [currentView, setCurrentView] = useState<ViewMode>('home');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const contentRef = useRef<HTMLElement | null>(null);
    const scrollPositionsRef = useRef<Partial<Record<ViewMode, number>>>({});

    /**
     * 保存当前主功能页的滚动位置，供再次返回该页面时恢复。
     */
    const saveCurrentViewScrollPosition = useCallback(() => {
        try {
            const contentEl = contentRef.current;
            if (!contentEl) return;
            scrollPositionsRef.current[currentView] = contentEl.scrollTop;
        } catch (error) {
            console.error('保存页面滚动位置失败:', error);
        }
    }, [currentView]);

    /**
     * 切换主功能页前先记录当前滚动位置，避免返回时回到顶部。
     */
    const handleViewChange = useCallback(
        (nextView: ViewMode) => {
            if (nextView === currentView) return;
            saveCurrentViewScrollPosition();
            setCurrentView(nextView);
        },
        [currentView, saveCurrentViewScrollPosition],
    );

    useLayoutEffect(() => {
        try {
            const contentEl = contentRef.current;
            if (!contentEl) return;
            const savedTop = scrollPositionsRef.current[currentView] ?? 0;
            contentEl.scrollTo({ top: savedTop, left: 0, behavior: 'auto' });
        } catch (error) {
            console.error('恢复页面滚动位置失败:', error);
        }
    }, [currentView]);

    const stats = useMemo(() => {
        const totalWords = words.length;
        const dueWords = words.filter((word) => {
            const nextReviewDate = WordHelper.getNextReviewDate(word);
            return !nextReviewDate || nextReviewDate <= new Date();
        }).length;

        return { totalWords, dueWords };
    }, [words]);

    const navigationItems = useMemo(
        () => getNavigationItems(stats.dueWords),
        [stats.dueWords],
    );

    const currentItem =
        navigationItems.find((item) => item.id === currentView) ||
        navigationItems[0];

    const renderContent = () => {
        switch (currentView) {
            case 'home':
                return (
                    <WordManagerMarkdown
                        app={app}
                        markdownSourcePath={markdownSourcePath}
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
                                for (const word of updatedWords) {
                                    const originalWord = words.find(
                                        (item) => item.name === word.name,
                                    );

                                    if (originalWord) {
                                        onEdit(word, originalWord, true);
                                    }
                                }
                            })
                        }
                    />
                );
            case 'settings':
                return <Settings />;
            default:
                return <div className="la-empty-state">页面不存在</div>;
        }
    };

    return (
        <div className={`la-app-shell${isCollapsed ? ' is-collapsed' : ''}`}>
            <aside
                className="la-sidebar"
                aria-label="Language assistant navigation">
                <div className="la-sidebar-header">
                    {!isCollapsed && (
                        <div className="la-brand">
                            <div className="la-brand-mark" aria-hidden="true">
                                <GraduationCap size={20} />
                            </div>
                            <div className="la-brand-copy">
                                <div className="la-brand-title">语言助手</div>
                                <div className="la-brand-subtitle">
                                    共 {stats.totalWords} 个单词
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        className="la-icon-button"
                        onClick={() => setIsCollapsed((value) => !value)}
                        aria-label={isCollapsed ? '展开侧边栏' : '折叠侧边栏'}
                        title={isCollapsed ? '展开侧边栏' : '折叠侧边栏'}
                        data-tooltip-position="right">
                        {isCollapsed ? (
                            <ChevronRight size={18} />
                        ) : (
                            <ChevronLeft size={18} />
                        )}
                    </button>
                </div>

                <section
                    className={`la-review-summary${
                        stats.dueWords > 0 ? ' is-due' : ' is-clear'
                    }`}
                    aria-label="今日学习状态">
                    <div className="la-review-copy">
                        {!isCollapsed && (
                            <>
                                <div className="la-review-label">今日待学</div>
                                <div className="la-review-value">
                                    {stats.dueWords > 0
                                        ? `${stats.dueWords} 个`
                                        : '全部完成'}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="la-review-icon" aria-hidden="true">
                        {stats.dueWords > 0 ? (
                            <Target size={20} />
                        ) : (
                            <Award size={20} />
                        )}
                    </div>
                    {isCollapsed && stats.dueWords > 0 && (
                        <span className="la-review-badge">
                            {stats.dueWords > 9 ? '9+' : stats.dueWords}
                        </span>
                    )}
                </section>

                <nav className="la-nav" aria-label="功能模块">
                    {navigationItems.map((item) => {
                        const isActive = currentView === item.id;

                        return (
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => handleViewChange(item.id)}
                                className={`la-nav-item${
                                    isActive ? ' is-active' : ''
                                }`}
                                aria-current={isActive ? 'page' : undefined}
                                aria-label={
                                    isCollapsed
                                        ? `${item.label}，${item.description}`
                                        : undefined
                                }
                                title={
                                    isCollapsed
                                        ? `${item.label} - ${item.description}`
                                        : undefined
                                }>
                                <span className="la-nav-icon" aria-hidden="true">
                                    {item.icon}
                                </span>
                                {!isCollapsed && (
                                    <span className="la-nav-copy">
                                        <span className="la-nav-label">
                                            {item.label}
                                        </span>
                                        <span className="la-nav-desc">
                                            {item.description}
                                        </span>
                                    </span>
                                )}
                                {item.badge && (
                                    <span className="la-nav-badge">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="la-sidebar-footer" aria-hidden="true">
                    {!isCollapsed ? (
                        <span>Language Assistant v1.0</span>
                    ) : (
                        <span className="la-sidebar-dot" />
                    )}
                </div>
            </aside>

            <main className="la-main">
                <header className="la-page-header">
                    <div className="la-page-icon" aria-hidden="true">
                        {currentItem.icon}
                    </div>
                    <div className="la-page-title-group">
                        <h1>{currentItem.label}</h1>
                        <p>{currentItem.description}</p>
                    </div>
                </header>

                <section
                    className="la-content"
                    aria-label={currentItem.label}
                    ref={contentRef}>
                    {renderContent()}
                </section>
            </main>
        </div>
    );
};

export default MainApp;

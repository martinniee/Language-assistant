// 数据统计组件 - iOS 风格
import React, { useMemo } from 'react';
import { Word, WordHelper } from './MarkdownWordStorage';
import { defaultSRS } from './SpacedRepetitionSystem';
import {
    AlarmClock,
    AlertTriangle,
    BadgeCheck,
    BarChart3,
    BookPlus,
    FileText,
    Folder,
    LibraryBig,
    Lightbulb,
    Sparkles,
    TrendingDown,
} from 'lucide-react';

interface DataStatisticsProps {
    words: Word[];
}

const DataStatistics: React.FC<DataStatisticsProps> = ({ words }) => {
    const stats = useMemo(() => {
        const srsStats = defaultSRS.getStudyStats(words);

        // 计算分类统计
        const categoryStats = words.reduce((acc, word) => {
            const category = word.category || '未分类';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // 计算等级统计
        const levelStats = words.reduce((acc, word) => {
            const level = word.level || '未设置';
            acc[level] = (acc[level] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // 计算词性统计
        const posStats = words.reduce((acc, word) => {
            if (word.partsOfSpeech) {
                word.partsOfSpeech.split(',').forEach((pos) => {
                    const cleanPos = pos.trim();
                    if (cleanPos) {
                        acc[cleanPos] = (acc[cleanPos] || 0) + 1;
                    }
                });
            }
            return acc;
        }, {} as Record<string, number>);

        // 计算学习进度
        const progressStats = {
            notStarted: words.filter((w) => WordHelper.getSrsLevel(w) === 0)
                .length,
            learning: words.filter((w) => WordHelper.getSrsLevel(w) === 1)
                .length,
            graduated: words.filter((w) => WordHelper.getSrsLevel(w) >= 2)
                .length,
        };

        return {
            srsStats,
            categoryStats,
            levelStats,
            posStats,
            progressStats,
        };
    }, [words]); // iOS 风格统计卡片
    const renderStatCard = (
        title: string,
        value: number,
        subtitle: string,
        color: string,
        icon: React.ReactNode,
    ) => (
        <div
            className="la-stat-card"
            style={{
                ['--la-stat-color' as string]: color,
                padding: '24px',
                backgroundColor: 'var(--la-surface)',
                borderRadius: 'var(--la-radius-xl)',
                textAlign: 'center',
                border: 'none',
                fontFamily:
                    'var(--la-font-display)',
                transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
            }}>
            <div className="la-stat-icon" aria-hidden="true">
                {icon}
            </div>
            <div
                style={{
                    fontSize: '48px',
                    fontWeight: '700',
                    color: color,
                    marginBottom: '8px',
                    letterSpacing: '0',
                }}>
                {value}
            </div>
            <div
                style={{
                    fontSize: '17px',
                    fontWeight: '600',
                    color: 'var(--la-text-strong)',
                    marginBottom: '4px',
                }}>
                {title}
            </div>
            <div
                style={{
                    fontSize: '13px',
                    color: 'var(--la-text-muted)',
                    fontWeight: '400',
                }}>
                {subtitle}
            </div>
        </div>
    ); // iOS 风格柱状图
    const renderBarChart = (
        data: Record<string, number>,
        title: React.ReactNode,
        color: string,
    ) => {
        const maxValue = Math.max(...Object.values(data));

        return (
            <div
                style={{
                    backgroundColor: 'var(--la-surface)',
                    borderRadius: 'var(--la-radius-md)',
                    boxShadow: 'var(--la-shadow-sm)',
                    padding: '24px',
                    marginBottom: '20px',
                    fontFamily:
                        'var(--la-font)',
                }}>
                <h3
                    style={{
                        margin: '0 0 20px 0',
                        color: 'var(--la-text-strong)',
                        fontSize: '20px',
                        fontWeight: '600',
                        letterSpacing: '0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                    {title}
                </h3>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }}>
                    {Object.entries(data)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([key, value]) => (
                            <div
                                key={key}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}>
                                <div
                                    style={{
                                        width: '120px',
                                        fontSize: '15px',
                                        color: 'var(--text-muted)',
                                        fontWeight: '500',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                    {key}
                                </div>
                                <div style={{ flex: 1, margin: '0 15px' }}>
                                    <div
                                        style={{
                                            height: '24px',
                                            backgroundColor: 'var(--la-surface-subtle)',
                                            borderRadius: 'var(--la-radius-sm)',
                                            overflow: 'hidden',
                                        }}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${
                                                    (value / maxValue) * 100
                                                }%`,
                                                backgroundColor: color,
                                                transition:
                                                    'width 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                borderRadius: 'var(--la-radius-sm)',
                                            }}
                                        />
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: '50px',
                                        textAlign: 'right',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: color,
                                    }}>
                                    {value}
                                </div>
                            </div>
                        ))}
                </div>
                {Object.keys(data).length === 0 && (
                    <div
                        style={{
                            textAlign: 'center',
                            color: 'var(--la-text-muted)',
                            fontSize: '15px',
                            padding: '40px',
                        }}>
                        暂无数据
                    </div>
                )}
            </div>
        );
    };
    return (
        <div
            className="la-page la-statistics-page"
            style={{
                padding: '30px 30px 60px 30px',
                fontFamily:
                    'var(--la-font-display)',
            }}>
            {/* iOS 风格页面标题 */}
            <div
                style={{
                    background:
                        'var(--la-gradient-success)',
                    padding: '32px 28px',
                    borderRadius: 'var(--la-radius-lg)',
                    marginBottom: '24px',
                    boxShadow: '0 4px 16px color-mix(in srgb, var(--la-success) 18%, transparent)',
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
                    <BarChart3 size={34} />
                    数据统计
                </h1>
                <p
                    style={{
                        margin: '8px 0 0 0',
                        color: 'var(--la-on-accent-muted)',
                        fontSize: '17px',
                        fontWeight: '400',
                    }}>
                    全面了解您的学习进度与成果
                </p>
            </div>

            {/* 总体统计卡片 */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px',
                }}>
                {renderStatCard(
                    '总单词',
                    stats.srsStats.total,
                    '词汇库大小',
                    'var(--la-accent)',
                    <LibraryBig size={28} strokeWidth={2.15} />,
                )}
                {renderStatCard(
                    '待学习',
                    stats.srsStats.dueToday,
                    '今日任务',
                    'var(--la-danger)',
                    <AlarmClock size={28} strokeWidth={2.15} />,
                )}
                {renderStatCard(
                    '正确率',
                    Math.round(stats.srsStats.accuracy),
                    '%',
                    'var(--la-success)',
                    <BadgeCheck size={28} strokeWidth={2.15} />,
                )}
                {renderStatCard(
                    '新单词',
                    stats.srsStats.new,
                    '尚未开始学习',
                    'var(--la-purple)',
                    <BookPlus size={28} strokeWidth={2.15} />,
                )}
            </div>

            {/* iOS 风格学习进度卡片 */}
            <div
                style={{
                    backgroundColor: 'var(--la-surface)',
                    borderRadius: 'var(--la-radius-md)',
                    boxShadow: 'var(--la-shadow-sm)',
                    padding: '24px',
                    marginBottom: '20px',
                }}>
                <h3
                    style={{
                        margin: '0 0 20px 0',
                        color: 'var(--la-text-strong)',
                        fontSize: '20px',
                        fontWeight: '600',
                        letterSpacing: '0',
                    }}>
                    学习进度分布
                </h3>
                <div
                    style={{
                        display: 'flex',
                        gap: '24px',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 16px',
                            backgroundColor: 'var(--la-danger-bg)',
                            borderRadius: 'var(--la-radius-sm)',
                        }}>
                        <div
                            style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: 'var(--la-danger)',
                                borderRadius: '50%',
                            }}
                        />
                        <span
                            style={{
                                fontSize: '15px',
                                fontWeight: '500',
                                color: 'var(--la-text-strong)',
                            }}>
                            未开始:{' '}
                            <strong>{stats.progressStats.notStarted}</strong>
                        </span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 16px',
                            backgroundColor: 'var(--la-warning-bg)',
                            borderRadius: 'var(--la-radius-sm)',
                        }}>
                        <div
                            style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: 'var(--la-warning)',
                                borderRadius: '50%',
                            }}
                        />
                        <span
                            style={{
                                fontSize: '15px',
                                fontWeight: '500',
                                color: 'var(--la-text-strong)',
                            }}>
                            学习中:{' '}
                            <strong>{stats.progressStats.learning}</strong>
                        </span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 16px',
                            backgroundColor: 'var(--la-success-bg)',
                            borderRadius: 'var(--la-radius-sm)',
                        }}>
                        <div
                            style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: 'var(--la-success)',
                                borderRadius: '50%',
                            }}
                        />
                        <span
                            style={{
                                fontSize: '15px',
                                fontWeight: '500',
                                color: 'var(--la-text-strong)',
                            }}>
                            已毕业:{' '}
                            <strong>{stats.progressStats.graduated}</strong>
                        </span>
                    </div>
                </div>
            </div>

            {/* 详细统计图表 */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '20px',
                }}>
                {renderBarChart(
                    stats.categoryStats,
                    (
                        <>
                            <Folder size={22} />
                            分类统计
                        </>
                    ),
                    'var(--la-accent)',
                )}
                {renderBarChart(
                    stats.levelStats,
                    (
                        <>
                            <BarChart3 size={22} />
                            等级统计
                        </>
                    ),
                    'var(--la-warning)',
                )}
                {renderBarChart(
                    stats.posStats,
                    (
                        <>
                            <FileText size={22} />
                            词性统计
                        </>
                    ),
                    'var(--la-purple)',
                )}
            </div>

            {/* iOS 风格学习建议卡片 */}
            <div
                style={{
                    backgroundColor: 'var(--la-surface-subtle)',
                    borderRadius: 'var(--la-radius-md)',
                    padding: '24px',
                    marginTop: '20px',
                    border: 'none',
                }}>
                <h3
                    style={{
                        margin: '0 0 16px 0',
                        color: 'var(--la-text-strong)',
                        fontSize: '20px',
                        fontWeight: '600',
                        letterSpacing: '0',
                    }}>
                    <Lightbulb size={22} />
                    学习建议
                </h3>
                <div
                    style={{
                        color: 'var(--text-muted)',
                        lineHeight: '1.8',
                        fontSize: '15px',
                    }}>
                    {stats.srsStats.dueToday > 20 && (
                        <p
                            style={{
                                margin: '0 0 12px 0',
                        padding: '12px 16px',
                        backgroundColor: 'var(--la-surface)',
                        borderRadius: 'var(--la-radius-xs)',
                        borderLeft: '3px solid var(--la-warning)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                            <AlertTriangle size={16} /> 今日待学习单词较多(
                            <strong>{stats.srsStats.dueToday}</strong>
                            个)，建议分批完成，避免疲劳
                        </p>
                    )}
                    {stats.srsStats.accuracy < 60 && (
                        <p
                            style={{
                                margin: '0 0 12px 0',
                        padding: '12px 16px',
                        backgroundColor: 'var(--la-surface)',
                        borderRadius: 'var(--la-radius-xs)',
                        borderLeft: '3px solid var(--la-danger)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                            <TrendingDown size={16} /> 当前正确率较低(
                            <strong>
                                {Math.round(stats.srsStats.accuracy)}%
                            </strong>
                            )，建议降低学习强度，专注复习已学单词
                        </p>
                    )}
                    {stats.srsStats.new > 50 && (
                        <p
                            style={{
                                margin: '0 0 12px 0',
                        padding: '12px 16px',
                        backgroundColor: 'var(--la-surface)',
                        borderRadius: 'var(--la-radius-xs)',
                        borderLeft: '3px solid var(--la-purple)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                            <BookPlus size={16} /> 新单词较多(<strong>{stats.srsStats.new}</strong>
                            个)，建议每日稳定添加新单词，避免积压
                        </p>
                    )}
                    {stats.srsStats.accuracy >= 80 && (
                        <p
                            style={{
                                margin: '0 0 12px 0',
                        padding: '12px 16px',
                        backgroundColor: 'var(--la-surface)',
                        borderRadius: 'var(--la-radius-xs)',
                        borderLeft: '3px solid var(--la-success)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                            <BadgeCheck size={16} /> 学习状态良好！正确率达到
                            <strong>
                                {Math.round(stats.srsStats.accuracy)}%
                            </strong>
                            ，可以适当增加学习量
                        </p>
                    )}
                    {stats.srsStats.dueToday === 0 && (
                        <p
                            style={{
                                margin: '0',
                        padding: '12px 16px',
                        backgroundColor: 'var(--la-surface)',
                        borderRadius: 'var(--la-radius-xs)',
                        borderLeft: '3px solid var(--la-success)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                            <Sparkles size={16} /> 今日学习任务完成！保持这个节奏，词汇量会稳步提升
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataStatistics;

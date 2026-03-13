// 数据统计组件
import React, { useMemo } from 'react';
import { Word, WordHelper } from './MarkdownWordStorage';
import { defaultSRS } from './SpacedRepetitionSystem';

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
    }, [words]);

    const renderStatCard = (
        title: string,
        value: number,
        subtitle: string,
        color: string,
    ) => (
        <div
            style={{
                padding: '25px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: `3px solid ${color}`,
            }}>
            <div
                style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: color,
                    marginBottom: '8px',
                }}>
                {value}
            </div>
            <div
                style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '4px',
                }}>
                {title}
            </div>
            <div
                style={{
                    fontSize: '12px',
                    color: '#7f8c8d',
                }}>
                {subtitle}
            </div>
        </div>
    );

    const renderBarChart = (
        data: Record<string, number>,
        title: string,
        color: string,
    ) => {
        const maxValue = Math.max(...Object.values(data));

        return (
            <div
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    padding: '25px',
                    marginBottom: '25px',
                }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>
                    {title}
                </h3>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
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
                                        fontSize: '14px',
                                        color: '#555',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                    {key}
                                </div>
                                <div style={{ flex: 1, margin: '0 15px' }}>
                                    <div
                                        style={{
                                            height: '20px',
                                            backgroundColor: '#f0f0f0',
                                            borderRadius: '10px',
                                            overflow: 'hidden',
                                        }}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${
                                                    (value / maxValue) * 100
                                                }%`,
                                                backgroundColor: color,
                                                transition: 'width 0.3s ease',
                                            }}
                                        />
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: '40px',
                                        textAlign: 'right',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
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
                            color: '#999',
                            fontSize: '14px',
                            padding: '40px',
                        }}>
                        暂无数据
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ padding: '30px' }}>
            {/* 总体统计 */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px',
                }}>
                {renderStatCard(
                    '总单词',
                    stats.srsStats.total,
                    '词汇库大小',
                    '#3498db',
                )}
                {renderStatCard(
                    '待学习',
                    stats.srsStats.dueToday,
                    '今日任务',
                    '#e74c3c',
                )}
                {renderStatCard(
                    '正确率',
                    Math.round(stats.srsStats.accuracy),
                    '%',
                    '#27ae60',
                )}
                {renderStatCard(
                    '新单词',
                    stats.srsStats.new,
                    '尚未开始学习',
                    '#9b59b6',
                )}
            </div>

            {/* 学习进度饼图风格 */}
            <div
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    padding: '25px',
                    marginBottom: '25px',
                }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>
                    学习进度分布
                </h3>
                <div
                    style={{
                        display: 'flex',
                        gap: '20px',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}>
                        <div
                            style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: '#ff6b6b',
                                borderRadius: '50%',
                            }}
                        />
                        <span>未开始: {stats.progressStats.notStarted}</span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}>
                        <div
                            style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: '#ffd93d',
                                borderRadius: '50%',
                            }}
                        />
                        <span>学习中: {stats.progressStats.learning}</span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}>
                        <div
                            style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: '#6bcf7f',
                                borderRadius: '50%',
                            }}
                        />
                        <span>已毕业: {stats.progressStats.graduated}</span>
                    </div>
                </div>
            </div>

            {/* 详细统计图表 */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '25px',
                }}>
                {renderBarChart(stats.categoryStats, '分类统计', '#3498db')}
                {renderBarChart(stats.levelStats, '等级统计', '#e67e22')}
                {renderBarChart(stats.posStats, '词性统计', '#9b59b6')}
            </div>

            {/* 学习建议 */}
            <div
                style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    padding: '25px',
                    marginTop: '25px',
                    border: '1px solid #e9ecef',
                }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>
                    📈 学习建议
                </h3>
                <div style={{ color: '#555', lineHeight: '1.6' }}>
                    {stats.srsStats.dueToday > 20 && (
                        <p>
                            • 今日待学习单词较多({stats.srsStats.dueToday}
                            个)，建议分批完成，避免疲劳
                        </p>
                    )}
                    {stats.srsStats.accuracy < 60 && (
                        <p>
                            • 当前正确率较低(
                            {Math.round(stats.srsStats.accuracy)}
                            %)，建议降低学习强度，专注复习已学单词
                        </p>
                    )}
                    {stats.srsStats.new > 50 && (
                        <p>
                            • 新单词较多({stats.srsStats.new}
                            个)，建议每日稳定添加新单词，避免积压
                        </p>
                    )}
                    {stats.srsStats.accuracy >= 80 && (
                        <p>
                            • 👏 学习状态良好！正确率达到
                            {Math.round(stats.srsStats.accuracy)}
                            %，可以适当增加学习量
                        </p>
                    )}
                    {stats.srsStats.dueToday === 0 && (
                        <p>
                            • 🎉
                            今日学习任务完成！保持这个节奏，词汇量会稳步提升
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataStatistics;

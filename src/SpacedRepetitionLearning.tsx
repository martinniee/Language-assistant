// 间隔重复学习组件
import React, { useState, useEffect, useMemo } from 'react';
import { Word, WordHelper } from './MarkdownWordStorage';
import {
    SRSAlgorithm,
    ReviewResult,
    ReviewResponse,
    defaultSRS,
} from './SpacedRepetitionSystem';

interface SpacedRepetitionLearningProps {
    words: Word[];
    onUpdateWord: (word: Word, originalWord?: Word, silent?: boolean) => void;
}

interface StudySession {
    totalCards: number;
    currentIndex: number;
    studiedCards: number;
    correctAnswers: number;
    startTime: Date;
}

const SpacedRepetitionLearning: React.FC<SpacedRepetitionLearningProps> = ({
    words,
    onUpdateWord,
}) => {
    const [studyCards, setStudyCards] = useState<Word[]>([]);
    const [currentCard, setCurrentCard] = useState<Word | null>(null);
    const [isStudying, setIsStudying] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [session, setSession] = useState<StudySession | null>(null);
    const [studyLimit, setStudyLimit] = useState(20);

    const srsAlgorithm = defaultSRS;

    // 计算统计信息
    const stats = useMemo(() => {
        return srsAlgorithm.getStudyStats(words);
    }, [words, srsAlgorithm]);

    // 获取待学习的卡片
    const loadStudyCards = () => {
        const cardsToStudy = srsAlgorithm.getWordsForReview(words, studyLimit);
        setStudyCards(cardsToStudy);
        return cardsToStudy;
    };

    // 开始学习会话
    const startStudySession = () => {
        const cards = loadStudyCards();
        if (cards.length === 0) {
            return;
        }

        setIsStudying(true);
        setShowAnswer(false);
        setCurrentCard(cards[0]);
        setSession({
            totalCards: cards.length,
            currentIndex: 0,
            studiedCards: 0,
            correctAnswers: 0,
            startTime: new Date(),
        });
    };

    // 结束学习会话
    const endStudySession = () => {
        setIsStudying(false);
        setShowAnswer(false);
        setCurrentCard(null);
        setSession(null);
        setStudyCards([]);
        // 重新加载统计信息
        loadStudyCards();
    }; // 处理复习回答
    const handleReviewAnswer = (result: ReviewResult) => {
        if (!currentCard || !session) return;

        const response: ReviewResponse = { result };
        const updatedWord = srsAlgorithm.updateWordSRSData(
            currentCard,
            response,
        );

        // 静默更新单词数据（不显示通知，不刷新UI）
        onUpdateWord(updatedWord, currentCard, true);

        // 更新会话统计
        const newSession: StudySession = {
            ...session,
            studiedCards: session.studiedCards + 1,
            correctAnswers:
                session.correctAnswers + (result >= ReviewResult.GOOD ? 1 : 0),
        };

        // 移到下一张卡片
        const nextIndex = session.currentIndex + 1;
        if (nextIndex < studyCards.length) {
            setCurrentCard(studyCards[nextIndex]);
            setSession({ ...newSession, currentIndex: nextIndex });
            setShowAnswer(false);
        } else {
            // 学习完成
            setSession(newSession);
            setTimeout(() => {
                endStudySession();
            }, 2000);
        }
    };

    // 初始化时加载待学习卡片数量
    useEffect(() => {
        loadStudyCards();
    }, [words, studyLimit]);

    const renderStudyStats = () => (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px',
            }}>
            <div
                style={{
                    padding: '20px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '12px',
                    textAlign: 'center',
                }}>
                <div
                    style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#1976d2',
                    }}>
                    {stats.dueToday}
                </div>
                <div
                    style={{
                        fontSize: '14px',
                        color: '#555',
                        marginTop: '5px',
                    }}>
                    待学习
                </div>
            </div>

            <div
                style={{
                    padding: '20px',
                    backgroundColor: '#f3e5f5',
                    borderRadius: '12px',
                    textAlign: 'center',
                }}>
                <div
                    style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#7b1fa2',
                    }}>
                    {stats.new}
                </div>
                <div
                    style={{
                        fontSize: '14px',
                        color: '#555',
                        marginTop: '5px',
                    }}>
                    新单词
                </div>
            </div>

            <div
                style={{
                    padding: '20px',
                    backgroundColor: '#fff3e0',
                    borderRadius: '12px',
                    textAlign: 'center',
                }}>
                <div
                    style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#f57c00',
                    }}>
                    {stats.learning}
                </div>
                <div
                    style={{
                        fontSize: '14px',
                        color: '#555',
                        marginTop: '5px',
                    }}>
                    学习中
                </div>
            </div>

            <div
                style={{
                    padding: '20px',
                    backgroundColor: '#e8f5e8',
                    borderRadius: '12px',
                    textAlign: 'center',
                }}>
                <div
                    style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#388e3c',
                    }}>
                    {Math.round(stats.accuracy)}%
                </div>
                <div
                    style={{
                        fontSize: '14px',
                        color: '#555',
                        marginTop: '5px',
                    }}>
                    正确率
                </div>
            </div>
        </div>
    );

    const renderStudyCard = () => {
        if (!currentCard || !session) return null;

        const progress =
            ((session.currentIndex + 1) / session.totalCards) * 100;

        return (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* 进度条 */}
                <div
                    style={{
                        marginBottom: '30px',
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                    }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '10px',
                        }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>
                            第 {session.currentIndex + 1} / {session.totalCards}{' '}
                            张
                        </span>
                        <span style={{ fontSize: '14px', color: '#666' }}>
                            正确率:{' '}
                            {session.studiedCards > 0
                                ? Math.round(
                                      (session.correctAnswers /
                                          session.studiedCards) *
                                          100,
                                  )
                                : 0}
                            %
                        </span>
                    </div>
                    <div
                        style={{
                            width: '100%',
                            height: '8px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '4px',
                            overflow: 'hidden',
                        }}>
                        <div
                            style={{
                                width: `${progress}%`,
                                height: '100%',
                                backgroundColor: '#4caf50',
                                transition: 'width 0.3s ease',
                            }}
                        />
                    </div>
                </div>
                {/* 单词卡片 */}
                <div
                    style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        marginBottom: '30px',
                    }}>
                    {/* 卡片正面 - 单词 */}
                    <div
                        style={{
                            padding: '60px 40px',
                            textAlign: 'center',
                            backgroundColor: '#fafafa',
                            borderBottom: showAnswer
                                ? '1px solid #e0e0e0'
                                : 'none',
                        }}>
                        <div
                            style={{
                                fontSize: '48px',
                                fontWeight: 'bold',
                                color: '#2c3e50',
                                marginBottom: '10px',
                            }}>
                            {currentCard.name}
                        </div>
                        {currentCard.pronunciation && (
                            <div
                                style={{
                                    fontSize: '18px',
                                    color: '#7f8c8d',
                                    fontStyle: 'italic',
                                }}>
                                [{currentCard.pronunciation}]
                            </div>
                        )}
                        {currentCard.category && (
                            <div
                                style={{
                                    marginTop: '15px',
                                    display: 'inline-block',
                                    padding: '5px 12px',
                                    backgroundColor: '#e3f2fd',
                                    color: '#1976d2',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                }}>
                                {currentCard.category}
                            </div>
                        )}
                    </div>

                    {/* 卡片背面 - 答案 */}
                    {showAnswer && (
                        <div style={{ padding: '40px' }}>
                            {currentCard.content.map((part, index) => (
                                <div
                                    key={index}
                                    style={{ marginBottom: '25px' }}>
                                    <h4
                                        style={{
                                            margin: '0 0 15px 0',
                                            color: '#1976d2',
                                            fontSize: '18px',
                                        }}>
                                        {part.type}
                                    </h4>
                                    {part.definitions.map((def, defIndex) => (
                                        <div
                                            key={defIndex}
                                            style={{
                                                marginBottom: '15px',
                                                paddingLeft: '15px',
                                                borderLeft: '3px solid #e0e0e0',
                                            }}>
                                            <div
                                                style={{
                                                    fontSize: '16px',
                                                    marginBottom: '10px',
                                                    lineHeight: '1.5',
                                                }}>
                                                {def.definition}
                                            </div>
                                            {def.examples.length > 0 && (
                                                <div>
                                                    {def.examples.map(
                                                        (example, exIndex) => (
                                                            <div
                                                                key={exIndex}
                                                                style={{
                                                                    fontSize:
                                                                        '14px',
                                                                    color: '#666',
                                                                    fontStyle:
                                                                        'italic',
                                                                    marginTop:
                                                                        '5px',
                                                                    padding:
                                                                        '8px 12px',
                                                                    backgroundColor:
                                                                        '#f8f9fa',
                                                                    borderRadius:
                                                                        '6px',
                                                                }}>
                                                                {example.text}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>{' '}
                {/* 操作按钮 */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '15px',
                        flexWrap: 'wrap',
                    }}>
                    {/* 四个评分按钮始终显示 */}
                    <button
                        onClick={() => handleReviewAnswer(ReviewResult.AGAIN)}
                        style={{
                            padding: '16px 28px',
                            fontSize: '15px',
                            fontWeight: '600',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            minHeight: '52px',
                            minWidth: '100px',
                            letterSpacing: '0.3px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#d32f2f';
                            e.currentTarget.style.transform =
                                'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f44336';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}>
                        1️⃣ 陌生
                    </button>

                    <button
                        onClick={() => handleReviewAnswer(ReviewResult.HARD)}
                        style={{
                            padding: '16px 28px',
                            fontSize: '15px',
                            fontWeight: '600',
                            backgroundColor: '#ff9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            minHeight: '52px',
                            minWidth: '100px',
                            letterSpacing: '0.3px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f57c00';
                            e.currentTarget.style.transform =
                                'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ff9800';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}>
                        2️⃣ 模糊
                    </button>

                    <button
                        onClick={() => handleReviewAnswer(ReviewResult.GOOD)}
                        style={{
                            padding: '16px 28px',
                            fontSize: '15px',
                            fontWeight: '600',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            minHeight: '52px',
                            minWidth: '100px',
                            letterSpacing: '0.3px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#388e3c';
                            e.currentTarget.style.transform =
                                'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#4caf50';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}>
                        3️⃣ 熟悉
                    </button>

                    <button
                        onClick={() => handleReviewAnswer(ReviewResult.EASY)}
                        style={{
                            padding: '16px 28px',
                            fontSize: '15px',
                            fontWeight: '600',
                            backgroundColor: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            minHeight: '52px',
                            minWidth: '100px',
                            letterSpacing: '0.3px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1976d2';
                            e.currentTarget.style.transform =
                                'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#2196f3';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}>
                        4️⃣ 简单
                    </button>
                </div>
                {/* 显示答案按钮 */}
                {!showAnswer && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '20px',
                        }}>
                        <button
                            onClick={() => setShowAnswer(true)}
                            style={{
                                padding: '12px 32px',
                                fontSize: '14px',
                                fontWeight: '500',
                                backgroundColor: '#ffffff',
                                color: '#1976d2',
                                border: '2px solid #1976d2',
                                borderRadius: '24px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#e3f2fd';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#ffffff';
                            }}>
                            💡 显示答案
                        </button>
                    </div>
                )}
                {/* 快捷键提示 */}
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '20px',
                        fontSize: '12px',
                        color: '#999',
                    }}>
                    快捷键: 1-陌生 | 2-模糊 | 3-熟悉 | 4-简单 | 空格-显示答案
                </div>
            </div>
        );
    };

    const renderSessionComplete = () => {
        if (!session || session.currentIndex < session.totalCards) return null;

        const duration = Math.round(
            (new Date().getTime() - session.startTime.getTime()) / 1000 / 60,
        );
        const accuracy =
            session.studiedCards > 0
                ? Math.round(
                      (session.correctAnswers / session.studiedCards) * 100,
                  )
                : 0;

        return (
            <div
                style={{
                    textAlign: 'center',
                    padding: '60px 40px',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    maxWidth: '600px',
                    margin: '0 auto',
                }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
                <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>
                    学习完成！
                </h2>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '20px',
                        margin: '30px 0',
                    }}>
                    <div>
                        <div
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#1976d2',
                            }}>
                            {session.studiedCards}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            已学习
                        </div>
                    </div>
                    <div>
                        <div
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#4caf50',
                            }}>
                            {accuracy}%
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            正确率
                        </div>
                    </div>
                    <div>
                        <div
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#ff9800',
                            }}>
                            {duration}min
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            用时
                        </div>
                    </div>
                </div>
                <p
                    style={{
                        color: '#666',
                        fontSize: '14px',
                        margin: '20px 0',
                    }}>
                    继续保持学习，明天还有更多单词等着你！
                </p>
            </div>
        );
    };

    // 键盘事件处理
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!isStudying || !showAnswer) return;

            switch (e.key) {
                case '1':
                    handleReviewAnswer(ReviewResult.AGAIN);
                    break;
                case '2':
                    handleReviewAnswer(ReviewResult.HARD);
                    break;
                case '3':
                    handleReviewAnswer(ReviewResult.GOOD);
                    break;
                case '4':
                    handleReviewAnswer(ReviewResult.EASY);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isStudying, showAnswer, currentCard]);
    if (isStudying) {
        return (
            <div
                style={{
                    padding: '32px 40px',
                    minHeight: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                {session && session.currentIndex < session.totalCards
                    ? renderStudyCard()
                    : renderSessionComplete()}
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button
                        onClick={endStudySession}
                        style={{
                            padding: '14px 32px',
                            fontSize: '15px',
                            fontWeight: '500',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '28px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            minHeight: '48px',
                            letterSpacing: '0.3px',
                            outline: 'none',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#5a6268';
                            e.currentTarget.style.transform =
                                'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#6c757d';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}>
                        结束学习
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div
            style={{
                padding: '32px 40px',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}>
            {renderStudyStats()}

            {/* 开始学习区域 */}
            <div
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    padding: '48px 56px',
                    textAlign: 'center',
                    maxWidth: '700px',
                    margin: '0 auto',
                    border: '1px solid #f1f3f4',
                }}>
                <h2
                    style={{
                        margin: '0 0 16px 0',
                        color: '#1f2937',
                        fontSize: '28px',
                        fontWeight: '700',
                        letterSpacing: '-0.5px',
                    }}>
                    开始间隔学习
                </h2>
                <p
                    style={{
                        color: '#666',
                        fontSize: '16px',
                        margin: '0 0 30px 0',
                    }}>
                    {stats.dueToday > 0
                        ? `今天有 ${stats.dueToday} 个单词需要复习`
                        : '🎉 今天的学习已完成！'}
                </p>{' '}
                <div style={{ marginBottom: '40px' }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '12px',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#374151',
                        }}>
                        学习数量上限:
                    </label>
                    <select
                        value={studyLimit}
                        onChange={(e) =>
                            setStudyLimit(parseInt(e.target.value))
                        }
                        style={{
                            padding: '14px 20px',
                            fontSize: '15px',
                            fontWeight: '500',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            backgroundColor: '#ffffff',
                            color: '#374151',
                            outline: 'none',
                            cursor: 'pointer',
                            transition: 'border-color 0.3s ease',
                            minWidth: '160px',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#1976d2';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                        }}>
                        <option value={10}>10 张卡片</option>
                        <option value={20}>20 张卡片</option>
                        <option value={50}>50 张卡片</option>
                        <option value={100}>100 张卡片</option>
                    </select>
                </div>
                <button
                    onClick={startStudySession}
                    disabled={stats.dueToday === 0}
                    style={{
                        padding: '20px 60px',
                        fontSize: '18px',
                        fontWeight: '700',
                        backgroundColor:
                            stats.dueToday > 0 ? '#1976d2' : '#e0e0e0',
                        color: stats.dueToday > 0 ? 'white' : '#9e9e9e',
                        border: 'none',
                        borderRadius: '40px',
                        cursor: stats.dueToday > 0 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease',
                        boxShadow:
                            stats.dueToday > 0
                                ? '0 6px 20px rgba(25,118,210,0.3)'
                                : 'none',
                        minHeight: '64px',
                        letterSpacing: '0.5px',
                        outline: 'none',
                    }}
                    onMouseEnter={(e) => {
                        if (stats.dueToday > 0) {
                            e.currentTarget.style.backgroundColor = '#1565c0';
                            e.currentTarget.style.transform =
                                'translateY(-2px)';
                            e.currentTarget.style.boxShadow =
                                '0 8px 25px rgba(25,118,210,0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (stats.dueToday > 0) {
                            e.currentTarget.style.backgroundColor = '#1976d2';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow =
                                '0 6px 20px rgba(25,118,210,0.3)';
                        }
                    }}>
                    {stats.dueToday > 0 ? '开始学习' : '暂无待学习单词'}
                </button>
            </div>
        </div>
    );
};

export default SpacedRepetitionLearning;

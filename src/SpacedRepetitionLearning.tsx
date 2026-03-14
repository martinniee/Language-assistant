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
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px',
                marginBottom: '24px',
            }}>
            <div
                style={{
                    padding: '20px 16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                        '0 2px 8px rgba(0,0,0,0.04)';
                }}>
                <div
                    style={{
                        fontSize: '40px',
                        fontWeight: '700',
                        color: '#007AFF',
                        letterSpacing: '-0.5px',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    }}>
                    {stats.dueToday}
                </div>
                <div
                    style={{
                        fontSize: '13px',
                        color: '#8E8E93',
                        marginTop: '4px',
                        fontWeight: '500',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    }}>
                    待学习
                </div>
            </div>

            <div
                style={{
                    padding: '20px 16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                        '0 2px 8px rgba(0,0,0,0.04)';
                }}>
                <div
                    style={{
                        fontSize: '40px',
                        fontWeight: '700',
                        color: '#AF52DE',
                        letterSpacing: '-0.5px',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    }}>
                    {stats.new}
                </div>
                <div
                    style={{
                        fontSize: '13px',
                        color: '#8E8E93',
                        marginTop: '4px',
                        fontWeight: '500',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    }}>
                    新单词
                </div>
            </div>

            <div
                style={{
                    padding: '20px 16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                        '0 2px 8px rgba(0,0,0,0.04)';
                }}>
                <div
                    style={{
                        fontSize: '40px',
                        fontWeight: '700',
                        color: '#FF9500',
                        letterSpacing: '-0.5px',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    }}>
                    {stats.learning}
                </div>
                <div
                    style={{
                        fontSize: '13px',
                        color: '#8E8E93',
                        marginTop: '4px',
                        fontWeight: '500',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    }}>
                    学习中
                </div>
            </div>

            <div
                style={{
                    padding: '20px 16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                        '0 2px 8px rgba(0,0,0,0.04)';
                }}>
                <div
                    style={{
                        fontSize: '40px',
                        fontWeight: '700',
                        color: '#34C759',
                        letterSpacing: '-0.5px',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    }}>
                    {Math.round(stats.accuracy)}%
                </div>
                <div
                    style={{
                        fontSize: '13px',
                        color: '#8E8E93',
                        marginTop: '4px',
                        fontWeight: '500',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
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
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                {/* 进度条 */}
                <div
                    style={{
                        marginBottom: '20px',
                        padding: '16px 20px',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        border: '1px solid rgba(0,0,0,0.04)',
                    }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px',
                        }}>
                        <span
                            style={{
                                fontSize: '13px',
                                color: '#8E8E93',
                                fontWeight: '500',
                                fontFamily:
                                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            }}>
                            第 {session.currentIndex + 1} / {session.totalCards}{' '}
                            张
                        </span>
                        <span
                            style={{
                                fontSize: '13px',
                                color: '#8E8E93',
                                fontWeight: '500',
                                fontFamily:
                                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            }}>
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
                            height: '6px',
                            backgroundColor: '#F2F2F7',
                            borderRadius: '3px',
                            overflow: 'hidden',
                        }}>
                        <div
                            style={{
                                width: `${progress}%`,
                                height: '100%',
                                backgroundColor: '#34C759',
                                transition:
                                    'width 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                borderRadius: '3px',
                            }}
                        />
                    </div>
                </div>{' '}
                {/* 单词卡片 */}
                <div
                    style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                        overflow: 'hidden',
                        marginBottom: '20px',
                        border: '1px solid rgba(0,0,0,0.04)',
                    }}>
                    {/* 卡片正面 - 单词 */}
                    <div
                        style={{
                            padding: '48px 32px',
                            textAlign: 'center',
                            backgroundColor: '#FAFAFA',
                            borderBottom: showAnswer
                                ? '1px solid rgba(0,0,0,0.06)'
                                : 'none',
                        }}>
                        <div
                            style={{
                                fontSize: '52px',
                                fontWeight: '700',
                                color: '#1C1C1E',
                                marginBottom: '8px',
                                letterSpacing: '-1px',
                                fontFamily:
                                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            }}>
                            {currentCard.name}
                        </div>
                        {currentCard.pronunciation && (
                            <div
                                style={{
                                    fontSize: '17px',
                                    color: '#8E8E93',
                                    fontWeight: '500',
                                    letterSpacing: '0.2px',
                                    fontFamily:
                                        '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                }}>
                                [{currentCard.pronunciation}]
                            </div>
                        )}
                        {currentCard.category && (
                            <div
                                style={{
                                    marginTop: '16px',
                                    display: 'inline-block',
                                    padding: '6px 14px',
                                    backgroundColor: '#007AFF',
                                    color: '#ffffff',
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    fontFamily:
                                        '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                }}>
                                {currentCard.category}
                            </div>
                        )}
                    </div>

                    {/* 卡片背面 - 答案 */}
                    {showAnswer && (
                        <div style={{ padding: '32px 28px' }}>
                            {currentCard.content.map((part, index) => (
                                <div
                                    key={index}
                                    style={{ marginBottom: '24px' }}>
                                    <h4
                                        style={{
                                            margin: '0 0 12px 0',
                                            color: '#007AFF',
                                            fontSize: '17px',
                                            fontWeight: '600',
                                            fontFamily:
                                                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                        }}>
                                        {part.type}
                                    </h4>
                                    {part.definitions.map((def, defIndex) => (
                                        <div
                                            key={defIndex}
                                            style={{
                                                marginBottom: '16px',
                                                paddingLeft: '16px',
                                                borderLeft: '3px solid #F2F2F7',
                                            }}>
                                            <div
                                                style={{
                                                    fontSize: '15px',
                                                    marginBottom: '10px',
                                                    lineHeight: '1.6',
                                                    color: '#1C1C1E',
                                                    fontFamily:
                                                        '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
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
                                                                    color: '#8E8E93',
                                                                    lineHeight:
                                                                        '1.5',
                                                                    marginTop:
                                                                        '6px',
                                                                    padding:
                                                                        '10px 14px',
                                                                    backgroundColor:
                                                                        '#F2F2F7',
                                                                    borderRadius:
                                                                        '10px',
                                                                    fontFamily:
                                                                        '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
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
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        marginBottom: '16px',
                    }}>
                    {/* 四个评分按钮始终显示 */}
                    <button
                        onClick={() => handleReviewAnswer(ReviewResult.AGAIN)}
                        style={{
                            padding: '18px 20px',
                            fontSize: '15px',
                            fontWeight: '600',
                            backgroundColor: '#FF3B30',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            cursor: 'pointer',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            boxShadow: '0 2px 8px rgba(255, 59, 48, 0.25)',
                            fontFamily:
                                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            letterSpacing: '-0.2px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(0.98)';
                            e.currentTarget.style.boxShadow =
                                '0 4px 12px rgba(255, 59, 48, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow =
                                '0 2px 8px rgba(255, 59, 48, 0.25)';
                        }}>
                        陌生
                    </button>

                    <button
                        onClick={() => handleReviewAnswer(ReviewResult.HARD)}
                        style={{
                            padding: '18px 20px',
                            fontSize: '15px',
                            fontWeight: '600',
                            backgroundColor: '#FF9500',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            cursor: 'pointer',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            boxShadow: '0 2px 8px rgba(255, 149, 0, 0.25)',
                            fontFamily:
                                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            letterSpacing: '-0.2px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(0.98)';
                            e.currentTarget.style.boxShadow =
                                '0 4px 12px rgba(255, 149, 0, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow =
                                '0 2px 8px rgba(255, 149, 0, 0.25)';
                        }}>
                        模糊
                    </button>

                    <button
                        onClick={() => handleReviewAnswer(ReviewResult.GOOD)}
                        style={{
                            padding: '18px 20px',
                            fontSize: '15px',
                            fontWeight: '600',
                            backgroundColor: '#34C759',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            cursor: 'pointer',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            boxShadow: '0 2px 8px rgba(52, 199, 89, 0.25)',
                            fontFamily:
                                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            letterSpacing: '-0.2px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(0.98)';
                            e.currentTarget.style.boxShadow =
                                '0 4px 12px rgba(52, 199, 89, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow =
                                '0 2px 8px rgba(52, 199, 89, 0.25)';
                        }}>
                        熟悉
                    </button>

                    <button
                        onClick={() => handleReviewAnswer(ReviewResult.EASY)}
                        style={{
                            padding: '18px 20px',
                            fontSize: '15px',
                            fontWeight: '600',
                            backgroundColor: '#007AFF',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            cursor: 'pointer',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
                            fontFamily:
                                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            letterSpacing: '-0.2px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(0.98)';
                            e.currentTarget.style.boxShadow =
                                '0 4px 12px rgba(0, 122, 255, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow =
                                '0 2px 8px rgba(0, 122, 255, 0.25)';
                        }}>
                        简单
                    </button>
                </div>{' '}
                {/* 显示答案按钮 */}
                {!showAnswer && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                        <button
                            onClick={() => setShowAnswer(true)}
                            style={{
                                padding: '14px 28px',
                                fontSize: '15px',
                                fontWeight: '600',
                                backgroundColor: '#F2F2F7',
                                color: '#007AFF',
                                border: 'none',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                transition:
                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                fontFamily:
                                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                letterSpacing: '-0.2px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#E5E5EA';
                                e.currentTarget.style.transform = 'scale(0.98)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#F2F2F7';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}>
                            💡 显示答案
                        </button>
                    </div>
                )}
                {/* 快捷键提示 */}
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '16px',
                        fontSize: '12px',
                        color: '#C7C7CC',
                        fontWeight: '500',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
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
                    padding: '48px 40px',
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    maxWidth: '560px',
                    margin: '0 auto',
                    border: '1px solid rgba(0,0,0,0.04)',
                }}>
                <div style={{ fontSize: '72px', marginBottom: '16px' }}>🎉</div>
                <h2
                    style={{
                        margin: '0 0 12px 0',
                        color: '#1C1C1E',
                        fontSize: '28px',
                        fontWeight: '700',
                        letterSpacing: '-0.5px',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    }}>
                    学习完成！
                </h2>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '16px',
                        margin: '32px 0',
                    }}>
                    <div
                        style={{
                            padding: '20px 16px',
                            backgroundColor: '#F2F2F7',
                            borderRadius: '14px',
                        }}>
                        <div
                            style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                color: '#007AFF',
                                letterSpacing: '-0.5px',
                                fontFamily:
                                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            }}>
                            {session.studiedCards}
                        </div>
                        <div
                            style={{
                                fontSize: '12px',
                                color: '#8E8E93',
                                marginTop: '4px',
                                fontWeight: '500',
                                fontFamily:
                                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            }}>
                            已学习
                        </div>
                    </div>
                    <div
                        style={{
                            padding: '20px 16px',
                            backgroundColor: '#F2F2F7',
                            borderRadius: '14px',
                        }}>
                        <div
                            style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                color: '#34C759',
                                letterSpacing: '-0.5px',
                                fontFamily:
                                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            }}>
                            {accuracy}%
                        </div>
                        <div
                            style={{
                                fontSize: '12px',
                                color: '#8E8E93',
                                marginTop: '4px',
                                fontWeight: '500',
                                fontFamily:
                                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            }}>
                            正确率
                        </div>
                    </div>
                    <div
                        style={{
                            padding: '20px 16px',
                            backgroundColor: '#F2F2F7',
                            borderRadius: '14px',
                        }}>
                        <div
                            style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                color: '#FF9500',
                                letterSpacing: '-0.5px',
                                fontFamily:
                                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            }}>
                            {duration}
                        </div>
                        <div
                            style={{
                                fontSize: '12px',
                                color: '#8E8E93',
                                marginTop: '4px',
                                fontWeight: '500',
                                fontFamily:
                                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            }}>
                            分钟
                        </div>
                    </div>
                </div>
                <p
                    style={{
                        color: '#8E8E93',
                        fontSize: '15px',
                        margin: '24px 0 0 0',
                        lineHeight: '1.5',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
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
                    padding: '32px 24px',
                    minHeight: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#F9F9F9',
                }}>
                {session && session.currentIndex < session.totalCards
                    ? renderStudyCard()
                    : renderSessionComplete()}
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <button
                        onClick={endStudySession}
                        style={{
                            padding: '14px 32px',
                            fontSize: '15px',
                            fontWeight: '600',
                            backgroundColor: '#F2F2F7',
                            color: '#8E8E93',
                            border: 'none',
                            borderRadius: '14px',
                            cursor: 'pointer',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            fontFamily:
                                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            letterSpacing: '-0.2px',
                            outline: 'none',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#E5E5EA';
                            e.currentTarget.style.transform = 'scale(0.98)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#F2F2F7';
                            e.currentTarget.style.transform = 'scale(1)';
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
                padding: '32px 24px 60px 24px',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#F9F9F9',
            }}>
            {renderStudyStats()}

            {/* 开始学习区域 */}
            <div
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    padding: '48px 40px',
                    textAlign: 'center',
                    maxWidth: '600px',
                    margin: '0 auto',
                    border: '1px solid rgba(0,0,0,0.04)',
                }}>
                <h2
                    style={{
                        margin: '0 0 12px 0',
                        color: '#1C1C1E',
                        fontSize: '32px',
                        fontWeight: '700',
                        letterSpacing: '-0.8px',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    }}>
                    开始间隔学习
                </h2>
                <p
                    style={{
                        color: '#8E8E93',
                        fontSize: '17px',
                        margin: '0 0 32px 0',
                        lineHeight: '1.5',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    }}>
                    {stats.dueToday > 0
                        ? `今天有 ${stats.dueToday} 个单词需要复习`
                        : '🎉 今天的学习已完成！'}
                </p>{' '}
                <div style={{ marginBottom: '36px' }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '12px',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#1C1C1E',
                            fontFamily:
                                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        }}>
                        学习数量上限
                    </label>
                    <select
                        value={studyLimit}
                        onChange={(e) =>
                            setStudyLimit(parseInt(e.target.value))
                        }
                        style={
                            {
                                padding: '14px 40px 14px 20px',
                                fontSize: '16px',
                                fontWeight: '500',
                                border: '2px solid #007AFF',
                                borderRadius: '12px',
                                backgroundColor: '#ffffff',
                                color: '#1C1C1E',
                                outline: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                minWidth: '200px',
                                fontFamily:
                                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                // 添加关键样式确保文字可见
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                appearance: 'none',
                                lineHeight: '1.5',
                                height: 'auto',
                                textAlign: 'left',
                                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23007AFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                                backgroundSize: '20px',
                            } as React.CSSProperties
                        }
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#0066CC';
                            e.currentTarget.style.boxShadow =
                                '0 4px 12px rgba(0,122,255,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#007AFF';
                            e.currentTarget.style.boxShadow =
                                '0 2px 8px rgba(0,0,0,0.08)';
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.backgroundColor = '#F0F8FF';
                            e.currentTarget.style.borderColor = '#0066CC';
                            e.currentTarget.style.boxShadow =
                                '0 0 0 4px rgba(0, 122, 255, 0.15)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.borderColor = '#007AFF';
                            e.currentTarget.style.boxShadow =
                                '0 2px 8px rgba(0,0,0,0.08)';
                        }}>
                        <option
                            value={10}
                            style={{
                                color: '#1C1C1E',
                                backgroundColor: '#ffffff',
                                padding: '10px',
                            }}>
                            10 张卡片
                        </option>
                        <option
                            value={20}
                            style={{
                                color: '#1C1C1E',
                                backgroundColor: '#ffffff',
                                padding: '10px',
                            }}>
                            20 张卡片
                        </option>
                        <option
                            value={50}
                            style={{
                                color: '#1C1C1E',
                                backgroundColor: '#ffffff',
                                padding: '10px',
                            }}>
                            50 张卡片
                        </option>
                        <option
                            value={100}
                            style={{
                                color: '#1C1C1E',
                                backgroundColor: '#ffffff',
                                padding: '10px',
                            }}>
                            100 张卡片
                        </option>
                    </select>
                </div>
                <button
                    onClick={startStudySession}
                    disabled={stats.dueToday === 0}
                    style={{
                        padding: '16px 48px',
                        fontSize: '17px',
                        fontWeight: '600',
                        backgroundColor:
                            stats.dueToday > 0 ? '#007AFF' : '#E5E5EA',
                        color: stats.dueToday > 0 ? '#ffffff' : '#C7C7CC',
                        border: 'none',
                        borderRadius: '14px',
                        cursor: stats.dueToday > 0 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        boxShadow:
                            stats.dueToday > 0
                                ? '0 4px 12px rgba(0, 122, 255, 0.25)'
                                : 'none',
                        letterSpacing: '-0.3px',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        outline: 'none',
                    }}
                    onMouseEnter={(e) => {
                        if (stats.dueToday > 0) {
                            e.currentTarget.style.transform = 'scale(0.98)';
                            e.currentTarget.style.boxShadow =
                                '0 6px 16px rgba(0, 122, 255, 0.35)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (stats.dueToday > 0) {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow =
                                '0 4px 12px rgba(0, 122, 255, 0.25)';
                        }
                    }}>
                    {stats.dueToday > 0 ? '开始学习' : '暂无待学习单词'}
                </button>
            </div>
        </div>
    );
};

export default SpacedRepetitionLearning;

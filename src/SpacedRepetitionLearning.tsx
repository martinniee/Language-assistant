// 间隔重复学习组件
import React, { useState, useEffect, useMemo } from 'react';
import { Word } from './MarkdownWordStorage';
import {
    ReviewResult,
    ReviewResponse,
    defaultSRS,
} from './SpacedRepetitionSystem';
import { CheckCircle, Lightbulb } from 'lucide-react';
import { RichText } from './components/common';

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
                    backgroundColor: 'var(--la-surface)',
                    borderRadius: 'var(--la-radius-md)',
                    textAlign: 'center',
                    boxShadow: 'var(--la-shadow-sm)',
                    border: '1px solid color-mix(in srgb, black 6%, transparent)',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                        '0 4px 12px color-mix(in srgb, black 10%, transparent)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                        '0 2px 8px color-mix(in srgb, black 6%, transparent)';
                }}>
                <div
                    style={{
                        fontSize: '40px',
                        fontWeight: '700',
                        color: 'var(--la-accent)',
                        letterSpacing: '0',
                        fontFamily:
                            'var(--la-font-display)',
                    }}>
                    {stats.dueToday}
                </div>
                <div
                    style={{
                        fontSize: '13px',
                        color: 'var(--la-text-muted)',
                        marginTop: '4px',
                        fontWeight: '500',
                        fontFamily:
                            'var(--la-font)',
                    }}>
                    待学习
                </div>
            </div>

            <div
                style={{
                    padding: '20px 16px',
                    backgroundColor: 'var(--la-surface)',
                    borderRadius: 'var(--la-radius-md)',
                    textAlign: 'center',
                    boxShadow: 'var(--la-shadow-sm)',
                    border: '1px solid color-mix(in srgb, black 6%, transparent)',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                        '0 4px 12px color-mix(in srgb, black 10%, transparent)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                        '0 2px 8px color-mix(in srgb, black 6%, transparent)';
                }}>
                <div
                    style={{
                        fontSize: '40px',
                        fontWeight: '700',
                        color: 'var(--la-purple)',
                        letterSpacing: '0',
                        fontFamily:
                            'var(--la-font-display)',
                    }}>
                    {stats.new}
                </div>
                <div
                    style={{
                        fontSize: '13px',
                        color: 'var(--la-text-muted)',
                        marginTop: '4px',
                        fontWeight: '500',
                        fontFamily:
                            'var(--la-font)',
                    }}>
                    新单词
                </div>
            </div>

            <div
                style={{
                    padding: '20px 16px',
                    backgroundColor: 'var(--la-surface)',
                    borderRadius: 'var(--la-radius-md)',
                    textAlign: 'center',
                    boxShadow: 'var(--la-shadow-sm)',
                    border: '1px solid color-mix(in srgb, black 6%, transparent)',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                        '0 4px 12px color-mix(in srgb, black 10%, transparent)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                        '0 2px 8px color-mix(in srgb, black 6%, transparent)';
                }}>
                <div
                    style={{
                        fontSize: '40px',
                        fontWeight: '700',
                        color: 'var(--la-warning)',
                        letterSpacing: '0',
                        fontFamily:
                            'var(--la-font-display)',
                    }}>
                    {stats.learning}
                </div>
                <div
                    style={{
                        fontSize: '13px',
                        color: 'var(--la-text-muted)',
                        marginTop: '4px',
                        fontWeight: '500',
                        fontFamily:
                            'var(--la-font)',
                    }}>
                    学习中
                </div>
            </div>

            <div
                style={{
                    padding: '20px 16px',
                    backgroundColor: 'var(--la-surface)',
                    borderRadius: 'var(--la-radius-md)',
                    textAlign: 'center',
                    boxShadow: 'var(--la-shadow-sm)',
                    border: '1px solid color-mix(in srgb, black 6%, transparent)',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                        '0 4px 12px color-mix(in srgb, black 10%, transparent)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                        '0 2px 8px color-mix(in srgb, black 6%, transparent)';
                }}>
                <div
                    style={{
                        fontSize: '40px',
                        fontWeight: '700',
                        color: 'var(--la-success)',
                        letterSpacing: '0',
                        fontFamily:
                            'var(--la-font-display)',
                    }}>
                    {Math.round(stats.accuracy)}%
                </div>
                <div
                    style={{
                        fontSize: '13px',
                        color: 'var(--la-text-muted)',
                        marginTop: '4px',
                        fontWeight: '500',
                        fontFamily:
                            'var(--la-font)',
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
                        backgroundColor: 'var(--la-surface)',
                        borderRadius: 'var(--la-radius-md)',
                        boxShadow: 'var(--la-shadow-sm)',
                        border: '1px solid color-mix(in srgb, black 6%, transparent)',
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
                                color: 'var(--la-text-muted)',
                                fontWeight: '500',
                                fontFamily:
                                    'var(--la-font)',
                            }}>
                            第 {session.currentIndex + 1} / {session.totalCards}{' '}
                            张
                        </span>
                        <span
                            style={{
                                fontSize: '13px',
                                color: 'var(--la-text-muted)',
                                fontWeight: '500',
                                fontFamily:
                                    'var(--la-font)',
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
                            backgroundColor: 'var(--la-surface-subtle)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                        }}>
                        <div
                            style={{
                                width: `${progress}%`,
                                height: '100%',
                                backgroundColor: 'var(--la-success)',
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
                        backgroundColor: 'var(--la-surface)',
                        borderRadius: 'var(--la-radius-lg)',
                        boxShadow: '0 4px 16px color-mix(in srgb, black 8%, transparent)',
                        overflow: 'hidden',
                        marginBottom: '20px',
                        border: '1px solid color-mix(in srgb, black 6%, transparent)',
                    }}>
                    {/* 卡片正面 - 单词 */}
                    <div
                        style={{
                            padding: '48px 32px',
                            textAlign: 'center',
                            backgroundColor: 'var(--la-surface-raised)',
                            borderBottom: showAnswer
                                ? '1px solid color-mix(in srgb, black 8%, transparent)'
                                : 'none',
                        }}>
                        <div
                            style={{
                                fontSize: '52px',
                                fontWeight: '700',
                                color: 'var(--la-text-strong)',
                                marginBottom: '8px',
                                letterSpacing: '0',
                                fontFamily:
                                    'var(--la-font-display)',
                            }}>
                            {currentCard.name}
                        </div>
                        {currentCard.pronunciation && (
                            <div
                                style={{
                                    fontSize: '17px',
                                    color: 'var(--la-text-muted)',
                                    fontWeight: '500',
                                    letterSpacing: '0.2px',
                                    fontFamily:
                                        'var(--la-font)',
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
                                    backgroundColor: 'var(--la-accent)',
                                    color: 'var(--la-surface)',
                                    borderRadius: 'var(--la-radius-sm)',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    fontFamily:
                                        'var(--la-font)',
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
                                            color: 'var(--la-accent)',
                                            fontSize: '17px',
                                            fontWeight: '600',
                                            fontFamily:
                                                'var(--la-font)',
                                        }}>
                                        {part.type}
                                    </h4>
                                    {part.definitions.map((def, defIndex) => (
                                        <div
                                            key={defIndex}
                                            style={{
                                                marginBottom: '16px',
                                                paddingLeft: '16px',
                                                borderLeft: '3px solid var(--la-surface-subtle)',
                                            }}>
                                            <div
                                                style={{
                                                    fontSize: '15px',
                                                    marginBottom: '10px',
                                                    lineHeight: '1.6',
                                                    color: 'var(--la-text-strong)',
                                                    fontFamily:
                                                        'var(--la-font)',
                                                }}>
                                                <RichText
                                                    text={def.definition}
                                                />
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
                                                                    color: 'var(--la-text-muted)',
                                                                    lineHeight:
                                                                        '1.5',
                                                                    marginTop:
                                                                        '6px',
                                                                    padding:
                                                                        '10px 14px',
                                                                    backgroundColor:
                                                                        'var(--la-surface-subtle)',
                                                                    borderRadius:
                                                                        '10px',
                                                                    fontFamily:
                                                                        'var(--la-font)',
                                                                }}>
                                                                <RichText
                                                                    text={
                                                                        example.text
                                                                    }
                                                                />
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
                            backgroundColor: 'var(--la-danger)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--la-radius-sm)',
                            cursor: 'pointer',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            boxShadow: '0 2px 8px color-mix(in srgb, var(--la-danger) 22%, transparent)',
                            fontFamily:
                                'var(--la-font)',
                            letterSpacing: '0',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(0.98)';
                            e.currentTarget.style.boxShadow =
                                '0 4px 12px color-mix(in srgb, var(--la-danger) 28%, transparent)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow =
                                '0 2px 8px color-mix(in srgb, var(--la-danger) 22%, transparent)';
                        }}>
                        陌生
                    </button>

                    <button
                        onClick={() => handleReviewAnswer(ReviewResult.HARD)}
                        style={{
                            padding: '18px 20px',
                            fontSize: '15px',
                            fontWeight: '600',
                            backgroundColor: 'var(--la-warning)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--la-radius-sm)',
                            cursor: 'pointer',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            boxShadow: '0 2px 8px color-mix(in srgb, var(--la-warning) 22%, transparent)',
                            fontFamily:
                                'var(--la-font)',
                            letterSpacing: '0',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(0.98)';
                            e.currentTarget.style.boxShadow =
                                '0 4px 12px color-mix(in srgb, var(--la-warning) 28%, transparent)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow =
                                '0 2px 8px color-mix(in srgb, var(--la-warning) 22%, transparent)';
                        }}>
                        模糊
                    </button>

                    <button
                        onClick={() => handleReviewAnswer(ReviewResult.GOOD)}
                        style={{
                            padding: '18px 20px',
                            fontSize: '15px',
                            fontWeight: '600',
                            backgroundColor: 'var(--la-success)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--la-radius-sm)',
                            cursor: 'pointer',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            boxShadow: '0 2px 8px color-mix(in srgb, var(--la-success) 22%, transparent)',
                            fontFamily:
                                'var(--la-font)',
                            letterSpacing: '0',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(0.98)';
                            e.currentTarget.style.boxShadow =
                                '0 4px 12px color-mix(in srgb, var(--la-success) 28%, transparent)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow =
                                '0 2px 8px color-mix(in srgb, var(--la-success) 22%, transparent)';
                        }}>
                        熟悉
                    </button>

                    <button
                        onClick={() => handleReviewAnswer(ReviewResult.EASY)}
                        style={{
                            padding: '18px 20px',
                            fontSize: '15px',
                            fontWeight: '600',
                            backgroundColor: 'var(--la-accent)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--la-radius-sm)',
                            cursor: 'pointer',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            boxShadow: '0 2px 8px color-mix(in srgb, var(--la-accent) 22%, transparent)',
                            fontFamily:
                                'var(--la-font)',
                            letterSpacing: '0',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(0.98)';
                            e.currentTarget.style.boxShadow =
                                '0 4px 12px color-mix(in srgb, var(--la-accent) 30%, transparent)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow =
                                '0 2px 8px color-mix(in srgb, var(--la-accent) 22%, transparent)';
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
                                backgroundColor: 'var(--la-surface-subtle)',
                                color: 'var(--la-accent)',
                                border: 'none',
                                borderRadius: 'var(--la-radius-sm)',
                                cursor: 'pointer',
                                transition:
                                    'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                fontFamily:
                                    'var(--la-font)',
                                letterSpacing: '0',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    'var(--la-border)';
                                e.currentTarget.style.transform = 'scale(0.98)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    'var(--la-surface-subtle)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}>
                            <Lightbulb size={20} />
                            显示答案
                        </button>
                    </div>
                )}
                {/* 快捷键提示 */}
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '16px',
                        fontSize: '12px',
                        color: 'var(--la-border)',
                        fontWeight: '500',
                        fontFamily:
                            'var(--la-font)',
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
                    backgroundColor: 'var(--la-surface)',
                    borderRadius: 'var(--la-radius-lg)',
                    boxShadow: '0 4px 16px color-mix(in srgb, black 8%, transparent)',
                    maxWidth: '560px',
                    margin: '0 auto',
                    border: '1px solid color-mix(in srgb, black 6%, transparent)',
                }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        color: 'var(--la-success)',
                    }}>
                    <CheckCircle size={72} />
                </div>
                <h2
                    style={{
                        margin: '0 0 12px 0',
                        color: 'var(--la-text-strong)',
                        fontSize: '28px',
                        fontWeight: '700',
                        letterSpacing: '0',
                        fontFamily:
                            'var(--la-font-display)',
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
                            backgroundColor: 'var(--la-surface-subtle)',
                            borderRadius: 'var(--la-radius-sm)',
                        }}>
                        <div
                            style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                color: 'var(--la-accent)',
                                letterSpacing: '0',
                                fontFamily:
                                    'var(--la-font-display)',
                            }}>
                            {session.studiedCards}
                        </div>
                        <div
                            style={{
                                fontSize: '12px',
                                color: 'var(--la-text-muted)',
                                marginTop: '4px',
                                fontWeight: '500',
                                fontFamily:
                                    'var(--la-font)',
                            }}>
                            已学习
                        </div>
                    </div>
                    <div
                        style={{
                            padding: '20px 16px',
                            backgroundColor: 'var(--la-surface-subtle)',
                            borderRadius: 'var(--la-radius-sm)',
                        }}>
                        <div
                            style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                color: 'var(--la-success)',
                                letterSpacing: '0',
                                fontFamily:
                                    'var(--la-font-display)',
                            }}>
                            {accuracy}%
                        </div>
                        <div
                            style={{
                                fontSize: '12px',
                                color: 'var(--la-text-muted)',
                                marginTop: '4px',
                                fontWeight: '500',
                                fontFamily:
                                    'var(--la-font)',
                            }}>
                            正确率
                        </div>
                    </div>
                    <div
                        style={{
                            padding: '20px 16px',
                            backgroundColor: 'var(--la-surface-subtle)',
                            borderRadius: 'var(--la-radius-sm)',
                        }}>
                        <div
                            style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                color: 'var(--la-warning)',
                                letterSpacing: '0',
                                fontFamily:
                                    'var(--la-font-display)',
                            }}>
                            {duration}
                        </div>
                        <div
                            style={{
                                fontSize: '12px',
                                color: 'var(--la-text-muted)',
                                marginTop: '4px',
                                fontWeight: '500',
                                fontFamily:
                                    'var(--la-font)',
                            }}>
                            分钟
                        </div>
                    </div>
                </div>
                <p
                    style={{
                        color: 'var(--la-text-muted)',
                        fontSize: '15px',
                        margin: '24px 0 0 0',
                        lineHeight: '1.5',
                        fontFamily:
                            'var(--la-font)',
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
                className="la-page la-srs-page is-studying"
                style={{
                    padding: '32px 24px',
                    minHeight: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'var(--la-surface-raised)',
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
                            backgroundColor: 'var(--la-surface-subtle)',
                            color: 'var(--la-text-muted)',
                            border: 'none',
                            borderRadius: 'var(--la-radius-sm)',
                            cursor: 'pointer',
                            transition:
                                'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            fontFamily:
                                'var(--la-font)',
                            letterSpacing: '0',
                            outline: 'none',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--la-border)';
                            e.currentTarget.style.transform = 'scale(0.98)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--la-surface-subtle)';
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
            className="la-page la-srs-page"
            style={{
                padding: '32px 24px 60px 24px',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--la-surface-raised)',
            }}>
            {renderStudyStats()}

            {/* 开始学习区域 */}
            <div
                style={{
                    backgroundColor: 'var(--la-surface)',
                    borderRadius: 'var(--la-radius-lg)',
                    boxShadow: '0 4px 16px color-mix(in srgb, black 8%, transparent)',
                    padding: '48px 40px',
                    textAlign: 'center',
                    maxWidth: '600px',
                    margin: '0 auto',
                    border: '1px solid color-mix(in srgb, black 6%, transparent)',
                }}>
                <h2
                    style={{
                        margin: '0 0 12px 0',
                        color: 'var(--la-text-strong)',
                        fontSize: '32px',
                        fontWeight: '700',
                        letterSpacing: '0',
                        fontFamily:
                            'var(--la-font-display)',
                    }}>
                    开始间隔学习
                </h2>
                <p
                    style={{
                        color: 'var(--la-text-muted)',
                        fontSize: '17px',
                        margin: '0 0 32px 0',
                        lineHeight: '1.5',
                        fontFamily:
                            'var(--la-font)',
                    }}>
                    {stats.dueToday > 0
                        ? `今天有 ${stats.dueToday} 个单词需要复习`
                        : '今天的学习已完成！'}
                </p>{' '}
                <div style={{ marginBottom: '36px' }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '12px',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: 'var(--la-text-strong)',
                            fontFamily:
                                'var(--la-font)',
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
                                border: '2px solid var(--la-accent)',
                                borderRadius: 'var(--la-radius-sm)',
                                backgroundColor: 'var(--la-surface)',
                                color: 'var(--la-text-strong)',
                                outline: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                minWidth: '200px',
                                fontFamily:
                                    'var(--la-font)',
                                boxShadow: '0 2px 8px color-mix(in srgb, black 10%, transparent)',
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
                            e.currentTarget.style.borderColor = 'var(--la-accent-strong)';
                            e.currentTarget.style.boxShadow =
                                '0 4px 12px color-mix(in srgb, var(--la-accent) 15%, transparent)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--la-accent)';
                            e.currentTarget.style.boxShadow =
                                '0 2px 8px color-mix(in srgb, black 10%, transparent)';
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--la-accent-bg)';
                            e.currentTarget.style.borderColor = 'var(--la-accent-strong)';
                            e.currentTarget.style.boxShadow =
                                '0 0 0 4px color-mix(in srgb, var(--la-accent) 15%, transparent)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--la-surface)';
                            e.currentTarget.style.borderColor = 'var(--la-accent)';
                            e.currentTarget.style.boxShadow =
                                '0 2px 8px color-mix(in srgb, black 10%, transparent)';
                        }}>
                        <option
                            value={10}
                            style={{
                                color: 'var(--la-text-strong)',
                                backgroundColor: 'var(--la-surface)',
                                padding: '10px',
                            }}>
                            10 张卡片
                        </option>
                        <option
                            value={20}
                            style={{
                                color: 'var(--la-text-strong)',
                                backgroundColor: 'var(--la-surface)',
                                padding: '10px',
                            }}>
                            20 张卡片
                        </option>
                        <option
                            value={50}
                            style={{
                                color: 'var(--la-text-strong)',
                                backgroundColor: 'var(--la-surface)',
                                padding: '10px',
                            }}>
                            50 张卡片
                        </option>
                        <option
                            value={100}
                            style={{
                                color: 'var(--la-text-strong)',
                                backgroundColor: 'var(--la-surface)',
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
                            stats.dueToday > 0 ? 'var(--la-accent)' : 'var(--la-border)',
                        color: stats.dueToday > 0 ? 'var(--la-surface)' : 'var(--la-border)',
                        border: 'none',
                        borderRadius: 'var(--la-radius-sm)',
                        cursor: stats.dueToday > 0 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        boxShadow:
                            stats.dueToday > 0
                                ? '0 4px 12px color-mix(in srgb, var(--la-accent) 22%, transparent)'
                                : 'none',
                        letterSpacing: '0',
                        fontFamily:
                            'var(--la-font)',
                        outline: 'none',
                    }}
                    onMouseEnter={(e) => {
                        if (stats.dueToday > 0) {
                            e.currentTarget.style.transform = 'scale(0.98)';
                            e.currentTarget.style.boxShadow =
                                '0 6px 16px color-mix(in srgb, var(--la-accent) 30%, transparent)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (stats.dueToday > 0) {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow =
                                '0 4px 12px color-mix(in srgb, var(--la-accent) 22%, transparent)';
                        }
                    }}>
                    {stats.dueToday > 0 ? '开始学习' : '暂无待学习单词'}
                </button>
            </div>
        </div>
    );
};

export default SpacedRepetitionLearning;

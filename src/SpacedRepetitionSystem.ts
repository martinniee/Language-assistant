// 间隔重复学习系统 (Spaced Repetition System)
// 基于Anki的SM2算法实现

import { Word, WordHelper } from './MarkdownWordStorage';

export enum ReviewResult {
    AGAIN = 0, // 陌生 - 完全不记得
    HARD = 1, // 模糊 - 记得但困难
    GOOD = 2, // 熟悉 - 记得且容易
    EASY = 3, // 简单 - 非常容易记得
}

export interface ReviewResponse {
    result: ReviewResult;
    reviewTime?: number; // 复习用时(秒)
}

export interface SRSConfig {
    // 新卡片的初始间隔
    newCardSteps: number[]; // 默认[1, 10] 分钟
    // 学习卡片的间隔
    learningSteps: number[]; // 默认[10] 分钟
    // 毕业间隔(天)
    graduatingInterval: number; // 默认1天
    // 简单间隔(天)
    easyInterval: number; // 默认4天
    // 最大间隔(天)
    maxInterval: number; // 默认36500天(100年)
    // 难度因子修正值
    easeModifiers: {
        again: number; // 默认-0.20
        hard: number; // 默认-0.15
        good: number; // 默认0
        easy: number; // 默认+0.15
    };
    // 间隔修正因子
    intervalModifiers: {
        again: number; // 默认0 (重置)
        hard: number; // 默认1.2
        good: number; // 默认使用难度因子
        easy: number; // 默认1.3
    };
}

// 数值格式化工具函数
export class SRSUtils {
    /**
     * 格式化 ease 值，保留3位小数
     */
    static formatEase(ease: number): number {
        return Math.round(ease * 1000) / 1000;
    }

    /**
     * 格式化间隔天数，保留整数
     */
    static formatInterval(interval: number): number {
        return Math.round(interval);
    }

    /**
     * 格式化所有 SRS 数值字段
     */
    static formatSRSData(data: any): any {
        if (data.ease !== undefined) {
            data.ease = this.formatEase(data.ease);
        }
        if (data.interval !== undefined) {
            data.interval = this.formatInterval(data.interval);
        }
        return data;
    }
}

export class SRSAlgorithm {
    private config: SRSConfig;

    constructor(config?: Partial<SRSConfig>) {
        this.config = {
            newCardSteps: [1, 10], // 分钟
            learningSteps: [10], // 分钟
            graduatingInterval: 1, // 天
            easyInterval: 4, // 天
            maxInterval: 36500, // 天
            easeModifiers: {
                again: -0.2,
                hard: -0.15,
                good: 0,
                easy: 0.15,
            },
            intervalModifiers: {
                again: 0,
                hard: 1.2,
                good: 0, // 使用难度因子
                easy: 1.3,
            },
            ...config,
        };
    }

    /**
     * 计算下次复习的时间间隔
     */
    calculateNextReview(
        word: Word,
        response: ReviewResponse,
    ): {
        nextReviewDate: Date;
        newSrsLevel: number;
        newEase: number;
        newInterval: number;
    } {
        const currentLevel = WordHelper.getSrsLevel(word);
        const currentEase = WordHelper.getEase(word);
        const currentInterval = WordHelper.getInterval(word);
        const reviewCount = WordHelper.getReviewCount(word);

        let newSrsLevel = currentLevel;
        let newEase = currentEase;
        let newInterval = currentInterval;
        let nextReviewDate: Date;

        switch (response.result) {
            case ReviewResult.AGAIN:
                // 陌生：重新开始学习
                newSrsLevel = 0;
                newInterval = this.config.newCardSteps[0] || 1;
                newEase = Math.max(
                    1.3,
                    currentEase + this.config.easeModifiers.again,
                );
                nextReviewDate = this.addMinutes(new Date(), newInterval);
                break;

            case ReviewResult.HARD:
                // 模糊：增加学习次数，减少难度因子
                newEase = Math.max(
                    1.3,
                    currentEase + this.config.easeModifiers.hard,
                );

                if (currentLevel < 2) {
                    // 还在学习阶段
                    newInterval =
                        this.config.newCardSteps[
                            Math.min(
                                currentLevel + 1,
                                this.config.newCardSteps.length - 1,
                            )
                        ] || 10;
                    nextReviewDate = this.addMinutes(new Date(), newInterval);
                    newSrsLevel = currentLevel + 1;
                } else {
                    // 已毕业，但回答困难
                    newInterval = Math.max(
                        1,
                        Math.round(
                            currentInterval *
                                this.config.intervalModifiers.hard,
                        ),
                    );
                    newInterval = Math.min(
                        newInterval,
                        this.config.maxInterval,
                    );
                    nextReviewDate = this.addDays(new Date(), newInterval);
                    newSrsLevel = Math.max(2, currentLevel);
                }
                break;

            case ReviewResult.GOOD:
                // 熟悉：正常间隔增长
                newEase = currentEase + this.config.easeModifiers.good;

                if (currentLevel === 0) {
                    // 新卡片第一次复习
                    newInterval = this.config.newCardSteps[1] || 10;
                    nextReviewDate = this.addMinutes(new Date(), newInterval);
                    newSrsLevel = 1;
                } else if (currentLevel === 1) {
                    // 第二次复习，毕业
                    newInterval = this.config.graduatingInterval;
                    nextReviewDate = this.addDays(new Date(), newInterval);
                    newSrsLevel = 2;
                } else {
                    // 已毕业的卡片
                    newInterval = Math.round(currentInterval * newEase);
                    newInterval = Math.min(
                        newInterval,
                        this.config.maxInterval,
                    );
                    nextReviewDate = this.addDays(new Date(), newInterval);
                    newSrsLevel = currentLevel + 1;
                }
                break;

            case ReviewResult.EASY:
                // 简单：大幅增加间隔
                newEase = currentEase + this.config.easeModifiers.easy;

                if (currentLevel < 2) {
                    // 学习阶段直接毕业并设置简单间隔
                    newInterval = this.config.easyInterval;
                    nextReviewDate = this.addDays(new Date(), newInterval);
                    newSrsLevel = 2;
                } else {
                    // 已毕业的卡片
                    newInterval = Math.round(
                        currentInterval *
                            newEase *
                            this.config.intervalModifiers.easy,
                    );
                    newInterval = Math.min(
                        newInterval,
                        this.config.maxInterval,
                    );
                    nextReviewDate = this.addDays(new Date(), newInterval);
                    newSrsLevel = currentLevel + 1;
                }
                break;
        }

        // 确保难度因子在合理范围内并格式化数值
        newEase = Math.max(1.3, Math.min(2.5, newEase));
        newEase = SRSUtils.formatEase(newEase);
        newInterval = SRSUtils.formatInterval(newInterval);

        return {
            nextReviewDate,
            newSrsLevel,
            newEase,
            newInterval,
        };
    }

    /**
     * 更新单词的SRS数据
     */
    updateWordSRSData(word: Word, response: ReviewResponse): Word {
        const calculation = this.calculateNextReview(word, response);
        const now = new Date().toISOString();

        const updatedWord: Word = {
            ...word,
            metadata: {
                ...word.metadata,
                srsLevel: calculation.newSrsLevel,
                nextReviewDate: calculation.nextReviewDate.toISOString(),
                lastReviewDate: now,
                reviewCount: (word.metadata.reviewCount || 0) + 1,
                correctCount:
                    (word.metadata.correctCount || 0) +
                    (response.result >= ReviewResult.GOOD ? 1 : 0),
                ease: calculation.newEase,
                interval: calculation.newInterval,
                lastUpdate: now,
            },
        };

        return updatedWord;
    }

    /**
     * 获取需要复习的单词
     */
    getWordsForReview(words: Word[], limit: number = 20): Word[] {
        const now = new Date();

        const dueWords = words.filter((word) => {
            const nextReviewDate = WordHelper.getNextReviewDate(word);
            return !nextReviewDate || nextReviewDate <= now;
        });

        // 按优先级排序：新卡片 > 过期时间长的 > SRS等级低的
        dueWords.sort((a, b) => {
            const aLevel = WordHelper.getSrsLevel(a);
            const bLevel = WordHelper.getSrsLevel(b);

            // 新卡片优先
            if (aLevel === 0 && bLevel !== 0) return -1;
            if (bLevel === 0 && aLevel !== 0) return 1;

            // 过期时间排序
            const aDays = WordHelper.getDaysUntilReview(a);
            const bDays = WordHelper.getDaysUntilReview(b);
            if (aDays !== bDays) return aDays - bDays;

            // SRS等级排序(等级低的优先)
            return aLevel - bLevel;
        });

        return dueWords.slice(0, limit);
    }

    /**
     * 获取学习统计信息
     */
    getStudyStats(words: Word[]): {
        total: number;
        new: number;
        learning: number;
        review: number;
        dueToday: number;
        accuracy: number;
    } {
        const now = new Date();
        let newCards = 0;
        let learningCards = 0;
        let reviewCards = 0;
        let dueToday = 0;
        let totalReviews = 0;
        let totalCorrect = 0;

        words.forEach((word) => {
            const level = WordHelper.getSrsLevel(word);
            const nextReviewDate = WordHelper.getNextReviewDate(word);

            if (level === 0) {
                newCards++;
            } else if (level === 1) {
                learningCards++;
            } else {
                reviewCards++;
            }

            if (!nextReviewDate || nextReviewDate <= now) {
                dueToday++;
            }

            totalReviews += WordHelper.getReviewCount(word);
            totalCorrect += WordHelper.getCorrectCount(word);
        });

        return {
            total: words.length,
            new: newCards,
            learning: learningCards,
            review: reviewCards,
            dueToday,
            accuracy:
                totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0,
        };
    }

    private addMinutes(date: Date, minutes: number): Date {
        return new Date(date.getTime() + minutes * 60 * 1000);
    }

    private addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}

// 默认SRS实例
export const defaultSRS = new SRSAlgorithm();

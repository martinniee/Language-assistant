import { createElement, type ReactNode } from 'react';
import {
    BarChart2,
    BookOpen,
    Brain,
    HardDrive,
    Layers,
    Settings as SettingsIcon,
} from 'lucide-react';
import { ViewMode } from '../types/WordManagerType';

export const PARTS_OF_SPEECH_GROUPS: Record<string, string[]> = {
    基础词性: ['名词', '动词', '形容词', '副词'],
    功能词性: ['介词', '代词', '连词', '感叹词'],
    特殊词性: ['助动词', '情态动词', '数词', '冠词'],
    动词形式: ['不定式', '动名词', '分词'],
};

export interface NavigationItem {
    id: ViewMode;
    label: string;
    icon: ReactNode;
    description: string;
    badge?: number;
}

const icon = (IconComponent: React.ComponentType<{ size?: number }>) =>
    createElement(IconComponent, { size: 20 });

export const getNavigationItems = (dueWords: number): NavigationItem[] => [
    {
        id: 'home',
        label: '单词管理',
        icon: icon(BookOpen),
        description: '添加、编辑和管理单词',
    },
    {
        id: 'srs',
        label: '间隔学习',
        icon: icon(Brain),
        description: '间隔重复学习系统',
        badge: dueWords > 0 ? dueWords : undefined,
    },
    {
        id: 'statistics',
        label: '数据统计',
        icon: icon(BarChart2),
        description: '学习进度和统计分析',
    },
    {
        id: 'import-export',
        label: '导入导出',
        icon: icon(HardDrive),
        description: '数据导入导出功能',
    },
    {
        id: 'global-meta',
        label: '元数据管理',
        icon: icon(Layers),
        description: '全局元数据配置和别名管理',
    },
    {
        id: 'settings',
        label: '配置设置',
        icon: icon(SettingsIcon),
        description: '系统设置和偏好配置',
    },
];

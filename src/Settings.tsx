// iOS 风格设置配置组件
import React, { useState } from 'react';
import {
    Settings as SettingsIcon,
    Brain,
    TrendingUp,
    List,
    Save,
    RotateCcw,
    Info,
    AlertTriangle,
} from 'lucide-react';

const Settings: React.FC = () => {
    const [srsConfig, setSrsConfig] = useState({
        newCardSteps: '1,10',
        graduatingInterval: 1,
        easyInterval: 4,
        maxInterval: 36500,
        easeModifiersAgain: -0.2,
        easeModifiersHard: -0.15,
        easeModifiersGood: 0,
        easeModifiersEasy: 0.15,
    });

    const [generalConfig, setGeneralConfig] = useState({
        dailyStudyLimit: 20,
        autoBackup: true,
        showProgress: true,
        playSound: false,
        theme: 'light',
    });

    const [isUnsaved, setIsUnsaved] = useState(false);

    const handleSrsConfigChange = (key: string, value: any) => {
        setSrsConfig((prev) => ({ ...prev, [key]: value }));
        setIsUnsaved(true);
    };

    const handleGeneralConfigChange = (key: string, value: any) => {
        setGeneralConfig((prev) => ({ ...prev, [key]: value }));
        setIsUnsaved(true);
    };

    const handleSave = () => {
        console.log('保存配置:', { srsConfig, generalConfig });
        setIsUnsaved(false);
        // iOS 风格成功提示
        const successDiv = document.createElement('div');
        successDiv.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;vertical-align:-3px"><polyline points="20 6 9 17 4 12"></polyline></svg>设置已保存`;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: linear-gradient(135deg, #34C759 0%, #30A14E 100%);
            color: white;
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            box-shadow: 0 4px 16px rgba(52, 199, 89, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(successDiv);
        setTimeout(() => {
            successDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => document.body.removeChild(successDiv), 300);
        }, 2000);
    };

    const handleReset = () => {
        if (confirm('确定要重置所有设置到默认值吗？')) {
            setSrsConfig({
                newCardSteps: '1,10',
                graduatingInterval: 1,
                easyInterval: 4,
                maxInterval: 36500,
                easeModifiersAgain: -0.2,
                easeModifiersHard: -0.15,
                easeModifiersGood: 0,
                easeModifiersEasy: 0.15,
            });
            setGeneralConfig({
                dailyStudyLimit: 20,
                autoBackup: true,
                showProgress: true,
                playSound: false,
                theme: 'light',
            });
            setIsUnsaved(false);
        }
    };

    const renderConfigSection = (
        icon: React.ReactNode,
        title: string,
        description: string,
        children: React.ReactNode,
    ) => (
        <div
            style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                padding: '24px',
                marginBottom: '24px',
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
            }}>
            <h3
                style={{
                    margin: '0 0 8px 0',
                    color: '#1c1c1e',
                    fontSize: '20px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                <span style={{ color: '#007AFF', display: 'flex' }}>
                    {icon}
                </span>
                {title}
            </h3>
            <p
                style={{
                    margin: '0 0 24px 0',
                    color: '#8e8e93',
                    fontSize: '15px',
                    lineHeight: '1.4',
                }}>
                {description}
            </p>
            {children}
        </div>
    );

    const renderInputField = (
        label: string,
        value: any,
        onChange: (value: any) => void,
        type: 'text' | 'number' | 'checkbox' | 'select' = 'text',
        options?: string[],
        help?: string,
    ) => (
        <div style={{ marginBottom: '20px' }}>
            <label
                style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#1d1d1f',
                }}>
                {label}
            </label>

            {type === 'checkbox' ? (
                <label
                    className="ios-checkbox-label"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        padding: '12px 16px',
                        backgroundColor: '#f5f5f7',
                        borderRadius: '12px',
                        transition: 'background-color 0.2s',
                    }}>
                    <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="ios-checkbox"
                        style={{
                            marginRight: '12px',
                            width: '20px',
                            height: '20px',
                            accentColor: '#007AFF',
                            cursor: 'pointer',
                        }}
                    />
                    <span style={{ fontSize: '15px', color: '#1d1d1f' }}>
                        启用此功能
                    </span>
                </label>
            ) : type === 'select' ? (
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="ios-input"
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1.5px solid #d2d2d7',
                        borderRadius: '12px',
                        fontSize: '15px',
                        backgroundColor: '#ffffff',
                        color: '#1d1d1f',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        appearance: 'none',
                        backgroundImage:
                            'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231d1d1f%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px top 50%',
                        backgroundSize: '12px auto',
                    }}>
                    {options?.map((option) => (
                        <option
                            key={option}
                            value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={(e) =>
                        onChange(
                            type === 'number'
                                ? parseFloat(e.target.value)
                                : e.target.value,
                        )
                    }
                    className="ios-input"
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1.5px solid #d2d2d7',
                        borderRadius: '12px',
                        fontSize: '15px',
                        backgroundColor: '#ffffff',
                        color: '#1d1d1f',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box',
                    }}
                />
            )}

            {help && (
                <div
                    style={{
                        fontSize: '13px',
                        color: '#86868b',
                        marginTop: '8px',
                        lineHeight: '1.4',
                    }}>
                    {help}
                </div>
            )}
        </div>
    );
    return (
        <div
            style={{
                padding: '30px 30px 100px 30px',
                maxWidth: '800px',
                margin: '0 auto',
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}>
            <style>
                {`
                .ios-input:focus {
                    border-color: #007AFF !important;
                    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1) !important;
                }
                .ios-checkbox-label:active {
                    background-color: #e5e5ea !important;
                }
                .ios-btn {
                    transition: transform 0.1s ease, opacity 0.1s ease;
                }
                .ios-btn:active {
                    transform: scale(0.96);
                    opacity: 0.8;
                }
                @keyframes slideIn {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(-20px); opacity: 0; }
                }
                `}
            </style>

            {/* 保存状态提示 */}
            {isUnsaved && (
                <div
                    style={{
                        padding: '16px 20px',
                        marginBottom: '24px',
                        backgroundColor: '#fff9e6',
                        color: '#b27b00',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }}>
                    <AlertTriangle
                        size={20}
                        style={{ marginRight: '8px' }}
                    />
                    有未保存的更改，请记得保存设置
                </div>
            )}

            {/* 通用设置 */}
            {renderConfigSection(
                <SettingsIcon size={22} />,
                '通用设置',
                '应用的基本配置选项',
                <>
                    {renderInputField(
                        '每日学习上限',
                        generalConfig.dailyStudyLimit,
                        (value) =>
                            handleGeneralConfigChange('dailyStudyLimit', value),
                        'number',
                        undefined,
                        '每天最多学习多少张卡片',
                    )}

                    {renderInputField(
                        '自动备份',
                        generalConfig.autoBackup,
                        (value) =>
                            handleGeneralConfigChange('autoBackup', value),
                        'checkbox',
                        undefined,
                        '自动保存学习进度和数据',
                    )}

                    {renderInputField(
                        '显示学习进度',
                        generalConfig.showProgress,
                        (value) =>
                            handleGeneralConfigChange('showProgress', value),
                        'checkbox',
                        undefined,
                        '在学习过程中显示进度条',
                    )}

                    {renderInputField(
                        '音效提示',
                        generalConfig.playSound,
                        (value) =>
                            handleGeneralConfigChange('playSound', value),
                        'checkbox',
                        undefined,
                        '答题时播放音效提示',
                    )}

                    {renderInputField(
                        '界面主题',
                        generalConfig.theme,
                        (value) => handleGeneralConfigChange('theme', value),
                        'select',
                        ['light', 'dark', 'auto'],
                        '选择应用的外观主题',
                    )}
                </>,
            )}

            {/* 间隔重复算法设置 */}
            {renderConfigSection(
                <Brain size={22} />,
                '间隔重复算法',
                '调整学习算法的参数以优化学习效果',
                <>
                    {renderInputField(
                        '新卡片步骤 (分钟)',
                        srsConfig.newCardSteps,
                        (value) => handleSrsConfigChange('newCardSteps', value),
                        'text',
                        undefined,
                        '新卡片的学习间隔，用逗号分隔，如: 1,10',
                    )}

                    {renderInputField(
                        '毕业间隔 (天)',
                        srsConfig.graduatingInterval,
                        (value) =>
                            handleSrsConfigChange('graduatingInterval', value),
                        'number',
                        undefined,
                        '卡片从学习阶段毕业后的初始间隔',
                    )}

                    {renderInputField(
                        '简单间隔 (天)',
                        srsConfig.easyInterval,
                        (value) => handleSrsConfigChange('easyInterval', value),
                        'number',
                        undefined,
                        '选择"简单"时直接设置的间隔',
                    )}

                    {renderInputField(
                        '最大间隔 (天)',
                        srsConfig.maxInterval,
                        (value) => handleSrsConfigChange('maxInterval', value),
                        'number',
                        undefined,
                        '任何卡片的最大复习间隔',
                    )}
                </>,
            )}

            {/* 难度因子调整 */}
            {renderConfigSection(
                <TrendingUp size={22} />,
                '难度因子调整',
                '根据回答质量调整卡片难度的参数',
                <>
                    {renderInputField(
                        '"陌生" 难度调整',
                        srsConfig.easeModifiersAgain,
                        (value) =>
                            handleSrsConfigChange('easeModifiersAgain', value),
                        'number',
                        undefined,
                        '选择"陌生"时难度因子的变化量 (负数表示增加难度)',
                    )}

                    {renderInputField(
                        '"模糊" 难度调整',
                        srsConfig.easeModifiersHard,
                        (value) =>
                            handleSrsConfigChange('easeModifiersHard', value),
                        'number',
                        undefined,
                        '选择"模糊"时难度因子的变化量',
                    )}

                    {renderInputField(
                        '"熟悉" 难度调整',
                        srsConfig.easeModifiersGood,
                        (value) =>
                            handleSrsConfigChange('easeModifiersGood', value),
                        'number',
                        undefined,
                        '选择"熟悉"时难度因子的变化量 (通常为0)',
                    )}

                    {renderInputField(
                        '"简单" 难度调整',
                        srsConfig.easeModifiersEasy,
                        (value) =>
                            handleSrsConfigChange('easeModifiersEasy', value),
                        'number',
                        undefined,
                        '选择"简单"时难度因子的变化量 (正数表示降低难度)',
                    )}
                </>,
            )}

            {/* 预设配置 */}
            {renderConfigSection(
                <List size={22} />,
                '预设配置',
                '快速应用常用的配置组合',
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                    }}>
                    <button
                        onClick={() => {
                            setSrsConfig({
                                newCardSteps: '1,10',
                                graduatingInterval: 1,
                                easyInterval: 4,
                                maxInterval: 36500,
                                easeModifiersAgain: -0.2,
                                easeModifiersHard: -0.15,
                                easeModifiersGood: 0,
                                easeModifiersEasy: 0.15,
                            });
                            setIsUnsaved(true);
                        }}
                        style={{
                            padding: '16px',
                            backgroundColor: '#f2f2f7',
                            border: '1px solid transparent',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#e5e5ea';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#f2f2f7';
                        }}>
                        <div
                            style={{
                                fontWeight: '600',
                                color: '#007AFF',
                                fontSize: '16px',
                            }}>
                            标准模式
                        </div>
                        <div
                            style={{
                                fontSize: '13px',
                                color: '#8e8e93',
                                marginTop: '6px',
                                lineHeight: '1.4',
                            }}>
                            适合大多数用户的平衡设置
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            setSrsConfig({
                                newCardSteps: '1,3',
                                graduatingInterval: 1,
                                easyInterval: 2,
                                maxInterval: 180,
                                easeModifiersAgain: -0.3,
                                easeModifiersHard: -0.2,
                                easeModifiersGood: 0,
                                easeModifiersEasy: 0.1,
                            });
                            setIsUnsaved(true);
                        }}
                        style={{
                            padding: '16px',
                            backgroundColor: '#f2f2f7',
                            border: '1px solid transparent',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#e5e5ea';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#f2f2f7';
                        }}>
                        <div
                            style={{
                                fontWeight: '600',
                                color: '#FF9500',
                                fontSize: '16px',
                            }}>
                            密集模式
                        </div>
                        <div
                            style={{
                                fontSize: '13px',
                                color: '#8e8e93',
                                marginTop: '6px',
                                lineHeight: '1.4',
                            }}>
                            更频繁的复习，适合短期冲刺
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            setSrsConfig({
                                newCardSteps: '10,1440',
                                graduatingInterval: 3,
                                easyInterval: 7,
                                maxInterval: 36500,
                                easeModifiersAgain: -0.1,
                                easeModifiersHard: -0.1,
                                easeModifiersGood: 0,
                                easeModifiersEasy: 0.2,
                            });
                            setIsUnsaved(true);
                        }}
                        style={{
                            padding: '16px',
                            backgroundColor: '#f2f2f7',
                            border: '1px solid transparent',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#e5e5ea';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#f2f2f7';
                        }}>
                        <div
                            style={{
                                fontWeight: '600',
                                color: '#34C759',
                                fontSize: '16px',
                            }}>
                            轻松模式
                        </div>
                        <div
                            style={{
                                fontSize: '13px',
                                color: '#8e8e93',
                                marginTop: '6px',
                                lineHeight: '1.4',
                            }}>
                            较长的间隔，适合长期记忆
                        </div>
                    </button>
                </div>,
            )}

            {/* 操作按钮 */}
            <div
                style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center',
                    marginTop: '40px',
                    paddingTop: '30px',
                    borderTop: '1px solid #e5e5ea',
                }}>
                <button
                    onClick={handleSave}
                    className="ios-btn"
                    style={{
                        padding: '14px 32px',
                        backgroundColor: '#007AFF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        boxShadow: '0 4px 14px rgba(0, 122, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                    <Save
                        size={18}
                        style={{ marginRight: '8px' }}
                    />
                    保存设置
                </button>

                <button
                    onClick={handleReset}
                    className="ios-btn"
                    style={{
                        padding: '14px 32px',
                        backgroundColor: '#ffffff',
                        color: '#FF3B30',
                        border: '1.5px solid #FF3B30',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                    <RotateCcw
                        size={18}
                        style={{ marginRight: '8px' }}
                    />
                    重置默认
                </button>
            </div>

            {/* 帮助信息 */}
            <div
                style={{
                    marginTop: '40px',
                    padding: '24px',
                    backgroundColor: '#f2f2f7',
                    borderRadius: '16px',
                    fontSize: '14px',
                    color: '#8e8e93',
                    lineHeight: '1.6',
                }}>
                <h4
                    style={{
                        margin: '0 0 12px 0',
                        color: '#1c1c1e',
                        fontSize: '16px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}>
                    <Info
                        size={20}
                        color="#007AFF"
                    />
                    配置说明
                </h4>
                <ul style={{ margin: 0, paddingLeft: '24px' }}>
                    <li style={{ marginBottom: '6px' }}>
                        难度因子控制卡片的学习频率，范围通常在1.3-2.5之间
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                        较低的难度因子意味着更频繁的复习
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                        新卡片步骤决定了初学阶段的复习间隔
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                        修改设置后建议进行几天的试用以评估效果
                    </li>
                    <li>如果学习效果不佳，可以尝试不同的预设配置</li>
                </ul>
            </div>
        </div>
    );
};

export default Settings;

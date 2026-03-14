// 设置配置组件
import React, { useState } from 'react';

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
        // 这里可以实际保存配置到本地存储或服务器
        console.log('保存配置:', { srsConfig, generalConfig });
        setIsUnsaved(false);
        alert('设置已保存！');
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
        title: string,
        description: string,
        children: React.ReactNode,
    ) => (
        <div
            style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                padding: '25px',
                marginBottom: '25px',
            }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>{title}</h3>
            <p
                style={{
                    margin: '0 0 20px 0',
                    color: '#7f8c8d',
                    fontSize: '14px',
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
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#555',
                }}>
                {label}
            </label>

            {type === 'checkbox' ? (
                <label
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                    }}>
                    <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        style={{ marginRight: '8px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#555' }}>
                        启用此功能
                    </span>
                </label>
            ) : type === 'select' ? (
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
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
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                    }}
                />
            )}

            {help && (
                <div
                    style={{
                        fontSize: '12px',
                        color: '#999',
                        marginTop: '4px',
                    }}>
                    {help}
                </div>
            )}
        </div>
    );
    return (
        <div style={{ padding: '30px 30px 60px 30px', maxWidth: '800px' }}>
            {/* 保存状态提示 */}
            {isUnsaved && (
                <div
                    style={{
                        padding: '15px 20px',
                        marginBottom: '20px',
                        backgroundColor: '#fff3cd',
                        color: '#856404',
                        border: '1px solid #ffeaa7',
                        borderRadius: '8px',
                        fontSize: '14px',
                    }}>
                    ⚠️ 有未保存的更改，请记得保存设置
                </div>
            )}

            {/* 通用设置 */}
            {renderConfigSection(
                '🎛️ 通用设置',
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
                '🧠 间隔重复算法',
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
                '⚖️ 难度因子调整',
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
                '📋 预设配置',
                '快速应用常用的配置组合',
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px',
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
                            padding: '15px',
                            backgroundColor: '#e3f2fd',
                            border: '1px solid #1976d2',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'center',
                        }}>
                        <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
                            标准模式
                        </div>
                        <div
                            style={{
                                fontSize: '12px',
                                color: '#666',
                                marginTop: '5px',
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
                            padding: '15px',
                            backgroundColor: '#fff3e0',
                            border: '1px solid #f57c00',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'center',
                        }}>
                        <div style={{ fontWeight: 'bold', color: '#f57c00' }}>
                            密集模式
                        </div>
                        <div
                            style={{
                                fontSize: '12px',
                                color: '#666',
                                marginTop: '5px',
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
                            padding: '15px',
                            backgroundColor: '#e8f5e8',
                            border: '1px solid #4caf50',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'center',
                        }}>
                        <div style={{ fontWeight: 'bold', color: '#4caf50' }}>
                            轻松模式
                        </div>
                        <div
                            style={{
                                fontSize: '12px',
                                color: '#666',
                                marginTop: '5px',
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
                    marginTop: '30px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e0e0e0',
                }}>
                <button
                    onClick={handleSave}
                    style={{
                        padding: '12px 30px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        boxShadow: '0 2px 4px rgba(40,167,69,0.2)',
                    }}>
                    💾 保存设置
                </button>

                <button
                    onClick={handleReset}
                    style={{
                        padding: '12px 30px',
                        backgroundColor: 'transparent',
                        color: '#dc3545',
                        border: '2px solid #dc3545',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                    }}>
                    🔄 重置默认
                </button>
            </div>

            {/* 帮助信息 */}
            <div
                style={{
                    marginTop: '40px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#666',
                    lineHeight: '1.5',
                }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>
                    💡 配置说明
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>难度因子控制卡片的学习频率，范围通常在1.3-2.5之间</li>
                    <li>较低的难度因子意味着更频繁的复习</li>
                    <li>新卡片步骤决定了初学阶段的复习间隔</li>
                    <li>修改设置后建议进行几天的试用以评估效果</li>
                    <li>如果学习效果不佳，可以尝试不同的预设配置</li>
                </ul>
            </div>
        </div>
    );
};

export default Settings;

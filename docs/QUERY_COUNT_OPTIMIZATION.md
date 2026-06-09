# 查询次数优化说明

## 🎯 优化目标

将查询次数的统计逻辑从"每次查看详情"优化为"通过搜索/筛选后查看详情"，使数据更有意义且不易被无意操作影响。

## 📊 修改前后对比

### 修改前

-   **触发条件**: 任何时候点击单词进入详情页面
-   **问题**:
    -   数据变动过于频繁
    -   无法区分"随意浏览"和"主动查询"
    -   查询次数失去了统计意义

### 修改后

-   **触发条件**: 只有在存在搜索/筛选条件时点击进入详情
-   **优势**:
    -   数据更有意义，真正反映用户的"查询"行为
    -   避免了无意的数据污染
    -   符合"查询"的语义逻辑

## 🔧 技术实现

### 判断条件

查询次数增加的条件是存在以下任一筛选条件：

```typescript
const hasSearchFilters =
    searchTerm.trim() !== '' || // 关键词搜索
    selectedTags.length > 0 || // 标签筛选
    selectedCategories.length > 0 || // 分类筛选
    selectedLevels.length > 0 || // 等级筛选
    selectedPartsOfSpeech.length > 0; // 词性筛选
```

### 核心逻辑

```typescript
const handleViewWord = useCallback(
    (word: Word) => {
        // 检查是否有搜索或筛选条件
        const hasSearchFilters =
            searchTerm.trim() !== '' ||
            selectedTags.length > 0 ||
            selectedCategories.length > 0 ||
            selectedLevels.length > 0 ||
            selectedPartsOfSpeech.length > 0;

        let updatedWord: Word;

        if (hasSearchFilters) {
            // 有搜索/筛选条件时，查询次数+1
            updatedWord = {
                ...word,
                metadata: {
                    ...word.metadata,
                    queryCount: (word.metadata.queryCount || 0) + 1,
                },
            };
            // 同步更新到数据存储中
            onEdit(updatedWord);
        } else {
            // 没有搜索/筛选条件时，不增加查询次数
            updatedWord = word;
        }

        // 更新当前单词状态
        setCurrentWord(updatedWord);
        setViewMode('detail');
    },
    [
        onEdit,
        searchTerm,
        selectedTags,
        selectedCategories,
        selectedLevels,
        selectedPartsOfSpeech,
    ],
);
```

## 🎨 用户体验场景

### 场景 1: 随意浏览 (不增加查询次数)

1. 用户打开插件面板
2. 在完整的单词列表中随意点击单词查看详情
3. **结果**: 查询次数不变

### 场景 2: 主动搜索 (增加查询次数)

1. 用户在搜索框输入 "hello"
2. 点击搜索结果中的单词进入详情页面
3. **结果**: 查询次数 +1

### 场景 3: 筛选查询 (增加查询次数)

1. 用户选择标签筛选 "基础"
2. 或选择分类筛选 "日常用语"
3. 或选择等级筛选 "初级"
4. 点击筛选结果中的单词进入详情页面
5. **结果**: 查询次数 +1

### 场景 4: 组合条件 (增加查询次数)

1. 用户同时使用关键词搜索和标签筛选
2. 点击符合条件的单词进入详情页面
3. **结果**: 查询次数 +1

## 📈 数据意义提升

### 更准确的用户行为反映

-   **高查询次数**: 表示用户经常需要查找这个单词
-   **低查询次数**: 表示用户对这个单词比较熟悉，不需要经常查询
-   **零查询次数**: 表示用户从未主动搜索过这个单词

### 实用的数据应用

-   可以根据查询次数排序，优先显示用户最需要的单词
-   可以识别用户的薄弱环节（高查询次数的单词）
-   可以用于个性化推荐和复习计划

## 🚀 后续可能的扩展

1. **智能推荐**: 根据查询频率推荐需要重点学习的单词
2. **数据分析**: 提供用户学习报告和进度跟踪
3. **自动复习**: 根据查询模式安排复习提醒

这个优化使查询次数统计更加科学合理，为后续的数据分析和智能功能奠定了基础。

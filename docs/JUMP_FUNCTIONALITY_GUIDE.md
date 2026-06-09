# Jump to Source Functionality Guide

## Overview

This guide explains the newly implemented "Jump to Source" functionality that allows users to navigate from the word management interface directly to the corresponding position in the `words.md` markdown file.

## Features Implemented

### 1. ID Field Addition

-   **Word Interface**: Added `id: string` field to the Word interface for unique identification
-   **UUID Generation**: Implemented UUID-style ID generation using format: `'word-' + random + timestamp`
-   **Auto-generation**: Words without IDs automatically get new ones during parsing

### 2. Parsing Enhancement

-   **ID Field Parsing**: Added support for parsing ID fields from markdown with patterns:
    -   `-   ID: word-abc123-def456`
    -   `- ID: word-abc123-def456`
    -   `-   id: word-abc123-def456` (case insensitive)
    -   `- id: word-abc123-def456`
-   **Backward Compatibility**: Existing words without IDs get auto-generated ones
-   **Preservation**: Existing IDs are preserved during file operations

### 3. UI Enhancements

-   **Jump Button**: Added "跳转" (Jump) button to both WordCard and WordListItem components
-   **Button Styling**: Blue-themed button with hover effects
-   **Integration**: Seamlessly integrated with existing edit/delete buttons

### 4. Navigation Logic

-   **File Detection**: Automatically locates `words.md` file in the vault
-   **ID Search**: Searches through markdown content to find words by ID
-   **Header Location**: Finds the associated word header (any level: #, ##, ###, etc.)
-   **Editor Navigation**: Opens the file and scrolls to the exact word location
-   **User Feedback**: Provides success/error notifications

## How to Use

### 1. Open Word Manager

-   Use the ribbon button (📖) or command palette
-   Command: `📖 打开单词管理页面`

### 2. Navigate to Word

-   Find the word you want to locate in the markdown
-   Click the blue "跳转" (Jump) button next to edit/delete buttons
-   The plugin will automatically:
    -   Open `words.md` file
    -   Navigate to the word's location
    -   Position the cursor at the word header

### 3. View Results

-   Success: Shows message with word name and line number
-   Error: Shows appropriate error message if word not found

## Technical Details

### ID Format

```
word-[9-char-random]-[timestamp-base36]
Example: word-abc123def-k8n9m2l1p
```

### Markdown Structure

```markdown
## hello

-   ID: word-test123-abc456
-   发音: /həˈloʊ/
-   词汇: hello
    ...
```

### Code Files Modified

1. **MarkdownWordStorage.ts**

    - Enhanced Word interface with `id` field
    - Added ID parsing logic in `parseMarkdownToWords()`
    - Added ID serialization in `wordsToMarkdown()`
    - Added `generateId()` method

2. **obsidian-plugin.ts**

    - Added `jumpToWordInMarkdown()` method
    - Enhanced `handleAddWord()` to generate IDs
    - Updated component props to include jump functionality

3. **WordManagerMarkdownNew.tsx**
    - Updated WordManagerProps interface
    - Added jump buttons to WordCard and WordListItem
    - Updated component prop passing

## Error Handling

-   **File Not Found**: Graceful handling when `words.md` doesn't exist
-   **ID Not Found**: Clear error message when word ID is missing
-   **Navigation Failure**: Fallback error handling for editor issues

## Backward Compatibility

-   **Existing Words**: Automatically get IDs assigned during next save
-   **Old Format**: Continues to work without IDs until next modification
-   **No Breaking Changes**: All existing functionality remains intact

## Testing

1. Build the plugin: `npm run build-app`
2. Restart Obsidian or reload the plugin
3. Open the word manager interface
4. Test jump functionality with existing words
5. Add new words and verify they get IDs automatically

## Future Enhancements

-   **Bulk ID Generation**: Add option to generate IDs for all existing words
-   **Advanced Search**: Find words by partial content or other fields
-   **Multiple File Support**: Extend to support multiple markdown files
-   **Deep Linking**: Support direct links to words from other notes

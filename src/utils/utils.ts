import { Notice } from 'obsidian';
import { WordManagerView } from '../obsidian-plugin';

type JumpToLineCallback = (
    lines: string[],
    text: string,
) => { targetLine: number; foundWordName: string };

const jumpToSpecifiedLocation = async function (
    this: WordManagerView,
    text: string,
    callback: JumpToLineCallback,
    noticeSuccessCallback: (foundWordName: string, targetLine: number) => void,
    noticeFailureCallback: (text: string) => void,
): Promise<void> {
    const filePath = (this as any).plugin.settings.wordsFilePath;
    const tFile = this.app.vault.getFileByPath(filePath);

    if (!tFile) {
        new Notice(` 未找到文件: ${filePath}`);
        return;
    }

    const content = await this.app.vault.read(tFile);
    const lines = content.split('\n');

    if (!tFile) {
        new Notice(` 未找到文件: ${filePath}`);
        return;
    }
    // 1. 知道跳转位置的行号,
    const { targetLine, foundWordName } = (await getJumpToLineFromText(
        text,
        lines,
        callback,
    )) as { targetLine: number; foundWordName: string };
    // 2. 跳转到指定位置，设置 光标 和 滚动到视图
    if (targetLine >= 0) {
        // 打开文件并跳转到指定行
        const { foundWordName1, targetLine1 } = (await scrollToLine.call(
            this,
            tFile,
            targetLine,
            foundWordName,
        )) as { targetLine1: number; foundWordName1: string };
        noticeSuccessCallback(foundWordName1, targetLine1);
    } else {
        noticeFailureCallback(text);
    }
};

async function getJumpToLineFromText(
    this: any,
    text: string,
    lines: string[],
    callback: (
        lines: string[],
        text: string,
    ) => {
        targetLine: number;
        foundWordName: string;
    },
): Promise<void | { targetLine: number; foundWordName: string }> {
    const { targetLine, foundWordName } = callback(lines, text);

    return { targetLine: targetLine, foundWordName: foundWordName };
}
async function scrollToLine(
    this: any,
    tFile: any,
    targetLine: number,
    foundWordName: string,
): Promise<void | { targetLine1: number; foundWordName1: string }> {
    const leaf = this.app.workspace.getLeaf(false);
    if (leaf) {
        await leaf.openFile(tFile);

        // 等待一小段时间确保文件已打开
        setTimeout(() => {
            // 获取编辑器并跳转到行
            const view = leaf.view;
            const editor = view.editor as any;
            if (view && 'editor' in view && view.editor) {
                editor.setCursor({ line: targetLine, ch: 0 });
                editor.scrollIntoView({
                    from: { line: targetLine, ch: 0 },
                    to: { line: targetLine, ch: 0 },
                });
            }
            const cm = editor.cm;
            if (cm) {
                // 获取目标行在文档中的字符偏移量
                const linePos = cm.state.doc.line(targetLine + 1); // CM6 行号从 1 开始
                // 获取目标行的 DOM 坐标
                const coords = cm.coordsAtPos(linePos.from);
                if (coords) {
                    // 当前滚动位置 + 目标行的 top 偏移，使其出现在顶部（留 16px 上边距）
                    const currentScrollTop = cm.scrollDOM.scrollTop;
                    const editorTop = cm.scrollDOM.getBoundingClientRect().top;
                    cm.scrollDOM.scrollTop =
                        currentScrollTop + (coords.top - editorTop) - 16;
                }
            }
        }, 100);
        return { foundWordName1: foundWordName, targetLine1: targetLine };
    }
}
export const jumpToWord = async function (
    this: WordManagerView,
    wordId: string,
): Promise<void> {
    try {
        jumpToSpecifiedLocation.call(
            this,
            wordId,
            (lines: string | any[], text: any) => {
                // 查找包含指定ID的行
                let targetLine = -1;
                let foundWordName = '';
                for (let i = 0; i < lines.length; i++) {
                    if (
                        // text 表示 wordId
                        lines[i].includes(`"id":"${text}"`) || // 新格式
                        lines[i].includes(`ID: ${text}`) || // 旧格式
                        lines[i].includes(`id: ${text}`) // 旧格式小写
                    ) {
                        // 找到单词标题行（通常在ID行前面几行）
                        for (let j = i; j >= Math.max(0, i - 10); j--) {
                            if (lines[j].startsWith('#')) {
                                targetLine = j;
                                foundWordName = lines[j]
                                    .replace(/^#+\s*/, '')
                                    .trim();
                                break;
                            }
                        }
                        break;
                    }
                }
                return { targetLine, foundWordName };
            },
            (foundWordName, targetLine) => {
                new Notice(
                    ` 已跳转到单词 "${foundWordName}" (行 ${targetLine + 1})`,
                );
            },
            (text) => {
                new Notice(` 在 words.md 中未找到ID为 ${text} 的单词`);
            },
        );
    } catch (error) {
        console.error(' 跳转失败:', error);
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        new Notice(` 跳转到markdown失败: ${errorMessage}`);
    }
};

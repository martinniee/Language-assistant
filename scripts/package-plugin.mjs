import { deflateRawSync } from 'node:zlib';
import {
    copyFile,
    mkdir,
    readFile,
    rm,
    writeFile,
} from 'node:fs/promises';
import path from 'node:path';

const CORE_FILES = ['main.js', 'manifest.json', 'data.json', 'styles.css'];
const RELEASE_DIR = 'release';

/**
 * 生成 CRC32 查找表，用于写入 zip 文件校验值。
 */
function createCrcTable() {
    const table = new Uint32Array(256);

    for (let index = 0; index < 256; index += 1) {
        let value = index;

        for (let bit = 0; bit < 8; bit += 1) {
            value =
                value & 1
                    ? 0xedb88320 ^ (value >>> 1)
                    : value >>> 1;
        }

        table[index] = value >>> 0;
    }

    return table;
}

const CRC_TABLE = createCrcTable();

/**
 * 计算文件内容的 CRC32 值，供 zip 中央目录校验使用。
 */
function crc32(buffer) {
    let crc = 0xffffffff;

    for (const byte of buffer) {
        crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }

    return (crc ^ 0xffffffff) >>> 0;
}

/**
 * 将当前时间转换为 zip 规范使用的 DOS 日期和时间。
 */
function getDosDateTime(date) {
    const year = Math.max(date.getFullYear(), 1980);
    const dosTime =
        (date.getHours() << 11) |
        (date.getMinutes() << 5) |
        Math.floor(date.getSeconds() / 2);
    const dosDate =
        ((year - 1980) << 9) |
        ((date.getMonth() + 1) << 5) |
        date.getDate();

    return { dosDate, dosTime };
}

/**
 * 使用 Node.js 标准库创建 zip，避免额外引入打包依赖。
 */
async function createZip(zipPath, filePaths) {
    const chunks = [];
    const centralDirectory = [];
    let offset = 0;
    const { dosDate, dosTime } = getDosDateTime(new Date());

    for (const filePath of filePaths) {
        const sourceBuffer = await readFile(filePath);
        const compressedBuffer = deflateRawSync(sourceBuffer);
        const fileNameBuffer = Buffer.from(path.basename(filePath), 'utf8');
        const checksum = crc32(sourceBuffer);
        const localHeader = Buffer.alloc(30);

        localHeader.writeUInt32LE(0x04034b50, 0);
        localHeader.writeUInt16LE(20, 4);
        localHeader.writeUInt16LE(0x0800, 6);
        localHeader.writeUInt16LE(8, 8);
        localHeader.writeUInt16LE(dosTime, 10);
        localHeader.writeUInt16LE(dosDate, 12);
        localHeader.writeUInt32LE(checksum, 14);
        localHeader.writeUInt32LE(compressedBuffer.length, 18);
        localHeader.writeUInt32LE(sourceBuffer.length, 22);
        localHeader.writeUInt16LE(fileNameBuffer.length, 26);
        localHeader.writeUInt16LE(0, 28);

        chunks.push(localHeader, fileNameBuffer, compressedBuffer);

        const centralHeader = Buffer.alloc(46);
        centralHeader.writeUInt32LE(0x02014b50, 0);
        centralHeader.writeUInt16LE(20, 4);
        centralHeader.writeUInt16LE(20, 6);
        centralHeader.writeUInt16LE(0x0800, 8);
        centralHeader.writeUInt16LE(8, 10);
        centralHeader.writeUInt16LE(dosTime, 12);
        centralHeader.writeUInt16LE(dosDate, 14);
        centralHeader.writeUInt32LE(checksum, 16);
        centralHeader.writeUInt32LE(compressedBuffer.length, 20);
        centralHeader.writeUInt32LE(sourceBuffer.length, 24);
        centralHeader.writeUInt16LE(fileNameBuffer.length, 28);
        centralHeader.writeUInt16LE(0, 30);
        centralHeader.writeUInt16LE(0, 32);
        centralHeader.writeUInt16LE(0, 34);
        centralHeader.writeUInt16LE(0, 36);
        centralHeader.writeUInt32LE(0, 38);
        centralHeader.writeUInt32LE(offset, 42);

        centralDirectory.push(centralHeader, fileNameBuffer);
        offset += localHeader.length + fileNameBuffer.length + compressedBuffer.length;
    }

    const centralDirectorySize = centralDirectory.reduce(
        (size, chunk) => size + chunk.length,
        0,
    );
    const endRecord = Buffer.alloc(22);

    endRecord.writeUInt32LE(0x06054b50, 0);
    endRecord.writeUInt16LE(0, 4);
    endRecord.writeUInt16LE(0, 6);
    endRecord.writeUInt16LE(filePaths.length, 8);
    endRecord.writeUInt16LE(filePaths.length, 10);
    endRecord.writeUInt32LE(centralDirectorySize, 12);
    endRecord.writeUInt32LE(offset, 16);
    endRecord.writeUInt16LE(0, 20);

    await writeFile(zipPath, Buffer.concat([...chunks, ...centralDirectory, endRecord]));
}

/**
 * 读取插件清单并生成稳定的发布目录名和压缩包名。
 */
async function getReleaseInfo() {
    const manifest = JSON.parse(await readFile('manifest.json', 'utf8'));
    const id = manifest.id || 'language-assistant';
    const version = manifest.version || '0.0.0';

    return {
        folderName: id,
        zipName: `${id}-${version}.zip`,
    };
}

/**
 * 创建只包含核心插件文件的发布目录，并同步生成 zip 压缩包。
 */
async function packagePlugin() {
    const { folderName, zipName } = await getReleaseInfo();
    const releaseRoot = path.resolve(RELEASE_DIR);
    const packageDir = path.join(releaseRoot, folderName);
    const zipPath = path.join(releaseRoot, zipName);

    await mkdir(releaseRoot, { recursive: true });
    await rm(packageDir, { recursive: true, force: true });
    await rm(zipPath, { force: true });
    await mkdir(packageDir, { recursive: true });

    for (const file of CORE_FILES) {
        await copyFile(file, path.join(packageDir, file));
    }

    await createZip(
        zipPath,
        CORE_FILES.map((file) => path.join(packageDir, file)),
    );

    console.log(`Created ${packageDir}`);
    console.log(`Created ${zipPath}`);
}

try {
    await packagePlugin();
} catch (error) {
    console.error('插件发布包创建失败:', error);
    process.exitCode = 1;
}

#!/usr/bin/env bash
set -euo pipefail

SOURCE_PLUGIN_DIR_WINDOWS='D:\Projects\obsidian-plugin-dev-space\my-plugin-development\.obsidian\plugins\Language-assistant'
TARGET_PLUGIN_DIR_WINDOWS='D:\Documents\Obsidian-vault-space\vault-main\.obsidian\plugins\language-assistant-plugin'

CORE_FILES=(
    main.js
    manifest.json
    styles.css
)

to_shell_path() {
    local raw_path="$1"

    if command -v cygpath >/dev/null 2>&1; then
        cygpath -u "$raw_path"
        return
    fi

    if command -v wslpath >/dev/null 2>&1; then
        wslpath -u "$raw_path"
        return
    fi

    printf '%s\n' "$raw_path"
}

fail() {
    printf 'ERROR: %s\n' "$1" >&2
    exit 1
}

SOURCE_PLUGIN_DIR="${SOURCE_PLUGIN_DIR:-$(to_shell_path "$SOURCE_PLUGIN_DIR_WINDOWS")}"
TARGET_PLUGIN_DIR="${TARGET_PLUGIN_DIR:-$(to_shell_path "$TARGET_PLUGIN_DIR_WINDOWS")}"

[ -d "$SOURCE_PLUGIN_DIR" ] || fail "Source plugin directory not found: $SOURCE_PLUGIN_DIR"
[ -d "$TARGET_PLUGIN_DIR" ] || fail "Target plugin directory not found: $TARGET_PLUGIN_DIR"

for file_name in "${CORE_FILES[@]}"; do
    [ -f "$SOURCE_PLUGIN_DIR/$file_name" ] || fail "Source file not found: $SOURCE_PLUGIN_DIR/$file_name"
done

printf 'Copying core plugin files...\n'
printf 'From: %s\n' "$SOURCE_PLUGIN_DIR"
printf 'To:   %s\n' "$TARGET_PLUGIN_DIR"

for file_name in "${CORE_FILES[@]}"; do
    cp -f "$SOURCE_PLUGIN_DIR/$file_name" "$TARGET_PLUGIN_DIR/$file_name"
    printf 'Copied: %s\n' "$file_name"
done

printf 'Done.\n'

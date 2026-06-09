import esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['src/obsidian-plugin.ts'],
    bundle: true,
    outfile: 'main.js',
    platform: 'browser',
    format: 'cjs',
    target: 'es2020',
    external: ['obsidian'],
    define: {
        'process.env.NODE_ENV': '"production"',
    },
});

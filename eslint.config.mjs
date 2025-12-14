// @ts-check
import { auto, vitest } from '@beuluis/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
    auto,
    {
        extends: vitest,
        files: [
            '**/*.?(component-){spec,test}.{ts,tsx}',
            '**/{__mocks__,__tests__}/**/*.{ts,tsx}',
            '**/vitest.config.ts',
        ],
    },
    {
        rules: {
            'canonical/filename-match-regex': 'off',
            'no-console': 'off',
            'react/forbid-component-props': 'off',
        },
    },
    globalIgnores(['dist', 'node_modules', 'src/routeTree.gen.ts', 'src/paraglide']),
);

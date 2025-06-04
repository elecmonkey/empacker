import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'dist-tsc/',
        'lib/',
        'test/',
        '**/*.test.ts',
        '**/*.spec.ts',
        'vitest.config.ts',
        'empacker.config.ts',
        'example/'
      ]
    }
  }
}); 
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["tests/**/*.test.ts"],
        globalSetup: ["tests/globalSetup.ts"],
        setupFiles: ["tests/setup.ts"],
        // All test files share one in-memory database
        fileParallelism: false,
        testTimeout: 20000,
        hookTimeout: 60000,
    },
});

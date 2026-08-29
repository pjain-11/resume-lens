import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // `server-only` throws unless resolved under the "react-server" condition,
      // which vitest doesn't set. Point it at the package's own empty module.
      "server-only": fileURLToPath(
        new URL("./node_modules/server-only/empty.js", import.meta.url),
      ),
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: [
      "lib/**/*.test.ts",
      "test/**/*.test.ts",
      "types/**/*.test.ts",
    ],
  },
});

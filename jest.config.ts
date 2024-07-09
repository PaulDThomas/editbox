import type { Config } from "jest";

const config: Config = {
  // The root of your source code, typically /src
  // `<rootDir>` is a token Jest substitutes
  roots: ["<rootDir>"],
  modulePaths: ["<rootDir>/src"],
  testEnvironment: "jsdom",
  verbose: true,

  // Jest transformations -- this adds support for TypeScript
  // using ts-jest
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        diagnostics: {
          ignoreCodes: [1343],
        },
        astTransformers: {
          before: [
            {
              path: "ts-jest-mock-import-meta",
              options: { metaObjectReplacement: { url: "https://localhost" } },
            },
          ],
        },
      },
    ],
  },
  // Module file extensions for importing
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],

  // Runs special logic, such as cleaning up components
  // when using React Testing Library and adds special
  // extended assertions to Jest
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  // Test spec file resolution pattern
  // Matches parent folder `__tests__` and filename
  // should contain `test` or `spec`.
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",

  // Code coverage
  collectCoverage: false,
  coverageProvider: "babel",
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "src/**/*.{ts,tsx}",
    "!**/index.ts",
    "!**/interface.ts",
    "!**/main.ts",
    "!**/__dummy__/**",
  ],
  moduleNameMapper: {
    "\\.(css|less|scss)$": "<rootDir>/__dummy__/styleMock.ts",
  },
  // Plugin for watch patterns
  watchPlugins: ["jest-watch-typeahead/filename", "jest-watch-typeahead/testname"],
};

export default config;

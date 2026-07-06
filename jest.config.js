/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          moduleResolution: "node",
          module: "commonjs",
          esModuleInterop: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
  },
  testMatch: ["**/__tests__/**/*.test.(ts|tsx)", "**/*.test.(ts|tsx)"],
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "src/middleware.ts",
    "src/components/**/*.tsx",
    "store/**/*.ts",
  ],
};

module.exports = config;

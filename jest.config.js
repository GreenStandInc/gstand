/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: "ts-jest/presets/default-esm",
  moduleNameMapper: {
    "#/(.*)": ["<rootDir>/src/$1"],
    "##/(.*)": ["<rootDir>/client/$1"],
  },
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", { useESM: true }],
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    }
  }
};

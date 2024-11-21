/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  moduleNameMapper: {
    "#/(.*)": ["<rootDir>/src/$1"],
    "##/(.*)": ["<rootDir>/client/$1"],
  },
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
};

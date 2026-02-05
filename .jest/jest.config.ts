import type { Config } from 'jest';
import { pathsToModuleNameMapper } from "ts-jest";
import aliases from "./../tsconfig.aliases.json";

const config: Config = {
  rootDir: '..',
  testEnvironment: 'jsdom', // Use 'node' if not testing DOM.
  testMatch: [
    '<rootDir>/public/**/tests/react/**/*.{ts,tsx}',
  ],
  moduleNameMapper: pathsToModuleNameMapper(
    aliases.compilerOptions.paths,
    { prefix: "<rootDir>/" }
  ),
  // We can use the following config if we want jest to run on both node and jsdom.
  // Or, just change the value of the testEnvironment for type of test.
  // projects: [
  //   {
  //     displayName: 'dom',
  //     testEnvironment: 'jsdom',
  //     testMatch: [
  //       '<rootDir>/public/**/tests/react/**/*.{ts,tsx}'
  //     ],
  //   },
  //   {
  //     displayName: 'node',
  //     testEnvironment: 'node',
  //     testMatch: [
  //       '<rootDir>/public/**/tests/node/**/*.{ts,tsx}'
  //     ],
  //   },
  // ],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/.jest/tsconfig.jest.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFilesAfterEnv: ['<rootDir>/.jest/jest.setup.ts'],
  clearMocks: true,
};

export default config;

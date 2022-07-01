module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@aelf-react/(.*)$': '<rootDir>/packages/$1/src',
  },
}

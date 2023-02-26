module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  testMatch: ['**/tests/**/*test*.js'],
  collectCoverageFrom: ['**/*.js', '!**/node_modules/**', '!**/tests/**'],
};
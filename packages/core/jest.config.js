module.exports = {
  transform: {
    '^.+\\.ts?$': ['ts-jest', { diagnostics: false }]
  },
  testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
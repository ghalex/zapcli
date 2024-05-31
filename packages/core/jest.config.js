/** @type {import('ts-jest').JestConfigWithTsJest} */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};
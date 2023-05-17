import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import genDiff from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

test('genDiff stylish', () => {
  const filePath1 = getFixturePath('file1.yml');
  const filePath2 = getFixturePath('file2.yml');
  const fileResult = readFile('result_stylish_file.txt');

  expect(genDiff(filePath1, filePath2)).toMatch(fileResult);
});

test('genDiff plain', () => {
  const filePath1 = getFixturePath('file1.yml');
  const filePath2 = getFixturePath('file2.yml');
  const fileResult = readFile('result_plain_file.txt');

  expect(genDiff(filePath1, filePath2, 'plain')).toMatch(fileResult);
});

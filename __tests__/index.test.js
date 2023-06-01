import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import genDiff from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

const formats = ['yml', 'json'];

const stylishResult = readFile('result_stylish_file.txt');
const plainResult = readFile('result_plain_file.txt');
const jsonResult = readFile('result_file.json');

test.each(formats)('gendiff', (format) => {
  const filePath1 = getFixturePath(`file1.${format}`);
  const filePath2 = getFixturePath(`file2.${format}`);

  expect(genDiff(filePath1, filePath2)).toEqual(stylishResult);
  expect(genDiff(filePath1, filePath2, 'plain')).toEqual(plainResult);
  expect(genDiff(filePath1, filePath2, 'json')).toEqual(jsonResult);
});

import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import parser from './parsers.js';
import getFormatter from './formatters/index.js';

const getFullPath = (filepath) => path.resolve(process.cwd(), filepath);

const getFileExt = (filepath) => filepath.split('.').at(-1);

const generateDiff = (obj1, obj2) => {
  const mergedKeys = _.union(Object.keys(obj1), Object.keys(obj2));
  const sortedKeys = _.sortBy(mergedKeys);

  return sortedKeys.map((key) => {
    if (obj1[key] === obj2[key]) {
      return { key, value: obj1[key], type: 'unchanged' };
    }
    if (_.has(obj1, key) && !_.has(obj2, key)) {
      return { key, value: obj1[key], type: 'deleted' };
    }
    if (!_.has(obj1, key) && _.has(obj2, key)) {
      return { key, value: obj2[key], type: 'added' };
    }
    if (_.isPlainObject(obj1[key]) && _.isPlainObject(obj2[key])) {
      return { key, children: generateDiff(obj1[key], obj2[key]), type: 'nested' };
    }

    return {
      key, value1: obj1[key], value2: obj2[key], type: 'changed',
    };
  });
};

export default (path1, path2, formatName = 'stylish') => {
  const filepath1 = getFullPath(path1);
  const filepath2 = getFullPath(path2);
  const file1 = fs.readFileSync(filepath1, 'utf-8');
  const file2 = fs.readFileSync(filepath2, 'utf-8');

  const data1 = parser[getFileExt(filepath1)](file1);
  const data2 = parser[getFileExt(filepath1)](file2);

  const diffData = generateDiff(data1, data2);
  const formatter = getFormatter(formatName);

  return formatter(diffData);
};

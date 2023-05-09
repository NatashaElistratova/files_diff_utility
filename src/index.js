import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import parser from './parsers.js';

const getFullPath = (filepath) => path.resolve(process.cwd(), filepath);

const getFileExt = (filepath) => filepath.split('.').at(-1);

const getIndent = (isRoot = true, spaceCount = 4) => ' '.repeat(isRoot ? spaceCount : spaceCount - 2);

const plainFormatter = {
  added: (node, isRoot, spaceCount) => `${getIndent(isRoot, spaceCount)}+ ${node.key}: ${node.value}\n`,
  deleted: (node, isRoot, spaceCount) => `${getIndent(isRoot, spaceCount)}- ${node.key}: ${node.value}\n`,
  notChanged: (node, isRoot, spaceCount) => `${getIndent(isRoot, spaceCount)}  ${node.key}: ${node.value}\n`,
  changed: (node, isRoot, spaceCount) => `${getIndent(isRoot, spaceCount)}- ${node.key}: ${node.value1}\n${getIndent(isRoot, spaceCount)}+ ${node.key}: ${node.value2}\n`,
  nested: (node, isRoot, spaceCount) => `${getIndent(isRoot, spaceCount)}  ${node.key}:  {\n${getIndent(spaceCount)}  ${node.value}\n${getIndent(spaceCount)}  }\n`
};

const generateTree = (obj1, obj2) => {
  const mergedKeys = _.union(Object.keys(obj1), Object.keys(obj2));
  const sortedKeys = _.sortBy(mergedKeys);

  return sortedKeys.map((key) => {
    if (obj1[key] === obj2[key]) {
      return { key, value: obj1[key], type: 'notChanged' };
    }
    if (_.has(obj1, key) && !_.has(obj2, key)) {
      return { key, value: obj1[key], type: 'deleted' };
    }
    if (!_.has(obj1, key) && _.has(obj2, key)) {
      return { key, value: obj2[key], type: 'added' };
    }
    if (_.isPlainObject(obj1[key]) && _.isPlainObject(obj2[key])) {
        const diffData = generateTree(obj1[key], obj2[key])
        return { key, value: format(diffData, plainFormatter, false), type: 'nested' };
    }

    return {
        key, value1: obj1[key], value2: obj2[key], type: 'changed',
    };
  });
};

const format = (tree, formatter, isRoot) => {
    const result = tree.reduce((acc, node) => {
        return acc + formatter[node.type](node, isRoot, 2)
    }, `${isRoot ? `{\n` : ''}`)

    return `${result}}`
}


export default (path1, path2) => {
  const filepath1 = getFullPath(path1);
  const filepath2 = getFullPath(path2);
  const file1 = fs.readFileSync(filepath1, 'utf-8');
  const file2 = fs.readFileSync(filepath2, 'utf-8');

  const data1 = parser[getFileExt(filepath1)](file1);
  const data2 = parser[getFileExt(filepath1)](file2);

  const diffData = generateTree(data1, data2);

  return format(diffData, plainFormatter, true);
};

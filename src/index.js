import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import parser from './parsers.js';

const getFullPath = (filepath) => path.resolve(process.cwd(), filepath);

const getFileExt = (filepath) => filepath.split('.').at(-1);

const indent = (depth, spaceCount = 4) => ' '.repeat(depth * spaceCount - 2);

const format = (tree, formatter, depth) => {
  const result = tree.map((node) => `${formatter[node.type](node, depth, formatter)}\n`);

  return `{\n${result.join('')}}`;
};

const plainFormatter = {
  added: (node, depth) => `${indent(depth)}+ ${node.key}: ${node.value}`,
  deleted: (node, depth) => `${indent(depth)}- ${node.key}: ${node.value}`,
  notChanged: (node, depth) => `${indent(depth)}  ${node.key}: ${node.value}`,
  changed: (node, depth) => `${indent(depth)}- ${node.key}: ${node.value1}\n${indent(depth)}+ ${node.key}: ${node.value2}`,
  nested: (node, depth, formatter) => `${indent(depth)}  ${node.key}: {\n${indent(depth + 1)}${format(node.children, formatter, depth + 1)}\n${indent(depth)}}`,
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
      return { key, children: generateTree(obj1[key], obj2[key]), type: 'nested' };
    }

    return {
      key, value1: obj1[key], value2: obj2[key], type: 'changed',
    };
  });
};

export default (path1, path2) => {
  const filepath1 = getFullPath(path1);
  const filepath2 = getFullPath(path2);
  const file1 = fs.readFileSync(filepath1, 'utf-8');
  const file2 = fs.readFileSync(filepath2, 'utf-8');

  const data1 = parser[getFileExt(filepath1)](file1);
  const data2 = parser[getFileExt(filepath1)](file2);

  const diffData = generateTree(data1, data2);

  return format(diffData, plainFormatter, 1);
};

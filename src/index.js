import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import parser from './parsers.js';

const getFullPath = (filepath) => path.resolve(process.cwd(), filepath);

const getFileExt = (filepath) => filepath.split('.').at(-1);

const indent = (depth, spaceCount = 4) => ' '.repeat(depth * spaceCount - 2);

const format = (tree, formatter, depth) => {
  const result = tree.map((node) => formatter[node.type](node, depth, formatter));

  return `{\n${result.join('')}`;
};

const stringify = (data, depth) => {
  if (!_.isPlainObject(data)) {
    return `${String(data)}\n`;
  }

  const result = Object.entries(data)
    .map(([key, value]) => stylishFormatter.unchanged({ key, value }, depth));

  return `{\n${result.join('')}${indent(depth - 1)}  }\n`;
};

const stylishFormatter = {
  added: (node, depth) => `${indent(depth)}+ ${node.key}: ${stringify(node.value, depth + 1)}`,
  deleted: (node, depth) => `${indent(depth)}- ${node.key}: ${stringify(node.value, depth + 1)}`,
  unchanged: (node, depth) => `${indent(depth)}  ${node.key}: ${stringify(node.value, depth + 1)}`,
  changed: (node, depth) => {
    const data1 = `${indent(depth)}- ${node.key}: ${stringify(node.value1, depth + 1)}`;
    const data2 = `${indent(depth)}+ ${node.key}: ${stringify(node.value2, depth + 1)}`;

    return `${data1}${data2}`;
  },
  nested: (node, depth, formatter) => {
    const value = format(node.children, formatter, depth + 1);

    return `${indent(depth)}  ${node.key}: ${value}${indent(depth)}  }\n`;
  },
};

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

export default (path1, path2) => {
  const filepath1 = getFullPath(path1);
  const filepath2 = getFullPath(path2);
  const file1 = fs.readFileSync(filepath1, 'utf-8');
  const file2 = fs.readFileSync(filepath2, 'utf-8');

  const data1 = parser[getFileExt(filepath1)](file1);
  const data2 = parser[getFileExt(filepath1)](file2);

  const diffData = generateDiff(data1, data2);

  return format(diffData, stylishFormatter, 1);
};

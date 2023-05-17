import _ from 'lodash';

const indent = (depth, spaceCount = 4) => ' '.repeat(depth * spaceCount - 2);

const stringify = (data, depth) => {
  if (!_.isPlainObject(data)) {
    return `${String(data)}\n`;
  }

  const result = Object.entries(data)
    .map(([key, value]) => stylishFormatter.unchanged({ key, value }, depth));

  return `{\n${result.join('')}${indent(depth - 1)}  }\n`;
};

const format = (diffData, depth, isRoot = false) => {
  const result = diffData.map((node) => stylishFormatter[node.type](node, depth));

  return `{\n${result.join('')}${isRoot ? '}' : ''}`;
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
  nested: (node, depth) => {
    const value = format(node.children, depth + 1);

    return `${indent(depth)}  ${node.key}: ${value}${indent(depth)}  }\n`;
  },
};

export default (diffData) => format(diffData, 1, true);

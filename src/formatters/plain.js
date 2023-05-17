import _ from 'lodash';

const format = (data) => {
  const result = data.map((node) => {
    if (node.type === 'unchanged') return;
    if (node.type !== 'nested') {
      const keyName = `${String(data.key)}`;
      return plainFormatter[node.type](node, keyName);
    }
    const keys = [];
    keys.push(node.key);
    return plainFormatter[node.type](node, keys.join('.'));
  });

  return result.join('');
};

const plainFormatter = {
  added: (node, keyName) => `Property '${node.key}' was added\n`,
  deleted: (node, keyName) => `Property '${node.key}' was removed\n`,
//   unchanged: (node, keyName) => `Property '${keyName}' was removed`,
  changed: (node, keyName) => `Property '${node.key}' was updated\n`,
  nested: (node) => format(node.children),
};

export default (tree) => format(tree);

const format = (diffData, parentKeyName = '') => diffData.map((node) => {
  if (node.type === 'unchanged') return;
  const keyName = parentKeyName ? `${parentKeyName}.${node.key}` : node.key;

  return plainFormatter[node.type](node, keyName);
}).join('');

const plainFormatter = {
  added: (node, keyName) => `Property '${keyName}' was added\n`,
  deleted: (node, keyName) => `Property '${keyName}' was removed\n`,
  changed: (node, keyName) => `Property '${keyName}' was updated\n`,
  nested: (node, parentKeyName) => format(node.children, parentKeyName),
};

export default (diffData) => format(diffData);

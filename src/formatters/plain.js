const formatValue = (value) => {
  switch (typeof value) {
    case 'object':
      return value === null ? null : '[complex value]';
    case 'string':
      return `'${value}'`;
    default:
      return value;
  }
};

const format = (diffData, parentKeyName = '') => {
  const result = diffData.map((node) => {
    if (node.type === 'unchanged') return;
    const keyName = parentKeyName ? `${parentKeyName}.${node.key}` : node.key;

    return plainFormatter[node.type](node, keyName);
  });

  return result.join('');
};

const plainFormatter = {
  added: (node, keyName) => `Property '${keyName}' was added with value: ${formatValue(node.value)}\n`,
  deleted: (node, keyName) => `Property '${keyName}' was removed\n`,
  changed: (node, keyName) => {
    const value1 = formatValue(node.value1);
    const value2 = formatValue(node.value2);

    return `Property '${keyName}' was updated. From ${value1} to ${value2}\n`;
  },
  nested: (node, parentKeyName) => format(node.children, parentKeyName),
};

export default (diffData) => format(diffData);

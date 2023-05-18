import _ from 'lodash';
import stylish from './stylish.js';
import plain from './plain.js';

const formatters = { stylish, plain };

export default (formatterName) => {
  if (!_.has(formatters, formatterName)) {
    throw new Error(`Unknown formatter: ${formatterName}`);
  }
  return formatters[formatterName];
};

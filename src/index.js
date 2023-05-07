import fs from 'fs';
import path from 'path';
import _ from 'lodash';

const getFullPath = (filepath) => path.resolve(process.cwd(), filepath)

const getFileExt = (filepath) => filepath.split('.').at(-1)

const getData = (file, ext) => {
    if (ext === 'json') {
        return JSON.parse(file)
    }
}

const plainFormatter = {
    added: (node) => `+ ${node.key}: ${node.value}\n`,
    deleted: (node) => `- ${node.key}: ${node.value}\n`,
    notChanged: (node) => `  ${node.key}: ${node.value}\n`,
    changed: (node) => `- ${node.key}: ${node.value1}\n+ ${node.key}: ${node.value2}\n`
}

const generateTree = (obj1, obj2) => {
    const mergedKeys = _.union(Object.keys(obj1), Object.keys(obj2))
    const sortedKeys = _.sortBy(mergedKeys)

    return sortedKeys.map(key => {
        if(obj1[key] === obj2[key]) {
           return { key, value: obj1[key], type: 'notChanged' } 
        } else if (_.has(obj1, key) && !_.has(obj2, key)) {
            return { key, value: obj1[key], type: 'deleted' }
        } else if (!_.has(obj1, key) && _.has(obj2, key)) {
            return { key, value: obj2[key], type: 'added' }
        } else if (_.has(obj1, key) && _.has(obj2, key)) {
            return { key, value1: obj1[key], value2: obj2[key], type: 'changed' }
        }
    })
}

const format = (tree, formatter) => {
    return tree.reduce((acc, node) => acc + formatter[node.type](node), '');
}

export default (path1, path2) => {
    const filepath1 = getFullPath(path1)
    const filepath2 = getFullPath(path2)
    const file1 = fs.readFileSync(filepath1, 'utf-8')
    const file2 = fs.readFileSync(filepath2, 'utf-8')

    const data1 = getData(file1, getFileExt(filepath1))
    const data2 = getData(file2, getFileExt(filepath2))

    const diffData = generateTree(data1, data2)

    return format(diffData, plainFormatter)
}
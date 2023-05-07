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

const generateTree = (obj1, obj2) => {
    const mergedKeys = _.union(Object.keys(obj1), Object.keys(obj2))
    const sortedKeys = _.sortBy(mergedKeys)
    return sortedKeys.map(key => {
        if(obj1[key] === obj2[key]) {
           return { key: obj1[key], type: 'not changed' } 
        } else if (obj1[key] && !obj2[key]) {
            return { key: obj1[key], type: 'deleted' }
        } else if (!obj1[key] && obj2[key]) {
            return { key: obj2[key], type: 'added' }
        } else if (obj1[key] && obj2[key]) {
            return { key: obj1[key], key: obj2[key], type: 'changed' }
        }
    })
}

const formatTree = (tree) => {

}

export default (path1, path2) => {
    const filepath1 = getFullPath(path1)
    const filepath2 = getFullPath(path2)
    const file1 = fs.readFileSync(filepath1, 'utf-8')
    const file2 = fs.readFileSync(filepath2, 'utf-8')

    const data1 = getData(file1, getFileExt(filepath1))
    const data2 = getData(file2, getFileExt(filepath2))

    const diffTree = generateTree(data1, data2)
    const formatedTree = formatTree(diffTree)

    console.log(diffTree)
}
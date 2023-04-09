import fs from 'fs';
import path from 'path';
import _ from 'lodash'; 

export default (path1, path2) => {
    console.log('path1 - ', path.resolve(path1))
    console.log('path2 - ', path.resolve(path2))

    console.log(_.isPlainObject({x: 1, y: {d: 2}}) )
}
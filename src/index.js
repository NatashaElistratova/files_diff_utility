import fs from 'fs';
import path from 'path';

export default (path1, path2, format) => {
    console.log('path - ', path.resolve(path1))
    console.log('format - ', format)
}
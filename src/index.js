import axios from 'axios';
import os from 'os';
import { promises as fs } from 'fs';
import url from 'url';

export default (pathToFolder = os.tmpdir, address) => {
  const addUrl = url.parse(address);
  const fileName = `${addUrl.host}${addUrl.path}`.replace(/\W/g, '-');
  const fullPath = `${pathToFolder}/${fileName}.html`;
  return axios.get(address)
    .then(res => fs.writeFile(fullPath, res.data));
};

import nock from 'nock';
import axios from 'axios';
import os from 'os';
import { promises as fs } from 'fs';
import url from 'url';

export default (pathToFile = os.tmpdir, address) => {
  const addUrl = url.parse(address);
  const fileName = `${addUrl.host.replace(/\./g, '-')}${addUrl.path.replace(/\//g, '-')}`;
  const fullPath = `${pathToFile}/${fileName}`;
  axios.get(address)
    .then(res => fs.writeFile(fullPath, res.data));
};

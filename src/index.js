import axios from 'axios';
import os from 'os';
import { promises as fs } from 'fs';
import url from 'url';
import cheerio from 'cheerio';
import debug from 'debug';

const log = debug('page-loader');

const tags = {
  link: 'href',
  script: 'src',
  img: 'src',
};

export const makeFileName = (address) => {
  const addUrl = url.parse(address);
  return `${addUrl.host}${addUrl.path}`.replace(/\W/g, '-');
};

export const makeFolderName = (address) => {
  const addUrl = url.parse(address);
  return `${addUrl.host}${addUrl.path}_files`.replace(/\W/g, '-');
};

const getResources = (html, address) => {
  let links = [];
  const $ = cheerio.load(html);
  Object.keys(tags).forEach((el) => {
    $(el).each((i, e) => {
      if ($(e).attr(tags[el]) && url.parse($(e).attr(tags[el])).protocol === null) {
        links = [...links, `${address}${$(e).attr(tags[el])}`];
      }
    });
  });
  return links;
};

const changeHtml = (html, address) => {
  const $ = cheerio.load(html);
  Object.keys(tags).forEach((el) => {
    $(el).each((i, e) => {
      if ($(e).attr(tags[el]) && url.parse($(e).attr(tags[el])).protocol === null) {
        const newFileName = $(e).attr(tags[el]).split(/\W/g).filter(elem => elem)
          .join('-');
        const source = `${makeFolderName(address)}/${newFileName}`;
        $(e).attr(tags[el], source);
      }
    });
  });
  return $.html();
};

export default (pathToFolder = os.tmpdir, address) => {
  const fileName = makeFileName(address);
  const fullPath = `${pathToFolder}/${fileName}.html`;
  let links;
  return axios.get(address)
    .then((res) => {
      log('getting html');
      return fs.writeFile(fullPath, res.data);
    })
    .then(() => {
      log('making directory');
      return fs.mkdir(`${pathToFolder}/${makeFolderName(address)}`);
    })
    .then(() => fs.readFile(fullPath, 'utf-8'))
    .then(data => getResources(data, `${url.parse(address).protocol}//${url.parse(address).host}`))
    .then((list) => {
      const promises = list.map(e => axios.get(e));
      links = list;
      return Promise.all(promises);
    })
    .then((res) => {
      log('creating resourses\' files');
      return res.map((e, i) => fs.writeFile(`${pathToFolder}/${makeFolderName(address)}/${url.parse(links[i]).path
        .replace(/\W/g, '-').slice(1)}`, e.data));
    })
    .then(() => fs.readFile(fullPath, 'utf-8'))
    .then((data) => {
      log('changing links in html');
      return fs.writeFile(fullPath, changeHtml(data, address));
    });
};
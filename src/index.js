import axios from 'axios';
import os from 'os';
import { promises as fs } from 'fs';
import url from 'url';
import cheerio from 'cheerio';

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
  return axios.get(address)
    .then(res => fs.writeFile(fullPath, res.data))
    .then(() => fs.mkdir(`${pathToFolder}/${makeFolderName(address)}`))
    .then(() => fs.readFile(fullPath, 'utf-8'))
    .then(data => getResources(data, `${url.parse(address).protocol}//${url.parse(address).host}`))
    .then((links) => {
      const promises = links.map(e => [e, axios.get(e)]);
      return Promise.all(promises);
    })
    .then(res => res.map(e => fs.writeFile(`${pathToFolder}/${makeFolderName(address)}/${url.parse(e[0]).path
      .replace(/\W/g, '-').slice(1)}`, e[1].data)))
    .then(() => fs.readFile(fullPath, 'utf-8'))
    .then(data => fs.writeFile(fullPath, changeHtml(data, address)));
};

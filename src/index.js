import axios from 'axios';
import os from 'os';
import { promises as fs } from 'fs';
import url from 'url';
import cheerio from 'cheerio';
import debug from 'debug';
import Listr from 'listr';

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

const getResourses = (html, resourseAddress, pathToFolder, address) => {
  let links = [];
  const $ = cheerio.load(html);
  Object.keys(tags).forEach((el) => {
    $(el).each((i, e) => {
      const attributes = $(e).attr(tags[el]);
      if (attributes && !url.parse(attributes).protocol) {
        links = [...links, `${resourseAddress}${$(e).attr(tags[el])}`];
      }
    });
  });
  const tasks = new Listr(links.map(el => ({
    title: `downloading ${el}`,
    task: () => axios.get(el)
      .then(res => fs.writeFile(`${pathToFolder}/${makeFolderName(address)}/${url.parse(el).path
        .replace(/\W/g, '-').slice(1)}`, res.data)),
  })));
  return tasks.run();
};

const changeHtml = (html, address) => {
  const $ = cheerio.load(html);
  Object.keys(tags).forEach((el) => {
    $(el).each((i, e) => {
      const attributes = $(e).attr(tags[el]);
      if (attributes && !url.parse(attributes).protocol) {
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
  let html = '';
  const fileName = makeFileName(address);
  const fullPath = `${pathToFolder}/${fileName}.html`;
  return axios.get(address)
    .then((res) => {
      log(`html from ${address} is written in ${fullPath}`);
      return fs.writeFile(fullPath, res.data);
    })
    .then(() => {
      log(`new directory ${pathToFolder}/${makeFolderName(address)} has been created`);
      return fs.mkdir(`${pathToFolder}/${makeFolderName(address)}`);
    })
    .then(() => fs.readFile(fullPath, 'utf-8'))
    .then((data) => {
      html = data;
      return getResourses(data, `${url.parse(address).protocol}//${url.parse(address).host}`, pathToFolder, address);
    })
    .then(() => {
      log('changing links in html');
      return fs.writeFile(fullPath, changeHtml(html, address));
    });
};

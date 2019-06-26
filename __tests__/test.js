import nock from 'nock';
import axios from 'axios';
import { promises as fs } from 'fs';
import httpAdapter from 'axios/lib/adapters/http';
import path from 'path';
import os from 'os';
import load, { makeFolderName } from '../src';

axios.defaults.adapter = httpAdapter;

const expected = '<!DOCTYPE html><html><head></head><body></body></html>';
let tmpDir;

nock('https://hexlet.io').get('/courses').reply(200, expected);
test('test1', () => fs.mkdtemp(path.join(os.tmpdir(), 'project3_'))
  .then((folder) => {
    console.log(folder);
    tmpDir = folder;
    return load(folder, 'https://hexlet.io/courses');
  })
  .then(() => fs.readdir(tmpDir))
  .then(list => fs.readFile(`${tmpDir}/${list[0]}`, 'utf-8'))
  .then(data => expect(data).toBe(expected)));

nock('https://hexlet.io').get('/courses').replyWithFile(200, `${__dirname}/__fixtures__/forTest2.html`)
  .get('/img.jpg')
  .reply(200, 'img')
  .get('/script.js')
  .reply(200, 'script');
test('test2', () => fs.mkdtemp(path.join(os.tmpdir(), 'project3_'))
  .then((folder) => {
    console.log(folder);
    tmpDir = folder;
    return load(folder, 'https://hexlet.io/courses');
  })
  .then(() => fs.readFile(`${tmpDir}/${makeFolderName('https://hexlet.io/courses')}/img-jpg`, 'utf-8'))
  .then(data => expect(data).toBe('img'))
  .then(() => fs.readFile(`${tmpDir}/${makeFolderName('https://hexlet.io/courses')}/script-js`, 'utf-8'))
  .then(data => expect(data).toBe('script')));

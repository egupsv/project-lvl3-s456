import nock from 'nock';
import axios from 'axios';
import { promises as fs } from 'fs';
import httpAdapter from 'axios/lib/adapters/http';
import path from 'path';
import os from 'os';
import load, { makeFolderName } from '../src';

axios.defaults.adapter = httpAdapter;

const expected = '<!DOCTYPE html><html><head></head><body></body></html>';

nock('https://hexlet.io').get('/courses').reply(200, expected);
test('base', async () => {
  const tmpDir1 = await fs.mkdtemp(path.join(os.tmpdir(), 'project3_'));
  await load(tmpDir1, 'https://hexlet.io/courses');
  const list = await fs.readdir(tmpDir1);
  const data = await fs.readFile(`${tmpDir1}/${list[0]}`, 'utf-8');
  expect(data).toBe(expected);
});

nock('https://hexlet.io').get('/courses').replyWithFile(200, `${__dirname}/__fixtures__/forTest2.html`)
  .get('/img.jpg')
  .reply(200, 'img')
  .get('/script.js')
  .reply(200, 'script');
test('load resourses', async () => {
  const tmpDir2 = await fs.mkdtemp(path.join(os.tmpdir(), 'project3_'));
  await load(tmpDir2, 'https://hexlet.io/courses');
  const data1 = await fs.readFile(`${tmpDir2}/${makeFolderName('https://hexlet.io/courses')}/img-jpg`, 'utf-8');
  const data2 = await fs.readFile(`${tmpDir2}/${makeFolderName('https://hexlet.io/courses')}/script-js`, 'utf-8');
  expect(data1).toBe('img');
  expect(data2).toBe('script');
});

nock('https://hexlet.io').get('/err').reply(404);
test('error 404', async () => {
  await expect(load('https://hexlet.io/err', path.join(os.tmpdir(), 'project3_')))
    .rejects.toThrow('connect ECONNREFUSED 127.0.0.1:80');
});

nock('https://hexlet.io').get('/wrongdir').reply(200, 'anything');
test('wrong directory', async () => {
  await expect(load('https://hexlet.io/wrongdir', 'directory'))
    .rejects.toThrow('connect ECONNREFUSED 127.0.0.1:80');
});

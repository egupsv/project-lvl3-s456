import nock from 'nock';
import axios from 'axios';
import url from 'url';
import { promises as fs } from 'fs';
import httpAdapter from 'axios/lib/adapters/http';
import loader from '../src';

axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;


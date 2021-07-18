import dotenv from 'dotenv';
dotenv.config({});
import Db from './db';
import Observer from './core/observer';
import {
  findPossiblePairs
} from './utils';
import coins from './data/stable_coins';
import Validator from './core/validator';
import fs from 'fs';
import Arbitrager from './core/arbitrager';

const _Validator = new Validator();
const _Observer = new Observer();
const _Arbitrager = new Arbitrager();

Db.connect().then(async () => {
  const routes = await _Arbitrager.findRoutes();

  let res = routes.map(item => item.map(ite => [ite.coin0.symbol, ite.coin1.symbol]));
  console.log(res);
});
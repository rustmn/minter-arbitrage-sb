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
  const routes = await _Arbitrager.findTriplets();

  console.log(routes.length);
  const res = routes.map((route: any) => {
    const enter = [route.enter.coin0.symbol, route.enter.coin1.symbol];
    const first_stage = route.first_stage.map((item: any) => [item.coin0.symbol, item.coin1.symbol]);
    const second_stage = route.second_stage.map((arra: any) => arra.map((item: any) => [item.coin0.symbol, item.coin1.symbol]));
    return {enter, first_stage, second_stage};
  });

  const result = await routes.map((item: any) => {
    const f = _Arbitrager.makeRoutes(item);
    let obj = [];
    for (let r of f) {
      obj.push(
        [`${r[0].coin0.symbol}/${r[0].coin1.symbol}`,
        `${r[1].coin0.symbol}/${r[1].coin1.symbol}`,
        `${r[2].coin0.symbol}/${r[2].coin1.symbol}`]
      )
    }
    return obj;
  });

  console.log('result: ', result);
  });
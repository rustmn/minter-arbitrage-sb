import dotenv from 'dotenv';
dotenv.config({});
import Db from './db';
let pools: any;
import Express from 'express';
const app: any = Express();
import cors from 'cors';
import _Arb from './core/arbitrager';

app.use(cors({
  origin: '*'
}));
const Arb = new _Arb({
  pools: [],
  bip_price: 0,
});
Arb.updateBipPrice();

Db.connect().then(async () => {
  pools = await Db.getPools();


});

app.get('/pools', (req: any, res: any) => {
  return res.json({
    data: pools.map((pool: any) => ({
      ...pool,
      liquidity_usd: parseFloat(pool.liquidity_bip) * Arb.bip_price
    }))
  })
});

app.get('/relations', (req: any, res: any) => {
  const coin = req.query.coin;
  console.log(coin);
  const relations = Arb._findTradingPairs({
    //@ts-ignore
    coin: {
      symbol: coin
    },
    pools,
  });
  return res.json({
    data: relations
  });
});


app.listen(4000, () => console.log('started'));
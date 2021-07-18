import config from '../config';
import { ICoin, IPool } from '../types';
import coins from '../data/stable_coins';
import Db from '../db';

export default class Arbitrager {
  /**
   * Algo v1 (Find all routes between stablecoins < 5)
   * 1. Find all trading pairs of the 9 stablecoins - P
   * 2. Check if there are direct arbitrage opportunities between stablecoins
   * 3. 
   */
  async findRoutes() {
    //@ts-ignore
    let routes = [];
    const pools = await Db.getPools();
    /**
     * Pools with stable coins
     */
    const pools_sc = pools?.filter((pool) =>
      coins.includes(pool.coin0.symbol) ||
      coins.includes(pool.coin1.symbol));

    for (let x = 0; x < pools_sc.length; x ++) {
      const pool_sc = pools_sc[x];
      const { coin0, coin1 } = pool_sc;
      
      /**
       * 'Enter coins' - coins those have direct pool
       * with some stable coin
       */
      const enter_coin = coins.includes(coin0.symbol) ? coin1 : coin0;

      /**
       * Pools that trades with 'Enter coins'
       */
      
      const trades_with: IPool[] = pools.filter((pool) =>
        [pool.coin0.symbol, pool.coin1.symbol]
          .includes(enter_coin.symbol) &&
          pool.token !== pool_sc.token);

      routes.push(trades_with);
    }
    //@ts-ignore
    return routes;
  }
  /**
   * Finds prices of tokens in LP
   */
  findPriceForPool(pool: IPool): { price0: number, price1: number } {
    const { amount0, amount1 } = pool;

    const num0 = parseFloat(amount0),
      num1 = parseFloat(amount1);

    const price0 = num1 / num0,
      price1 = num0 / num1;
    
      return {
        price0,
        price1
    };
  }

}
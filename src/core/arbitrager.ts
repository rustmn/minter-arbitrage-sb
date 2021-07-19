import config from '../config';
import {
  IPool,
  ITriplet
} from '../types';
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
      coins.includes(pool.coin1.symbol)
    );

    for (let x = 0; x < pools_sc.length; x ++) {
      const pool_sc = pools_sc[x];
      const { coin0, coin1 } = pool_sc;
      
      /**
       * enter_coin - coin that have direct pool
       * with some stable coin
       */
      const enter_coin = coins.includes(coin0.symbol) ? coin1 : coin0;

      /**
       * Pools that trades with enter_coin
       */
      const trades_with: IPool[] = pools.filter((pool) => {
        const symbols = [pool.coin0.symbol, pool.coin1.symbol]
        if (
          symbols.includes(enter_coin.symbol) &&
          pool.token !== pool_sc.token
        ) {
          return pool;
        }
      });

      /**
       * Pools that trades with pair of enter_coin in
       * trades_with
       */
      const trades_with_1: IPool[] = trades_with.filter((pool, index) => {
        const c0 = pool.coin0;
        const c1 = pool.coin1;

      });

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
  async findTriplets() {
    let triplets: any = [];
    const pools = await Db.getPools();

    const pools_sc = pools.filter(pool => {
      const symbols = [pool.coin0.symbol, pool.coin1.symbol];

      if (
        symbols.some(symbol => coins.includes(symbol)) &&
        symbols.some(symbol => !coins.includes(symbol))
      ) return pool;
    });

    for (let x = 0; x < pools_sc.length; x ++) {
      let triplet: any = {
        enter: null,
        first_stage: null,
        second_stage: null
      };
      const pool_sc = pools_sc[x];
      const c0 = coins.includes(pool_sc.coin0.symbol) ?
        pool_sc.coin1 : pool_sc.coin0;

      triplet = {
        ...triplet,
        enter: pool_sc
      };

      const trades_with = pools.filter(pool => {
        const { coin0, coin1, token } = pool;
        const cs = [coin0.symbol, coin1.symbol];

        if (cs.some(coin => coins.includes(coin))) return;

        if (
          cs.includes(c0.symbol) &&
          pool_sc.token.id !== token.id
        ) {
          
          return pool;
        }
      });

      triplet.first_stage = trades_with;

      const tw = trades_with.map(pool => {
        const { coin0, coin1, token } = pool;
        const c1 = coin0.symbol === c0.symbol ? coin1 : coin0;
        const trades = pools.filter(p => {
          const cs = [p.coin0.symbol, p.coin1.symbol];
          if (
            cs.includes(c1.symbol) &&
            cs.some(coin => coins.includes(coin)) &&
            token.id !== p.token.id
          ) {
            return p;
          }
        });
        return trades;
      });

      triplet.second_stage = tw;
      
      if (triplet.first_stage.length && triplet.second_stage.length) {
        triplets.push(triplet);
      }
    }

    return triplets;
  }

  makeRoutes(triplet: ITriplet) {
    const routes: any = [];
    const { first_stage, second_stage, enter } = triplet;
    
    if (!first_stage.length) {
      return {
        info: 'No triplets found'
      };
    }

    for (let x = 0; x < first_stage.length; x ++) {
      let item: any = [];

      if (
        !first_stage[x] ||
        !second_stage[x].length
      ) continue;

      const first_pool = first_stage[x];

      for (let k = 0; k < second_stage[x].length; k ++) {
        const second_pool = second_stage[x][k];

        if (
          !second_pool
        ) continue;
        
        routes.push([enter, first_pool, second_pool]);
      }
    }
    return routes;
  }
}

/**
 * Триплет - маршрут из трёх пулов. Первый - 
 * 1. Итерировать массив пулов со стейблкоинами. Выделить коин C0, который не является стейблкоином
 * 2. Найти все пулы, которые торгуют с C0, но исключить уже проитерированные пулы
 * 3. Отделить коин C1 от пула в паре с C0
 * 4. Найти все пулы, в которых торгуются С1 c одним из стейблкоинов <-- Триплет
 */
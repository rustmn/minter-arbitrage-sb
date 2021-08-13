import config from '../config';
import {
  ICoin,
  IPool,
  ITriplet
} from '../types';
import coins from '../data/stable_coins';
import Db from '../db';
import notifier from '../notifier';
import axios from 'axios';

export default class Arbitrager {
  service_name: string = 'Arbitrager';
  bip_price: number = 0;
  pools: IPool[] = [];
  diff_amount: number = 2000;
  // Pools with stable coins
  pools_sc: IPool[] = [];

  constructor({
    pools,
    bip_price,
    diff_amount
  }: {
    pools: IPool[],
    bip_price: number,
    diff_amount?: number
  }) {
    this.pools = pools;
    this.bip_price = bip_price;
    this.pools_sc = pools.filter((pool) =>
      coins.includes(pool.coin0.symbol) ||
      coins.includes(pool.coin1.symbol)
    );
    if (diff_amount) this.diff_amount = diff_amount;
  }
  /**
   * Как найти пул с пониженной / повышенной ценой?
   */
  
  findArbitrageOpportunities() {

    /**
     * To weed out only pools with unstable price (not the same as initial),
     * we can calculate liquidity in USD for each pool and then compare it
     * with amount of stablecoin in pool.
     */
    for (let pool of this.pools_sc) {
      const {
        amount0,
        amount1
      } = pool;
      const liquidity_usd = this._calcLiquidityInUSD(pool);
      
    }
  }

  /**
   * @param pool IPool
   * @returns true if pool - it is a pair of stable coins, otherwise - false.
   */
  _isPoolWithStableCoinsOnly(pool: IPool): boolean {
    const {
      coin0,
      coin1
    } = pool;

    if (
      coins.includes(coin0.symbol) &&
      coins.includes(coin1.symbol)
    ) return true;

    return false;
  }

  /**
   * 
   * @param pool IPool
   * @returns liquidity in USD
   */
  _calcLiquidityInUSD(pool: IPool) {
    const {
      liquidity_bip,
    } = pool;

    return parseFloat(liquidity_bip) * this.bip_price;
  }

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
  findPriceForPool({
    amount0,
    amount1
  }: {
    amount0: string,
    amount1: string
  }): { price0: number, price1: number } {

    const num0 = parseFloat(amount0),
      num1 = parseFloat(amount1);

    const price0 = num1 / num0,
      price1 = num0 / num1;
    
      return {
        price0,
        price1
    };
  }
  /**
   * @param {Array} pools all pools with stable coins
   * @returns {object} downward for buy and upward for sell arrays of pools 
   */
  findOptimalStableCoins(pools: IPool[]): { downward: IPool[], upward: IPool[] } {
    const diff_in_pool = this.diff_amount;

    const downward: IPool[] = [],
      upward: IPool[] = [];

    if (!this.bip_price) {
      throw new Error('BIP price is not defined');
    }
    /**
     * To weed out only pools with unstable price (not the same as initial),
     * we can calculate liquidity in USD for each pool and then compare it
     * with amount of stablecoin in pool.
     */
    for (let pool of pools) {
      const { coin0, coin1, amount0, amount1, liquidity_bip } = pool;
      const stable_coin_amount = parseFloat(coins.includes(coin0.symbol) ? amount0 : amount1);
      const liquidity_usd = parseFloat(liquidity_bip) * this.bip_price;

      if (
        // If price of all stablecoins in pool lower than 50%
        (liquidity_usd / 2 - stable_coin_amount) < diff_in_pool
      ) {
        upward.push(pool);
      }
      if (
         // If price of all stablecoins in pool greater than 50%
        (liquidity_usd / 2 - stable_coin_amount) > diff_in_pool
      ) {
        downward.push(pool);
      }
    }

    return {
      downward,
      upward
    };
  }

  async updateBipPrice() {
    let bip_price = await axios.get(
      config.minter_bip_price_url
    ).then(response => {
      return response
        .data
        .market_data
        .current_price
        .usd
    })
    .catch(error => {
      notifier({
        message: error.message,
        type: 'error'
      });
      throw 'Bip price not updated';
    });
    if (
      bip_price &&
      typeof bip_price === 'number'
    ) {
      this.bip_price = bip_price;
      notifier({
        type: 'info',
        message: 'BIP price has been updated'
      });
      return;
    }
    notifier({
      type: 'error',
      message: 'BIP price has not been updated'
    });
  }

  async findTriplets(pools: IPool[]) {
    const fn_name = 'findTriplets';

    if (pools.length < 3) {
      notifier({
        type: 'warn',
        message: `${this.service_name}.${fn_name} recieved array with length ${pools.length}. Unable to continue`
      });
      return [];
    }
    let triplets: any = [];
    /**
     * Pools with stablecoins
     */
    const pools_sc = pools.filter(pool => {
      const symbols = [pool.coin0.symbol, pool.coin1.symbol];

      if (
        symbols.some(symbol => coins.includes(symbol)) &&
        symbols.some(symbol => !coins.includes(symbol))
      ) return pool;
    });
    /**
     * Pools with stablecoins there price < 1$
     */
    const { downward, upward } = this.findOptimalStableCoins(pools_sc);
    console.log(`${downward[0].coin0.symbol}/${downward[0].coin1.symbol}`)
    for (let x = 0; x < downward.length; x ++) {
      let triplet: any = {
        enter: null,
        first_stage: null,
        second_stage: null
      };
      const pool_sc = downward[x];
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

  makeRoutes(triplet: ITriplet): [IPool[]] | [] {
    const routes: any = [];
    const { first_stage, second_stage, enter } = triplet;
    if (
      !triplet ||
      !first_stage ||
      !second_stage ||
      !enter
    ) {
      throw new Error(`Invalid args`);
    }
    if (!first_stage.length) {
      return []
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
  /**
   * Algoritm:
   * 1. Find the entrypoint where stablecoin S price is lower than 1$
   * 2. Find pool where S total amount value is greater than 50% of
   * pool liquidity
   * 3. Check the pair coin from the step 2 with the same condition
   * 4. Buy stablecoin
   * @param pools with stablecoins
   */
  findOpportunityWithStableCoins({
    pools,
    pools_sc
  }: {
    pools: IPool[],
    pools_sc: IPool[]
  }) {
    const entries = this._findInputOrOuput({
      pools: pools_sc,
      type: 'input'
    });
    if (!entries.length) {
      notifier({
        type: 'info',
        message: `There is no efficient entries. No further steps will be taken.`
      });
      return [];
    }
    let routes: any = [];
    /**
     * Create route for each exit point
     * [entry, middle_pool, exit]
     */
    for (let entry of entries) {
      // If entry is the pair of stable coins, start next iteration
      if (
        this._checkIfPairOfStableCoinsInPool(entry)
      ) continue;
      const coin = this._separateFromStableCoin(entry);

      const trading_pairs = this._findTradingPairs({
        coin,
        pools,
        pool_id_to_exclude: [entry.token.id]
      });

      for (let pair of trading_pairs) {
        const { coin0, coin1 } = pair;
        const c = coin0.symbol === coin.symbol ? coin1 : coin0;
      
        const exit_points = this._findTradingPairsWithStableCoins({
          pools_sc,
          coin: c
        });

        for (let exit of exit_points) {
          const composed_route = [entry, pair, exit];
          routes.push(composed_route);
        }
      }
    }
    return routes;
  }
  /**
   * Find entry or exit point for arbitrage oppotunity
   * @param {Object} data
   * @param {Array} data.pools - pools with stablecoins
   * @param {String} data.type - type of the action
   * @returns array of entrypoints with stablecoin price > (50% of liquidity)
   * if type === 'input || stablecoin price < (50% of liquidity) if type === 
   * 'output'
   */
  _findInputOrOuput({
    pools,
    diff_in_pool,
    type
  }: {
    pools: IPool[],
    diff_in_pool?: number,
    type: 'input' | 'output'
  }) {
    const DEFAULT_DIFF_IN_POOL = 2000;
    const diff = diff_in_pool ? diff_in_pool : DEFAULT_DIFF_IN_POOL;

    let result: IPool[] = [];
    
    /**
     * To weed out only pools with unstable price (not the same as initial),
     * we can calculate liquidity in USD for each pool and then compare it
     * with amount of stablecoin in pool.
     */
     for (let pool of pools) {
      const { coin0, coin1, amount0, amount1, liquidity_bip } = pool;
      const stable_coin_amount = parseFloat(coins.includes(coin0.symbol) ? amount0 : amount1);
      const liquidity_usd = parseFloat(liquidity_bip) * this.bip_price;

      if (
        type === 'input' &&
         /**
          * If price of all stablecoins in pool greater than 50%.
          * If so, this will lead to decrease in price compared to
          * it pair
          */
        (liquidity_usd / 2 - stable_coin_amount) > diff
      ) {
        result.push(pool);
      }
      if (
        type === 'output' &&
        (liquidity_usd / 2 - stable_coin_amount) < diff
      ) {
        result.push(pool);
      }
    }

    return result;
  }
  _checkIfCoinHasUnderstatedPrice(pool: IPool) {
    const {
      coin0,
      coin1,
      liquidity_bip,
      amount0,
      amount1
    } = pool;
  }
  /**
   * Find 
   */
  _findTradingPairs({
    coin,
    pools,
    pool_id_to_exclude
  }: {
    coin: ICoin
    pools: IPool[]
    pool_id_to_exclude?: number[]
  }): IPool[] {
    let pairs: IPool[] = [];
    for (let pool of pools) {
      const coins_in_pool = [pool.coin0.symbol, pool.coin1.symbol];
      const check = pool_id_to_exclude ?
      !pool_id_to_exclude.some(p => p === pool.token.id) : true;

      if (
        coins_in_pool.includes(coin.symbol) &&
        check
      ) {
        pairs.push(pool);
      }
    }
    return pairs;
  }
  /**
   * 
   * @returns the pair of stablecoin from provided pool
   */
  _separateFromStableCoin(pool: IPool) {
    const { coin0, coin1 } = pool;
    const check = [coin0, coin1].filter(coin => coins.includes(coin.symbol));

    if (check.length < 1) throw 'There no stable coins in provided pool';

    if (check.length >= 2) throw 'The pair of stable coins provided';

    if (coins.includes(coin0.symbol)) return coin1;
    return coin0;
  }
  /**
   * @returns pools only trades with stable coins
   */
  _getPoolsWithStableCoins(pools: IPool[]): IPool[] {
    return pools.filter(pool => {
      const { coin0, coin1 } = pool;
      if (
        [coin0.symbol, coin1.symbol]
          .some(coin => coins.includes(coin))
      ) return pool;
    });
  }
  _findTradingPairsWithStableCoins({
    coin,
    pools_sc,
  }: {
    coin: ICoin
    pools_sc: IPool[]
  }) {
    const pools = pools_sc.filter(pool => {
      const { coin0, coin1 } = pool;
      const cs = [coin0.symbol, coin1.symbol];
      if (
        cs.some(
          coin => coins.includes(coin)
        ) &&
        cs.includes(coin.symbol)
      ) return pool;
    });
    return pools;
  }
  _checkIfPairOfStableCoinsInPool(pool: IPool) {
    const { coin0, coin1 } = pool;

    if (
      [coin0.symbol, coin1.symbol]
        .some(coin => !coins.includes(coin))
    ) return false;

    return true;
  }
}
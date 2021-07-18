import {
  IPool
} from '../types';

export default class Validator {
  /**
   * @returns {array} pools with liquidity greater than min in USD
   */
  async onlyPoolsWithLiquidity({
    min,
    pools
  }: {
    min: number
    pools: IPool[]
  }): Promise<IPool[]> {
    return pools.filter((pool) => parseFloat(pool.liquidity) > min);
  }
}
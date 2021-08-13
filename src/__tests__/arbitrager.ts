import _Arbitrager from '../core/arbitrager';
import { IPool } from '../types';

const Arbitrager = new _Arbitrager();

describe('Arbitrager class tests', () => {
  describe('internal functions', () => {
    const right_pool = {
      coin0: {
        symbol: 'HUB'
      },
      coin1: {
        symbol: 'USDTE'
      }
    };
    const wrong_pool = JSON.parse(JSON.stringify(right_pool));
    wrong_pool.coin0.symbol = 'MUSD';
    wrong_pool.coin1.symbol = 'USDCE';
    describe('_separateFromStableCoin', () => {
      it('should return HUB', () => {
        const test = Arbitrager._separateFromStableCoin(right_pool as IPool);
        return expect(test).toBe(right_pool.coin0);
      });
      it('should throw an exception', () => {
        return expect(() => Arbitrager._separateFromStableCoin(wrong_pool as IPool)).toThrow('The pair of stable coins provided');
      });
    });
    describe('_checkIfPairOfStableCoinsInPool', () => {
      
      it('should return false', () => {
        const test = Arbitrager._checkIfPairOfStableCoinsInPool(right_pool as IPool);
        return expect(test).toBe(false);
      });
      it('should return true', () => {
        const test = Arbitrager._checkIfPairOfStableCoinsInPool(wrong_pool as IPool);
        return expect(test).toBe(true);
      });
    });
  });
});
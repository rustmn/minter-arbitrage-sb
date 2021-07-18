import {
  findPossiblePairs,
  findPossiblePairsCount
} from '../utils';
import coins from '../data/stable_coins';

describe('__utils functions__', () => {
  describe('findPossiblePairs fn', () => {
    const res = findPossiblePairs(coins);
    const res_q = findPossiblePairsCount(coins);

    it('should return right number of possible pairs', () => {
      return expect(res).toHaveLength(res_q);
    });

    it('should not contain doublicates', () => {
      let pairs = res.slice();
      let has_dublicates = false;

      for (let idx = 0; idx < pairs.length; idx ++) {
        const pair = pairs[idx];

        const reversed_pair = pair.split('/').reverse().join('/');
                
        pairs.splice(idx, 1);

        if (
          pairs.includes(pair) ||
          pairs.includes(reversed_pair)
        ) {
          has_dublicates = true;
          break;
        }
      };

      return expect(has_dublicates).toBeFalsy();
    });
  });
});
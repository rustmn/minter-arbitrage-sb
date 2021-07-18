import axios from 'axios';
import config from './config';

interface findRouteConfig {
  [key: string]: string
}

export function findPool({
  coin0,
  coin1
}: {
  coin0: string
  coin1: string
}) {
  const url = `${config.minter_explorer_api_url}/pools/coins/${coin0}/${coin1}`;
  const response = axios.get(url)
    .then(res => {
      return res.data.data;
    })
    .catch(error => {
      console.error(error.message);
      return false;
    });

    return response;
}

export function findRoute({
  coin0,
  coin1,
  amount,
  type
}: findRouteConfig) {

  const url = `${config.minter_explorer_api_url}/pools/coins/${coin0}/${coin1}/route?amount=${amount}&type=${type}`;
  console.log('URL: ', url)
  const response = axios.get(url)
    .then(res => {
      return res.data;
    })
    .catch(error => {
      console.error(error.message);
      return false;
    });

    return response;
}

export function findPossiblePairs(values: string[]) {
  let result: string[] = [];

  for (let i = 0; i < values.length - 1; i ++) {
    for (let x = i + 1; x < values.length; x ++) {
      const pair = `${values[i]}/${values[x]}`;
      const reversed_pair = pair.split('/').reverse().join('/');

      if (
        !result.includes(pair) &&
        !result.includes(reversed_pair)
      ) {
        result.push(pair);
      }
    }
  }

  return result;
}

export function findPossiblePairsCount(values: string[]) {
  const elements_quantity = values.length;

  return elements_quantity * (elements_quantity - 1) / 2;
}
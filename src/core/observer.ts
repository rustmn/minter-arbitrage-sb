//@ts-ignore
import { Minter } from 'minter-js-sdk';
import Db from '../db';
import config from '../config';
import coins from '../data/stable_coins';
import {
  findPossiblePairs,
  findRoute,
  findPool
} from '../utils';
import {
  IRoute,
  IPool
} from '../types';
import Err from '../db/models/err';
import axios from 'axios';
import websocket from 'websocket';

const minter = new Minter({
  chainId: config.chainId,
  apiType: 'gate',
  baseURL: config.minter_gate_api_url
});

export default class Observer {
  db: typeof Db = Db;
  name = 'Observer';

  async subscribeToNode({
    event,
    callback
  }: {
    event?: 'NewBlock' | 'Tx',
    callback(): void
  }) {
    const default_event = 'NewBlock';

    const WebsocketClient = websocket.client;
    const client = new WebsocketClient();

    client.on('connectFailed', (error) => {
      console.error(`Connection failed. ${error}`);
    });

    client.on('connect', (connection) => {
      console.info(`Connected successfully`);
      connection.on('message', (message) => {
        console.log(`Message recieved: `, message.utf8Data);
      })
    });
    //@ts-ignore
    client.on('message', (message) => {
      console.log('From fn: ', message);
    });

    const url = `${config.minter_node_api_url.replace('https://', 'wss://')}/subscribe?query=${event || default_event}`;

    console.log(url);

    client.connect(url);
  }
  /**
   * Finds all pools in Minter with liquidity > 1000$
   */
  async getAllPools(): Promise<IPool[]> {
    let pools: IPool[] = [];
    
    /**
     * Get the pages with pools quantity (10 pools within 1 page)
     * & append first page to pools array
     */
    const pages: number | null = await axios.get(`${config.minter_explorer_api_url}/pools`)
      .then(response => {
        pools = pools.concat(response.data.data);
        return response.data.meta.last_page;
      })
      .catch(error => {
        console.error(error.message);
        return null;
      });
    
    if (!pages) {
      throw `First request to ${config.minter_explorer_api_url}/pools didn't complete correctly`;
    }

    console.log('Pools after first request: ', pools);
    console.log('pages: ', pages);
    /**
     * Get all pools through all pages
     * & append them to pools array
     */
    for (let x = 2; x <= pages; x ++) {
      console.info(`__INFO__ ITERATION <${x}>`);
      const request = await axios.get(
        `${config.minter_explorer_api_url}/pools?page=${x}`
        )
        .then(response => response.data.data)
        .catch(error => {
          console.error(error.message);
          return null;
        });

        if (request) {
          pools = pools.concat(request);
        }
    }

    /**
     * Filter pools to contain only pools with liquidity > 1000$
     */
    pools = pools.filter((pool) => parseFloat(pool.liquidity_bip) > 300000);

    return pools;
  }

  async buyCoin({
    coinToBuy,
    coinToSell,
    amount,
  }: {
    coinToBuy: string,
    coinToSell: string,
    amount: number
  }) {
    let response: any;

    try {
      response = await minter.estimateCoinBuy({
        coinToBuy,
        coinToSell,
        valueToBuy: amount
      });
    }
    catch(error) {
      return null
    }
    console.log(response);
    return response;
  }
  async updatePools(): Promise<void> {
    const pools: IPool[] = await this.getAllPools();

    const result = await Db.insertPool(pools);

    if (!result) {
      throw `${this.name}.updatePools failed`;
    }
  }
}
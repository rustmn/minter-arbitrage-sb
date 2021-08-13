import mongoose from 'mongoose';
import config from '../config';
import {
  Route,
  Coin,
  Pool,
} from './models';
import {
  IRoute,
  IPool,
  ICoin
} from '../types';
import Test from './models/test';

class Db {
  async connect(): Promise<void> {
    let promise;
    try {
      promise = mongoose.connect(
        config.db.connection_string
          .replace('<username>', config.db.user)
          .replace('<password>', config.db.pass)
          .replace('<name>', config.db.name),
          {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
          }
        )
          .then(_ => console.info('__DB connected__'));
    }
    catch(error) {
      console.error(error.message);
      process.exit(1);
    }

    return promise;
  }

  async removePools() {
    let response;
    try {
      response = await mongoose.connection.dropCollection('pools');
    }
    catch (error) {
      console.error(error.message);
      return response;
    }
    return response;
  }

  async getPool({
    coin0,
    coin1
  }: {
    coin0: string
    coin1: string
  }): Promise<IPool | undefined> {
    let pool: any;

    try {
      pool = await Pool.findOne({ 'coin0.symbol': coin0, 'coin1.symbol': coin1 }).exec();
    }
    catch(error) {
      console.error(error.message);
      return pool;
    }
    return pool;
  }

  async getPools(): Promise<IPool[]> {
    let pools: IPool[] = [];

    try {
      pools = await Pool.find({})
        .lean()
        .exec();
    }
    catch(error) {
      console.error(error.message);
      return pools;
    }

    return pools;
  }

  async insertRoute(route: IRoute) {
    let created;
    try {
      created = await Route.create(route);
    }
    catch(error) {
      console.error(error.message);
      return false;
    }
    console.log('__created: ', created);
    return created;
  }

  async insertPool(pool: IPool | IPool[]): Promise<boolean> {
    let created;
    try {
      created = await Pool.create(pool);
    }
    catch(error) {
      console.error(error.message);
      return false;
    }
    return created ? true : false;
  }
  async insertTest(test: any) {
    let created;
    try {
      created = await Test.create(test);
    }
    catch(err) {
      console.error(err.message);
      return false;
    }
    return created ? true : false;
  }
  async updateCoinPrice(coin: ICoin) {
    let created;
    try {
      created = await Coin.replaceOne({ id: coin.id }, coin, { upsert: true });
    }
    catch(error) {
      throw new Error(error.message);
    }
    return created.nModified ? true : false;
  }
}

export default new Db();
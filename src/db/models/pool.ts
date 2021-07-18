import mongoose, { Schema, model } from 'mongoose';
import { CoinSchema } from './coin';
import { IPool } from '../../types';

const collection_name = 'pools';

export const PoolSchema = new Schema<IPool>({
  coin0: CoinSchema,
  coin1: CoinSchema,
  token: CoinSchema,
  amount0: String,
  amount1: String,
  liquidity: String,
  liquidity_bip: String,
  trade_volume_bip_1d: String,
  trade_volume_bip_30d: String
},
  {
    collection: collection_name,
    timestamps: true
  }
);

PoolSchema.methods.dropCollection = function dropCollection() {
  return mongoose.connection.db.dropCollection(collection_name);
};

export const Pool = model<IPool>('Pool', PoolSchema);
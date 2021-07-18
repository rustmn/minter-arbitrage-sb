import { Schema, model } from 'mongoose';
import { IPair } from '../../types';
import { PoolSchema } from './pool';

const PairSchema = new Schema<IPair>({
  coin0: { type: String, required: true },
  coin1: { type: String, required: true },
  name: { type: String, unique: true },
  pool: PoolSchema
},
  {
    collection: 'coin_pairs'
  }
);

export const Pair = model<IPair>('Pair', PairSchema);
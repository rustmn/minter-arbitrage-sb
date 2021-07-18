import { Schema, model } from 'mongoose';
import { ICoin } from '../../types';

export const CoinSchema = new Schema<ICoin>({
  id: { type: Number, required: true },
  symbol: { type: String, require: true }
},
  { collection: 'coins' }
);

export default model('Coin', CoinSchema);
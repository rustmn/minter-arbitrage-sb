import { Schema, model } from 'mongoose';
import { ICoin } from '../../types';

export const CoinSchema = new Schema<ICoin>({
  id: { type: Number, required: true },
  symbol: { type: String, required: true },
  price: { type: Number, required: false }
},
  { collection: 'coins' }
);

export const Coin = model('Coin', CoinSchema);
import mongoose, { Schema, model } from 'mongoose';
import { CoinSchema } from './coin';
import { IRoute } from '../../types';
const collection_name = 'routes';

export const RouteSchema = new Schema<IRoute>({
  swap_type: String,
  amount_in: String,
  amount_out: String,
  coins: [CoinSchema]
}, {
  collection: collection_name
});

RouteSchema.method('dropCollection', () => {
  return mongoose.connection.db.dropCollection(collection_name);
});

export const Route = model<IRoute>('Route', RouteSchema);
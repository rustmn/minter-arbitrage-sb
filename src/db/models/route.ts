import mongoose, { Schema, model } from 'mongoose';
import { PoolSchema } from './pool';
import { IRoute } from '../../types';

const collection_name = 'routes';

export const RouteSchema = new Schema<IRoute>({
  pools: [PoolSchema]
}, {
  collection: collection_name
});

RouteSchema.method('dropCollection', () => {
  return mongoose.connection.db.dropCollection(collection_name);
});

export const Route = model<IRoute>('Route', RouteSchema);
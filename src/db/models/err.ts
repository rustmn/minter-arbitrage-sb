import mongoose from 'mongoose';

const ErrSchema = new mongoose.Schema({
  coin0: String,
  coin1: String,
},
  {
    collection: 'pairs_with_errors'
  }
);

export default mongoose.model('Err', ErrSchema);
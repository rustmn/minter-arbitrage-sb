import {model, Schema} from 'mongoose';
import {PoolSchema} from './pool';

const TestSchema = new Schema({
  enter: [String],
  first_stage: [[String]],
  second_stage: [[[String]]]
});

export default model('Test', TestSchema);
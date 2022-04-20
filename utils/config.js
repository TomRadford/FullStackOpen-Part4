require('dotenv').config()

const { PORT } = process.env
const MONGODB_URI = (process.env.NODE_ENV === 'test')
  ? process.env.TEST_MONGODBURI
  : process.env.MONGODB_URI

module.exports = {
  PORT,
  MONGODB_URI,
}

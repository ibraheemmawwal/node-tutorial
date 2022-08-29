const mongoose = require('mongoose');
const redis = require('redis');

const redisUrl = 'redis://127.0.0.1:6379';

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  return this;
};

mongoose.Query.prototype.exec = async function () {
  const client = redis.createClient(redisUrl);
  await client.connect();

  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  // see if we have a value for 'key' in redis
  const cachedValue = await client.hGet(this.hashKey, key);

  //   if we do, return that
  if (cachedValue) {
    const doc = JSON.parse(cachedValue);
    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  }

  //  if we don't, run the query, store the result in redis and return it

  const result = await exec.apply(this, arguments);
  client.hSet(this.hashKey, key, JSON.stringify(result), 'EX', 10);

  return result;
};

module.exports = {
  clearHash(hashKey) {
    const client = redis.createClient(redisUrl);
    client.connect();
    client.del(JSON.stringify(hashKey));
  },
};

const redis = require('redis');
const mongoose  = require('mongoose');
const { promisify } = require('util');
require('dotenv').config();

const cacheDb =  'redis://127.0.0.1:6379'; //process.env.CACHE_DB_DEV;
const client = redis.createClient(cacheDb);
client.hget = promisify(client.hget); //client get does not support promises, this is  a way to promisify them
client.hset = promisify(client.hset);


mongoose.Query.prototype.cache = function(hkey){
    this.useCache = true;

    // this is the top level key like restaurant or boutique
    this.hashKey = JSON.stringify(hkey);
    
    return this;
}

// store the default exec function in exec variable
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function() { // modifying the exec property of mongoose
    // this = mongooose.query.prototype.exex
    // when useCache = false we should directly send the query to mongodb and return the result to router
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

   /*  Here is how out key looks
    key = '{query_param1: param1_value,..., collection: collection_name}'
    we need to stringify the object before storing in redis cache */
    let key = JSON.stringify(Object.assign({},this.getQuery(),{collection: this.mongooseCollection.name}));

    /* Querying the cache
    if value for key exists this.then, cacheValue = data
    else, cacheValue = null
     */
    const cacheValue = await client.hget(this.hashKey, key);

    // when data is found in redis cache
    if (cacheValue){
        const doc = JSON.parse(cacheValue) ; // converting back to original data type from string

        /* We need to convert normal json to mongoose model instance before returning to router
           this.model() is used for this purpose
           the stored data may be single object or array of objects
         */
        return Array.isArray(doc) ? 
            doc.map((d) => new this.model(d)) : 
            new this.model(doc);
    }

    // data not present in redis cache, get the data from mongod and store it to redis cache also
    const result = await exec.apply(this, arguments) // using the default exec function

    // some logic to check if the data for the required query is even present in the database
    if (result){ //mongodb returned non-null value (can be empty array)
        if (Array.isArray(result) && result.length==0){
            // array is empty
            return null
        }
        else { //data is there
            client.hset(this.hashKey, key, JSON.stringify(result)); // saving data in redis cache
            return result     
        }
    }
    else { //database returned null value
        console.log('Data not present');
        return null
    }

    }

module.exports = function clearCache(hashkey){
    client.del(JSON.stringify(hashkey));
}
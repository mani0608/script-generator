var cache = require('memory-cache');

class CacheManager {

    addCache(key, value) {
        cache.put(key, value);
    }

    getCache(key) {
        return cache.get(key);
    }

    clear() {
        cache.clear();
    }

    delete(key) {
        cache.del(key);
    }
}

module.exports = CacheManager;
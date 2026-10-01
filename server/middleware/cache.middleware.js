// ==========================================
// SIMPLE IN-MEMORY TTL CACHE
// ==========================================

const cache = new Map();


// ==========================================
// CACHE MIDDLEWARE
// ==========================================

function cacheMiddleware(ttlSeconds = 30) {

    return (req, res, next) => {

        // GET requests lang ang ika-cache
        if (req.method !== "GET") {
            return next();
        }


        // Unique cache key including query params
        const key = req.originalUrl;


        const cached = cache.get(key);


        // ==================================
        // CACHE HIT
        // ==================================

        if (cached) {

            if (Date.now() < cached.expiresAt) {

                return res.json(cached.data);

            }


            // Expired na
            cache.delete(key);

        }


        // ==================================
        // CACHE MISS
        // ==================================

        const originalJson =
            res.json.bind(res);


        res.json = (data) => {

            // Successful responses lang
            if (
                res.statusCode >= 200 &&
                res.statusCode < 300
            ) {

                cache.set(key, {

                    data,

                    expiresAt:
                        Date.now() +
                        ttlSeconds * 1000

                });

            }


            return originalJson(data);

        };


        next();

    };

}


// ==========================================
// CLEAR CACHE
// ==========================================

function clearCache() {

    cache.clear();

}


// ==========================================
// EXPORTS
// ==========================================

module.exports = {
    cacheMiddleware,
    clearCache
};
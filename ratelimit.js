const ipMap = new Map()

// IP rate limiting function
// Usage: app.get('/', rateLimit, (req, res) => {...})
function rateLimit(req, res, next) {
    let ip = req.ips[req.ips.length]
    let now = Date.now()
    let lastReqTime = ipMap.get(ip)
    if (lastReqTime !== undefined && lastReqTime - now <= 60000) {
        res.status(429).send('Rate limit reached')
        return
    }
    ipMap.set(ip, now)
    next()
}

module.exports = { rateLimit }
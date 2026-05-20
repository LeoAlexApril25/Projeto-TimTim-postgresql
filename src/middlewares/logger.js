const logger = (req, res, next) => {
    const timestamp = new Date(). toLocaleDateString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
}

// Esse arquivo.js middleware ficara resposavel faz voce ver cada pedindo que Timtim que cuida do frontend faz( ajuda no debug!)

module.exports = logger;
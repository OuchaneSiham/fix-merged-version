
const prisma = require('../config/db.js');
const fp = require("fastify-plugin");
const secret = process.env.JWT_KEY;
module.exports = fp(async function (fastify, opts)
{
    fastify.register(require("@fastify/jwt"),
    {
        secret
    })
    fastify.decorate("jwtAuthFun", async function (request, reply) 
    {
    try{
        await request.jwtVerify();
    }
    catch(error)
    {
       return reply.status(401).send({error: " ops unauth"}) 
    }
})
    fastify.decorate("verifyAdmin", async function (request, reply) {
    const userId = request.user.id;
    try {
        const find = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!find) {
            return reply.status(401).send({ error: "user not found" });
        }

        if (find.role !== "admin") {
            return reply.status(403).send({ error: "Access denied. Admins only." });
        }
        
    } catch (error) {
        return reply.status(500).send({ error: "Internal server error during admin check" });
    }
});
})
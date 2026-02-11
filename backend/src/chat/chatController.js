
function chatController(chatService) {
  return async function (fastify) {
    fastify.addHook("preHandler", fastify.jwtAuthFun);
    fastify.post("/conversation", async (req, reply) => {
      const userId = req.user.id;
      const { otherUserId } = req.body;

      if (!otherUserId) {
        return reply.status(400).send({ error: "otherUserId required" });
      }

      try {
        const conversation = await chatService.getOrCreateConversation(
          Number(userId),
          Number(otherUserId)
        );
        return reply.send(conversation);
      } catch (err) {
        return reply.status(400).send({ error: err.message });
      }
    });
    fastify.post("/conversation/:id/message", async (request, reply) => {
      try {
        const userId = request.user.id;
        const conversationId = Number(request.params.id);
        const { content } = request.body;

        if (!content) {
          return reply.status(400).send({ error: "content is required" });
        }

        const message = await chatService.sendMessage(userId, {
          conversationId,
          content,
        });

        return reply.status(200).send(message);
      } catch (err) {
        return reply.status(400).send({ error: err.message });
      }
    });
    fastify.get("/conversation", async (request, reply) => {
      try {
        const userId = request.user.id;
        const conversations = await chatService.getUserConversations(userId);
        return reply.send(conversations);
      } catch (err) {
        return reply.status(500).send({ error: "Internal server error" });
      }
    });
    fastify.get("/conversation/:id/messages", async (request, reply) => {
      try {
        const conversationId = Number(request.params.id);
        const messages = await chatService.getConversationMessages(conversationId);
        return reply.status(200).send(messages);
      } catch (err) {
        return reply.status(400).send({ error: err.message });
      }
    });
    fastify.post("/user/:userId/block", async (req, reply) => {
      const blockerId = req.user.id;
      const blockedId = Number(req.params.userId);

      try {
        const block = await chatService.blockUser(blockerId, blockedId);
        return reply.send(block);
      } catch (err) {
        return reply.status(400).send({ error: err.message });
      }
    });
    fastify.post("/user/:userId/unblock", async (req, reply) => {
      const blockerId = req.user.id;
      const blockedId = Number(req.params.userId);

      try {
        await chatService.unblockUser(blockerId, blockedId);
        return reply.send({ message: "User unblocked successfully" });
      } catch (err) {
        return reply.status(400).send({ error: err.message });
      }
    });
    fastify.get("/user/me/blocked", async (req, reply) => {
      const userId = req.user.id;

      try {
        const blocked = await chatService.getBlockedUsers(userId);
        return reply.send(blocked);
      } catch (err) {
        return reply.status(500).send({ error: err.message });
      }
    });
  };
}

module.exports = chatController;
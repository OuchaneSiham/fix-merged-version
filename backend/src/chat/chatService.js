const ChatGateway = require("./chatGateway.js");

class ChatService {
  constructor(prisma, chatGateway) {
    this.prisma = prisma;
    this.chatGateway = chatGateway;
  }

  async createConversation(userId, dto) {
    const user2Id = dto.members[0];
    if (!user2Id) throw new Error("A member is required for DIRECT conversation");

    const conversation = await this.prisma.conversation.create({
      data: {
        user1Id: userId,
        user2Id: user2Id,
      },
      include: {
        user1: true,
        user2: true,
        messages: true,
      },
    });

    return conversation;
  }

  async getOrCreateConversation(userId, otherUserId) {
    const blockedByOther = await this.prisma.blockedUser.findFirst({
      where: {
        userId: otherUserId,
        blockedUserId: userId
      }
    });

    if (blockedByOther) {
      throw new Error("You are blocked by this user");
    }

    let conversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: userId }
        ]
      }
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          user1Id: userId,
          user2Id: otherUserId
        }
      });
    }

    return conversation;
  }

  async getConversationMessages(conversationId) {
    return this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });
  }

  async sendMessage(userId, dto) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: dto.conversationId },
      include: { user1: true, user2: true }
    });

    if (!conversation) throw new Error("Conversation not found");

    const recipientId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
    const senderBlockedRecipient = await this.prisma.blockedUser.findFirst({
      where: {
        userId: userId,
        blockedUserId: recipientId
      }
    });

    if (senderBlockedRecipient) {
      throw new Error("You cannot send messages to this user because you blocked them.");
    }
    const recipientBlockedSender = await this.prisma.blockedUser.findFirst({
      where: {
        userId: recipientId,
        blockedUserId: userId
      }
    });

    if (recipientBlockedSender) {
      throw new Error("Message failed. You are blocked by this user.");
    }
    const message = await this.prisma.message.create({
      data: {
        content: dto.content,
        senderId: userId,
        conversationId: dto.conversationId,
      },
      include: { sender: { select: { id: true, username: true } } },
    });

    if (this.chatGateway) {
      this.chatGateway.handleEmitNewMessage(message);
    }

    return message;
  }

  async getUserConversations(userId) {
    return this.prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: { select: { id: true, username: true } },
        user2: { select: { id: true, username: true } }
      },
      orderBy: { id: "desc" }
    });
  }

  async blockUser(blockerId, blockedId) {
    const existing = await this.prisma.blockedUser.findFirst({
      where: {
        userId: blockerId,
        blockedUserId: blockedId
      }
    });

    if (existing) return existing;

    return this.prisma.blockedUser.create({
      data: { userId: blockerId, blockedUserId: blockedId }
    });
  }

  async unblockUser(blockerId, blockedId) {
    return this.prisma.blockedUser.deleteMany({
      where: {
        userId: blockerId,
        blockedUserId: blockedId
      }
    });
  }

  async getBlockedUsers(userId) {
    return this.prisma.blockedUser.findMany({
      where: { userId },
      include: {
        blockedUser: { select: { id: true, username: true } }
      }
    });
  }
}

module.exports = ChatService;
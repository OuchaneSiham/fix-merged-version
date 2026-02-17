import Block from '../../Assets/images/Block.jpeg'

export default function MobileList({selectedConv, conversations, selectChat, user, blockedUsers})
{
    const isUserBlocked = (friendId) => {
        return blockedUsers.some(b => b.blockedUser.id === friendId);
    };

    return (
        <div className="flex md:hidden overflow-x-auto p-3 border-1 border-[#FFFFFF1A] rounded-[60px] px-5">
        <div className="flex items-center gap-3 min-w-min">
            {conversations.map(conv => {
            const friend = conv.user1.id === user.id ? conv.user2 : conv.user1;
            const isSelected = selectedConv?.id === conv.id;
            const blocked = isUserBlocked(friend.id);

            return (
                <button
                key={conv.id}
                onClick={() => selectChat(conv)}
                className={`flex-shrink-0 w-[60px] h-[60px] rounded-full overflow-hidden border-2 transition ${
                    isSelected ? 'border-[#B6410F]' : 'border-[#FFFFFF1A]'
                }`}
                >
                <img 
                    src={blocked ? Block : "https://picsum.photos/200/300"}
                    alt={friend.username}
                    className="w-full h-full object-cover"
                />
                </button>
            );
            })}
        </div>
        </div>
    );
}
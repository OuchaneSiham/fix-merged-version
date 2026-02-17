import Block from '../../Assets/images/Block.jpeg'

export default function FriendsSideBar({selectedConv, conversations, user, selectChat, blockedUsers})
{
    const isUserBlocked = (friendId) => {
        return blockedUsers.some(b => b.blockedUser.id === friendId);
    };

    return(
        <div className="flex flex-col gap-3">
            {conversations.length !== 0 && (
              conversations.map(conv => {
                const friend = conv.user1.id === user.id ? conv.user2 : conv.user1;
                const isSelected = selectedConv?.id === conv.id;
                const blocked = isUserBlocked(friend.id);
                return (
                  <div
                    key={conv.id}
                    onClick={() => selectChat(conv)}
                    className={`flex items-center gap-3 p-2 border-1 lg:p-4 ${
                      blocked ? 'opacity-50' : ''
                    } ${
                      isSelected 
                        ? 'bg-[#2F3A32]' 
                        : 'bg-[#1F2623]'
                    }`}
                  >
                    <img
                      src={blocked ? Block : "https://picsum.photos/200/300"}
                      alt={friend.username}
                      className="w-[40px] h-[40px] rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-white text-[14px]">
                        {friend.username}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
    );
}
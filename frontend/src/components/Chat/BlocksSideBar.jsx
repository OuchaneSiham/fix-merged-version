
export default function BlockSideBar({blockedUsers, handleBlockAction})
{
    return(
        <div className="flex flex-col gap-2">
            {blockedUsers.length === 0 ? (
                <p className="text-[#B0B0B0] text-[14px]">No blocked users</p>
                    ) : (
                    blockedUsers.map(b => (
                    <div key={b.blockedUser.id} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-[#1F2623] border border-[#FFFFFF1A] hover:border-[#FFFFFF26] transition-colors">
                        <span className="text-white text-[13px] font-semibold">{b.blockedUser.username}</span>
                        <button 
                            onClick={() => handleBlockAction(b.blockedUser.id, "unblock")}
                            className="px-2 py-1 text-[11px] bg-green-600/20 text-green-500 border border-green-500/30 rounded hover:bg-green-600/40 transition-colors"
                        >
                            Unblock
                        </button>
                    </div>
            ))
        )}
        </div>
    );
}
import { MdSend } from 'react-icons/md';



export default function InputArea({input, handleSend, setInput, isBlock })
{
    return(
        <div className="sticky bottom-0 z-10 border-t border-[#FFFFFF1A] bg-[#1F2623] p-4">
          <div className="flex items-center gap-2">
            <input
              disabled={isBlock}
              type="text"
              value={input}
              onChange={(e) => {
                if (e.target.value.length <= 150) {
                  setInput(e.target.value);
                }
              }}
              placeholder="Type a message..."
              maxLength="150"
              className="flex-1 bg-[#2F3A32] text-white px-4 py-2 rounded border border-[#FFFFFF1A] focus:outline-none"
            />
            <div className="text-[#B0B0B0] text-[12px] w-[40px] text-right">
              {input.length}/150
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`p-2 rounded transition ${
                input.trim() 
                  ? 'hover:bg-[#FFFFFF0A] cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <MdSend size={20} color="#FFFFFF" />
            </button>
          </div>
        </div>        
    );
}
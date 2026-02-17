


export default function SideBarButton({value, ButtonType, changeView})
{
    return(
        <button
            onClick={changeView}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-[14px] transition-all ${
              value === ButtonType
                ? "bg-[#2F3A32] text-white border border-[#FFFFFF4D]"
                : "bg-[#1F2623] text-[#B0B0B0] border border-[#FFFFFF1A] hover:border-[#FFFFFF26]"
            }`}
          >
            {ButtonType}
        </button>
    );
}
export default function RedirectionLine({text, link, linkText}) {
    return(
        <div className="flex items-center justify-center py-5 mx-3
                        text-white/90 text-[14px] text-sm font-normal
                        w-full
                        mt-3
                        border-1 border-[#2A2420] border-
                        rounded-xl h-10 ">

            <p>
                {text}{' '}
                    <a href={link} className="text-[#D4A574] underline">
                        {linkText}
                    </a>
            </p>
        </div>
    );
}
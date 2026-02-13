

export default function Language()
{
    return(
        <div className="absolute top-6 right-6 ">
                        <select className="px-5 py-2 bg-stone-800/80 backdrop-blur-sm text-amber-50 font-medium rounded-lg border border-amber-500/30 shadow-lg cursor-pointer hover:bg-stone-700/80 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500">
                            <option value="en">En</option>
                            <option value="fr">Fr</option>
                            <option value="es">Es</option>
                        </select>
        </div>
    );
}
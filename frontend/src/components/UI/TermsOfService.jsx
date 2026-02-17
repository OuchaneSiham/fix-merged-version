export default function TermOfService({ischecked, onChange})
{
    return(
        <div className="mt-9 justify-center flex items-center text-sm font-thin">
            <input id="Terms-of-Services-checkbox"
                    checked={ischecked}
                    type="checkbox"
                    onChange={onChange}
                    value="" 
                    className="w-5 h-5 mr-4"/>
            <label htmlFor="Terms-of-Services-checkbox">
                I have read and agree to the{' '} 
                    <a href="/terms" className="underline">
                        Terms of Service
                    </a>
                </label>        
        </div>
    );
}
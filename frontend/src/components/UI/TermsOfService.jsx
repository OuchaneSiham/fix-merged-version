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
                    <a href="https://www.fortnite.com/id/register?redirect_uri=http%3A%2F%2Fwww.fortnite.com%2F%3Flang%3Den-US&client_id=a485a2fde2e343dfb7559d5efeaf35d9&lang=en-US" className="underline">
                        Terms of Service
                    </a>
                </label>        
        </div>
    );
}
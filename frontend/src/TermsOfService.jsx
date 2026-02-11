import { Link } from 'react-router-dom';

function TermsOfService() {
    return (
        <div style={{padding: "20px"}}>
            <h1>Terms of Service</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>1. Acceptance</h2>
            <p>By using this service, you accept these terms.</p>

            <h2>2. User Accounts</h2>
            <p>Keep your password secure. You're responsible for your account.</p>

            <h2>3. Acceptable Use</h2>
            <p>Don't harass users, upload malicious content, or break the law.</p>

            <h2>4. Termination</h2>
            <p>We can terminate accounts that violate these terms.</p>

            <Link to="/">Back to Home</Link>
        </div>
    );
}

export default TermsOfService;
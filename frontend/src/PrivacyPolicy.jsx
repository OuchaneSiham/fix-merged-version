import { Link } from 'react-router-dom';

function PrivacyPolicy() {
    return (
        <div style={{padding: "20px"}}>
            <h1>Privacy Policy</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>1. Information We Collect</h2>
            <p>We collect: username, email, password (encrypted), avatar, friend connections.</p>

            <h2>2. How We Use Your Information</h2>
            <p>To provide our service, authenticate users, and enable social features.</p>

            <h2>3. Data Security</h2>
            <p>We use bcrypt encryption, HTTPS, and JWT tokens.</p>

            <h2>4. Your Rights</h2>
            <p>You can access, update, and delete your data.</p>

            <Link to="/">Back to Home</Link>
        </div>
    );
}

export default PrivacyPolicy;
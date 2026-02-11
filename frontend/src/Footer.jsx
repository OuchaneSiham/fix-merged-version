import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer style={{
            borderTop: "1px solid #ccc",
            padding: "20px",
            marginTop: "50px",
            textAlign: "center"
        }}>
            <p>&copy; 2026 ft_transcendence</p>
            <Link to="/privacy" style={{margin: "0 15px"}}>Privacy Policy</Link>
            |
            <Link to="/terms" style={{margin: "0 15px"}}>Terms of Service</Link>
        </footer>
    );
}

export default Footer;
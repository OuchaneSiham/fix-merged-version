import { useNavigate } from 'react-router-dom';

export default function AdminSingin() {
    const navigate = useNavigate();
    
    return (
        <button 
            onClick={() => navigate('/admin-login')}
            className="w-full py-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors">
            Sign in as Admin
        </button>
    );
}
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '../auth/ProtectedRoute';
import CVManager from './CVManager';

const ADMIN_EMAIL = 'phamngocanh7679@gmail.com';

/**
 * Everything admin-related lives behind this lazy-loaded component so the
 * public portfolio does not download Supabase Auth/Storage on first paint.
 */
export default function AdminGate() {
    return (
        <AuthProvider>
            <ProtectedRoute allowedEmail={ADMIN_EMAIL}>
                <CVManager />
            </ProtectedRoute>
        </AuthProvider>
    );
}

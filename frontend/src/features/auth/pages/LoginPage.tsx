import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../../shared/layouts/AuthLayout';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types/auth.types';

/*
  To use your own background image, import it here:
  import myBg from '../../../assets/your-image.jpg';
  Then pass: <AuthLayout bgImage={myBg}>
*/

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(data: LoginCredentials) {
    const user = await login(data);
    navigate(`/${user.role}/dashboard`);
  }

  return (
    <AuthLayout>
      <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
    </AuthLayout>
  );
}

import AuthLayout from '../../../shared/layouts/AuthLayout';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types/auth.types';
import { authService } from '../services/authService';

/*
  To use your own background image, import it here:
  import myBg from '../../../assets/your-image.jpg';
  Then pass: <AuthLayout bgImage={myBg}>
*/

export default function LoginPage() {
  const { loading, error } = useAuth();

  async function handleLogin(data: LoginCredentials) {
    try {
      console.log("Submitting login...");

      const res = await authService.login(data);

      console.log("Response:", res);

      authService.saveUser(
        res.user,
        { accessToken: res.accessToken, refreshToken: res.refreshToken },
        !!data.rememberMe
      );

      window.location.href = "/home";
    } catch (err) {
      console.error("LOGIN ERROR:", err);
    }
  }

  return (
    <AuthLayout>
      <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
    </AuthLayout>
  );
}

import { useState } from 'react';
import { authService, LoginCredentials, RegisterCredentials, User } from '@/lib/auth';
import * as Dialog from '@radix-ui/react-dialog';
import { User as UserIcon, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  
  const [registerForm, setRegisterForm] = useState<RegisterCredentials>({
    username: '',
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(loginForm);
      onSuccess(response.user);
      onClose();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.register(registerForm);
      onSuccess(response.user);
      onClose();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (userNumber: 1 | 2) => {
    if (userNumber === 1) {
      setLoginForm({ email: 'alice@demo.com', password: 'demo123' });
    } else {
      setLoginForm({ email: 'bob@demo.com', password: 'demo123' });
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay id="auth_overlay_284759" className="fixed inset-0 bg-black/60 backdrop-blur-md z-50" />
        <Dialog.Content id="auth_content_639174" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-8 sm:p-10 lg:p-12 w-full max-w-[90vw] sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 z-50 mx-4">
          <div id="auth_header_172583" className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <UserIcon className="text-white" size={32} />
            </div>
            <Dialog.Title id="auth_title_804629" className="text-2xl font-bold text-slate-800">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Dialog.Title>
            <p className="text-slate-500 mt-2">
              {isLogin ? 'Sign in to your account' : 'Join the conversation'}
            </p>
          </div>

        {error && (
          <div id="auth-error" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        {isLogin && (
          <div id="demo_credentials_panel_352917" className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
            <h3 id="demo_title_718294" className="text-blue-700 font-semibold mb-4 text-sm flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              Demo Accounts
            </h3>
            <div id="demo_list_947536" className="space-y-3">
              <div id="demo_user_1_683428" className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100">
                <span className="text-slate-600 font-medium text-sm">alice@demo.com</span>
                <button
                  id="demo_fill_1_459173"
                  type="button"
                  onClick={() => fillDemoCredentials(1)}
                  className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200"
                >
                  Use
                </button>
              </div>
              <div id="demo_user_2_837162" className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100">
                <span className="text-slate-600 font-medium text-sm">bob@demo.com</span>
                <button
                  id="demo_fill_2_925847"
                  type="button"
                  onClick={() => fillDemoCredentials(2)}
                  className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200"
                >
                  Use
                </button>
              </div>
            </div>
          </div>
        )}

          {isLogin ? (
            <form id="login_form_542763" onSubmit={handleLogin} className="space-y-4">
              <div id="email_field_group_763928">
                <label id="email_label_318475" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div id="email_input_wrapper_852947" className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="email_input_294738"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    aria-describedby={error ? "auth-error" : undefined}
                  />
                </div>
              </div>
              <div id="password_field_group_618529">
                <label id="password_label_473816" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div id="password_input_wrapper_936274" className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="password_input_157394"
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    aria-describedby={error ? "auth-error" : undefined}
                  />
                  <button
                    id="password_toggle_842916"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button
                id="login_submit_button_507194"
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-lg hover:shadow-blue-500/25"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form id="register_form_635827" onSubmit={handleRegister} className="space-y-4">
              <div id="username_field_group_194738">
                <label id="username_label_825639" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div id="username_input_wrapper_347182" className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="username_input_629473"
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Choose a username"
                    required
                    minLength={3}
                    maxLength={20}
                  />
                </div>
              </div>
              <div id="register_email_field_group_582947">
                <label id="register_email_label_736184" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div id="register_email_input_wrapper_419573" className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="register_email_input_821746"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              <div id="register_password_field_group_538692">
                <label id="register_password_label_794825" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div id="register_password_input_wrapper_267391" className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="register_password_input_483756"
                    type={showPassword ? "text" : "password"}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Choose a password"
                    required
                    minLength={6}
                  />
                  <button
                    id="register_password_toggle_649283"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button
                id="register_submit_button_372948"
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-lg hover:shadow-blue-500/25"
              >
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </form>
          )}

          <div id="form_toggle_section_194536" className="mt-6 text-center">
            <button
              id="form_toggle_button_729348"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setShowPassword(false);
              }}
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

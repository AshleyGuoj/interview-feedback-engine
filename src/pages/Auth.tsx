import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Ticket, CheckCircle2, ArrowLeft } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import offermindIcon from '@/assets/offermind-icon.png';

export default function Auth() {
  const { t } = useTranslation();
  const { user, loading, signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const [signUpStep, setSignUpStep] = useState<'code' | 'details'>('code');
  const [inviteCode, setInviteCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', confirmPassword: '' });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(220,16%,96%)]">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(230,25%,35%)]" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await signIn(loginData.email, loginData.password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('auth.loginSuccess'));
    }
    setIsSubmitting(false);
  };

  const handleVerifyCode = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invitation code');
      return;
    }
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-invite-code', {
        body: { code: inviteCode.trim() },
      });
      if (error || !data?.valid) {
        toast.error(data?.error || 'Invalid invitation code');
        setIsVerifying(false);
        return;
      }
      toast.success('Invitation code verified!');
      setSignUpStep('details');
    } catch {
      toast.error('Verification failed');
    }
    setIsVerifying(false);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (signUpData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-invite-code', {
        body: {
          code: inviteCode.trim(),
          email: signUpData.email.trim(),
          password: signUpData.password,
        },
      });
      if (error || data?.error) {
        toast.error(data?.error || 'Sign up failed');
        setIsSubmitting(false);
        return;
      }
      const { error: signInError } = await signIn(signUpData.email.trim(), signUpData.password);
      if (signInError) {
        toast.error('Account created but login failed. Please sign in manually.');
        setActiveTab('login');
      } else {
        toast.success('Welcome to OfferMind! 🎉');
      }
    } catch {
      toast.error('Sign up failed');
    }
    setIsSubmitting(false);
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      localStorage.removeItem('offermind_demo_seeded');
      await supabase.functions.invoke('create-demo-user');
      const { error } = await signIn('demo@offermind.app', 'demo123456');
      if (error) {
        toast.error('Demo login failed. Please try again.');
      } else {
        toast.success('Welcome to OfferMind! Explore the demo workspace.');
      }
    } catch {
      toast.error('Demo login failed');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleTabSwitch = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    if (tab === 'signup') {
      setSignUpStep('code');
      setInviteCode('');
      setSignUpData({ email: '', password: '', confirmPassword: '' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,16%,96%)] p-4">
      {/* Language switcher */}
      <div className="absolute top-5 right-5">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-[420px]">
        {/* Logo + Branding — outside the card for breathing room */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 mb-3 overflow-hidden rounded-2xl" style={{ background: 'hsl(230, 25%, 96%)' }}>
            <img
              src={offermindIcon}
              alt="OfferMind"
              className="w-full h-full object-cover scale-[1.6]"
            />
          </div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[hsl(230,30%,18%)]">
            OfferMind
          </h1>
          <p className="mt-1 text-[13px] font-normal tracking-[0.01em] text-[hsl(220,10%,50%)]">
            Career Intelligence Platform
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-[hsl(220,14%,90%)] bg-white shadow-[0_1px_3px_hsl(220,14%,80%/0.12),0_6px_24px_hsl(220,14%,80%/0.08)] p-7">
          {/* Demo CTA */}
          <button
            onClick={handleDemoLogin}
            disabled={isDemoLoading}
            className="w-full h-11 rounded-xl text-[14px] font-medium text-white transition-all
              bg-[hsl(230,45%,32%)] hover:bg-[hsl(230,45%,28%)] active:bg-[hsl(230,45%,25%)]
              shadow-[0_1px_2px_hsl(230,45%,20%/0.2)] hover:shadow-[0_2px_8px_hsl(230,45%,20%/0.25)]
              disabled:opacity-60 disabled:pointer-events-none
              flex items-center justify-center gap-2"
          >
            {isDemoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            Explore Demo
          </button>
          <p className="text-[11px] text-center text-[hsl(220,10%,55%)] mt-2.5 mb-5">
            No signup needed — pre-loaded with sample interview data
          </p>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[hsl(220,14%,91%)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[11px] text-[hsl(220,10%,60%)] uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg bg-[hsl(220,16%,95%)] p-0.5 mb-5">
            <button
              type="button"
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 py-2 text-[13px] font-medium rounded-md transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-[hsl(230,30%,18%)] shadow-sm'
                  : 'text-[hsl(220,10%,50%)] hover:text-[hsl(230,30%,18%)]'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('signup')}
              className={`flex-1 py-2 text-[13px] font-medium rounded-md transition-all ${
                activeTab === 'signup'
                  ? 'bg-white text-[hsl(230,30%,18%)] shadow-sm'
                  : 'text-[hsl(220,10%,50%)] hover:text-[hsl(230,30%,18%)]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Forms */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-[12px] font-medium text-[hsl(220,10%,40%)]">
                  {t('auth.email')}
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-[hsl(220,14%,88%)] bg-white text-[14px] text-[hsl(230,30%,18%)] placeholder:text-[hsl(220,10%,65%)]
                    focus:outline-none focus:ring-2 focus:ring-[hsl(230,45%,55%/0.25)] focus:border-[hsl(230,45%,55%)]
                    transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="block text-[12px] font-medium text-[hsl(220,10%,40%)]">
                  {t('auth.password')}
                </label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-[hsl(220,14%,88%)] bg-white text-[14px] text-[hsl(230,30%,18%)] placeholder:text-[hsl(220,10%,65%)]
                    focus:outline-none focus:ring-2 focus:ring-[hsl(230,45%,55%/0.25)] focus:border-[hsl(230,45%,55%)]
                    transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 rounded-xl text-[13px] font-medium transition-all
                  border border-[hsl(220,14%,85%)] bg-white text-[hsl(230,30%,18%)]
                  hover:bg-[hsl(220,16%,97%)] hover:border-[hsl(220,14%,80%)]
                  active:bg-[hsl(220,16%,95%)]
                  disabled:opacity-50 disabled:pointer-events-none
                  flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {t('auth.login')}
              </button>
            </form>
          ) : signUpStep === 'code' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="invite-code" className="flex items-center gap-1.5 text-[12px] font-medium text-[hsl(220,10%,40%)]">
                  <Ticket className="w-3 h-3" />
                  Invitation Code
                </label>
                <input
                  id="invite-code"
                  type="text"
                  placeholder="ENTER CODE"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                  className="w-full h-10 px-3 rounded-lg border border-[hsl(220,14%,88%)] bg-white text-[14px] text-[hsl(230,30%,18%)] placeholder:text-[hsl(220,10%,65%)]
                    uppercase tracking-widest font-mono text-center
                    focus:outline-none focus:ring-2 focus:ring-[hsl(230,45%,55%/0.25)] focus:border-[hsl(230,45%,55%)]
                    transition-all"
                />
              </div>
              <button
                onClick={handleVerifyCode}
                disabled={isVerifying || !inviteCode.trim()}
                className="w-full h-10 rounded-xl text-[13px] font-medium transition-all
                  border border-[hsl(220,14%,85%)] bg-white text-[hsl(230,30%,18%)]
                  hover:bg-[hsl(220,16%,97%)] hover:border-[hsl(220,14%,80%)]
                  disabled:opacity-50 disabled:pointer-events-none
                  flex items-center justify-center gap-2"
              >
                {isVerifying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Verify Code
              </button>
              <p className="text-[11px] text-center text-[hsl(220,10%,55%)]">
                Interested in early access?{' '}
                <button
                  type="button"
                  onClick={() => window.open('https://www.linkedin.com/in/jiaqi-guo-02ba0329b/', '_blank', 'noopener,noreferrer')}
                  className="text-[hsl(230,45%,40%)] hover:text-[hsl(230,45%,30%)] hover:underline font-medium cursor-pointer bg-transparent border-none p-0 inline"
                >
                  Connect on LinkedIn
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[hsl(145,30%,96%)] border border-[hsl(145,25%,88%)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(145,40%,40%)] shrink-0" />
                <span className="text-[12px] font-medium text-[hsl(145,30%,30%)]">
                  Code <span className="font-mono tracking-wider">{inviteCode}</span> verified
                </span>
                <button
                  type="button"
                  className="ml-auto text-[11px] text-[hsl(220,10%,55%)] hover:text-[hsl(230,30%,18%)] flex items-center gap-0.5"
                  onClick={() => setSignUpStep('code')}
                >
                  <ArrowLeft className="w-3 h-3" />
                  Change
                </button>
              </div>
              <form onSubmit={handleCreateAccount} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="signup-email" className="block text-[12px] font-medium text-[hsl(220,10%,40%)]">
                    {t('auth.email')}
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-[hsl(220,14%,88%)] bg-white text-[14px] text-[hsl(230,30%,18%)] placeholder:text-[hsl(220,10%,65%)]
                      focus:outline-none focus:ring-2 focus:ring-[hsl(230,45%,55%/0.25)] focus:border-[hsl(230,45%,55%)]
                      transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="signup-password" className="block text-[12px] font-medium text-[hsl(220,10%,40%)]">
                    {t('auth.password')}
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-[hsl(220,14%,88%)] bg-white text-[14px] text-[hsl(230,30%,18%)] placeholder:text-[hsl(220,10%,65%)]
                      focus:outline-none focus:ring-2 focus:ring-[hsl(230,45%,55%/0.25)] focus:border-[hsl(230,45%,55%)]
                      transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="signup-confirm" className="block text-[12px] font-medium text-[hsl(220,10%,40%)]">
                    Confirm Password
                  </label>
                  <input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-[hsl(220,14%,88%)] bg-white text-[14px] text-[hsl(230,30%,18%)] placeholder:text-[hsl(220,10%,65%)]
                      focus:outline-none focus:ring-2 focus:ring-[hsl(230,45%,55%/0.25)] focus:border-[hsl(230,45%,55%)]
                      transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-xl text-[13px] font-medium transition-all
                    border border-[hsl(220,14%,85%)] bg-white text-[hsl(230,30%,18%)]
                    hover:bg-[hsl(220,16%,97%)] hover:border-[hsl(220,14%,80%)]
                    disabled:opacity-50 disabled:pointer-events-none
                    flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Account
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-[hsl(220,10%,60%)]">
          Structured interview intelligence for strategic career decisions.
        </p>
      </div>
    </div>
  );
}

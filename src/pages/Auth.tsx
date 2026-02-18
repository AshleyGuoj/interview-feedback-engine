import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Ticket, CheckCircle2, ArrowLeft, BarChart3, TrendingUp, Shield } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import offermindIcon from '@/assets/offermind-icon.png';

/* ── Brand Panel (desktop only) ─────────────────────────────── */
function BrandPanel() {
  const valueProps = [
    { icon: BarChart3, text: 'Structured interview analytics across all your applications' },
    { icon: TrendingUp, text: 'Track competency growth and identify patterns over time' },
    { icon: Shield, text: 'Private, secure career intelligence you own' },
  ];

  return (
    <div className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-[hsl(232,30%,14%)] p-12 xl:p-16">
      {/* Geometric decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[hsl(232,40%,30%)] opacity-[0.07] blur-3xl" />
        <div className="absolute top-1/4 -left-16 w-48 h-48 rounded-full bg-[hsl(232,50%,45%)] opacity-[0.05] blur-2xl" />
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 rounded-full bg-[hsl(260,35%,40%)] opacity-[0.06] blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="animate-fade-in-up">
          <div className="w-14 h-14 mb-5 overflow-hidden rounded-2xl bg-white/10">
            <img src={offermindIcon} alt="OfferMind" className="w-full h-full object-cover scale-[1.6]" />
          </div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] leading-tight text-white/90">
            Turn every interview<br />into a strategic advantage
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-white/45 max-w-[340px]">
            OfferMind transforms raw interview experiences into structured career intelligence.
          </p>
        </div>

        <div className="mt-12 space-y-5">
          {valueProps.map((vp, i) => (
            <div
              key={i}
              className="animate-fade-in-up flex items-start gap-3.5"
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08]">
                <vp.icon className="w-4 h-4 text-white/75" />
              </div>
              <p className="text-[13px] leading-relaxed text-white/70">{vp.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="relative z-10 text-[11px] text-white/25 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        © 2026 OfferMind
      </p>
    </div>
  );
}

/* ── Auth Form Panel ─────────────────────────────────────────── */
function AuthFormPanel() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const [signUpStep, setSignUpStep] = useState<'code' | 'details'>('code');
  const [inviteCode, setInviteCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', confirmPassword: '' });

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

  const inputCls =
    'w-full h-10 px-3 rounded-lg border border-[hsl(232,12%,88%)] bg-white text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all';

  return (
    <div className="flex min-h-screen lg:min-h-0 flex-col items-center justify-center bg-[hsl(var(--background))] lg:bg-white p-6 sm:p-8">
      {/* Language switcher */}
      <div className="absolute top-5 right-5 z-20">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-[400px] animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        {/* Mobile-only branding */}
        <div className="flex flex-col items-center mb-8 lg:hidden">
          <div className="w-14 h-14 mb-3 overflow-hidden rounded-2xl bg-secondary">
            <img src={offermindIcon} alt="OfferMind" className="w-full h-full object-cover scale-[1.6]" />
          </div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground">OfferMind</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">Career Intelligence Platform</p>
        </div>

        {/* Desktop heading (no logo — it's on the left) */}
        <div className="hidden lg:block mb-8">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground">Welcome back</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">Sign in to your OfferMind workspace</p>
        </div>

        {/* Card wrapper — styled on mobile, flat on desktop */}
        <div className="rounded-2xl border border-border bg-white shadow-[var(--shadow-md)] lg:border-0 lg:shadow-none p-7 lg:p-0">
          {/* Demo CTA */}
          <button
            onClick={handleDemoLogin}
            disabled={isDemoLoading}
            className="w-full h-11 rounded-xl text-[14px] font-medium text-primary-foreground transition-all
              bg-primary hover:bg-primary/90 active:bg-primary/80
              shadow-[0_1px_2px_hsl(232,36%,20%/0.2)] hover:shadow-[0_2px_8px_hsl(232,36%,20%/0.25)]
              disabled:opacity-60 disabled:pointer-events-none
              flex items-center justify-center gap-2"
          >
            {isDemoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            Explore Demo
          </button>
          <p className="text-[11px] text-center text-muted-foreground mt-2.5 mb-5">
            No signup needed — pre-loaded with sample interview data
          </p>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[11px] text-muted-foreground uppercase tracking-wider">or</span>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg bg-secondary p-0.5 mb-5">
            <button
              type="button"
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 py-2 text-[13px] font-medium rounded-md transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('signup')}
              className={`flex-1 py-2 text-[13px] font-medium rounded-md transition-all ${
                activeTab === 'signup'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Forms */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-[12px] font-medium text-muted-foreground">
                  {t('auth.email')}
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="block text-[12px] font-medium text-muted-foreground">
                  {t('auth.password')}
                </label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  className={inputCls}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 rounded-xl text-[13px] font-medium transition-all
                  border border-border bg-white text-foreground
                  hover:bg-secondary hover:border-border/80
                  active:bg-muted
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
                <label htmlFor="invite-code" className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
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
                  className={`${inputCls} uppercase tracking-widest font-mono text-center`}
                />
              </div>
              <button
                onClick={handleVerifyCode}
                disabled={isVerifying || !inviteCode.trim()}
                className="w-full h-10 rounded-xl text-[13px] font-medium transition-all
                  border border-border bg-white text-foreground
                  hover:bg-secondary hover:border-border/80
                  disabled:opacity-50 disabled:pointer-events-none
                  flex items-center justify-center gap-2"
              >
                {isVerifying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Verify Code
              </button>
              <p className="text-[11px] text-center text-muted-foreground">
                Interested in early access?{' '}
                <button
                  type="button"
                  onClick={() => window.open('https://www.linkedin.com/in/jiaqi-guo-02ba0329b/', '_blank', 'noopener,noreferrer')}
                  className="text-primary hover:text-primary/80 hover:underline font-medium cursor-pointer bg-transparent border-none p-0 inline"
                >
                  Connect on LinkedIn
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[hsl(var(--accent-sage))]/[0.08] border border-[hsl(var(--accent-sage))]/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--accent-sage))] shrink-0" />
                <span className="text-[12px] font-medium text-[hsl(var(--accent-sage))]">
                  Code <span className="font-mono tracking-wider">{inviteCode}</span> verified
                </span>
                <button
                  type="button"
                  className="ml-auto text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                  onClick={() => setSignUpStep('code')}
                >
                  <ArrowLeft className="w-3 h-3" />
                  Change
                </button>
              </div>
              <form onSubmit={handleCreateAccount} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="signup-email" className="block text-[12px] font-medium text-muted-foreground">
                    {t('auth.email')}
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="signup-password" className="block text-[12px] font-medium text-muted-foreground">
                    {t('auth.password')}
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="signup-confirm" className="block text-[12px] font-medium text-muted-foreground">
                    Confirm Password
                  </label>
                  <input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    required
                    className={inputCls}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-xl text-[13px] font-medium transition-all
                    border border-border bg-white text-foreground
                    hover:bg-secondary hover:border-border/80
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
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Structured interview intelligence for strategic career decisions.
        </p>
      </div>
    </div>
  );
}

/* ── Main Auth Page ──────────────────────────────────────────── */
export default function Auth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <BrandPanel />
      <AuthFormPanel />
    </div>
  );
}

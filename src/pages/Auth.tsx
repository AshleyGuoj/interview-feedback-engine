import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Play, Ticket, CheckCircle2, ArrowLeft } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import offermindIcon from '@/assets/offermind-icon.png';

export default function Auth() {
  const { t } = useTranslation();
  const { user, loading, signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Signup step: 'code' = enter invite code, 'details' = enter email/password
  const [signUpStep, setSignUpStep] = useState<'code' | 'details'>('code');
  const [inviteCode, setInviteCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', confirmPassword: '' });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={offermindIcon} alt="OfferMind" className="w-24 h-24 object-contain" />
          </div>
          <CardTitle className="text-2xl">OfferMind</CardTitle>
          <CardDescription>AI-Powered Interview Intelligence Platform</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Try Demo Button */}
          <Button
            className="w-full mb-4 h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            onClick={handleDemoLogin}
            disabled={isDemoLoading}
          >
            {isDemoLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Play className="w-5 h-5 mr-2" />
            )}
            Try Demo Instantly
          </Button>
          <p className="text-xs text-center text-muted-foreground mb-4">
            No signup needed — explore with pre-loaded interview data
          </p>

          <div className="relative mb-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === 'login' ? 'default' : 'outline'}
              className="flex-1"
              type="button"
              onClick={() => handleTabSwitch('login')}
            >
              {t('auth.login')}
            </Button>
            <Button
              variant={activeTab === 'signup' ? 'default' : 'outline'}
              className="flex-1"
              type="button"
              onClick={() => handleTabSwitch('signup')}
            >
              Sign Up with Invite
            </Button>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">{t('auth.email')}</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">{t('auth.password')}</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t('auth.login')}
              </Button>
            </form>
          ) : signUpStep === 'code' ? (
            /* Step 1: Verify Invitation Code */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-code" className="flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5" />
                  Invitation Code
                </Label>
                <Input
                  id="invite-code"
                  type="text"
                  placeholder="ENTER YOUR INVITE CODE"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="uppercase tracking-widest font-mono text-center"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleVerifyCode}
                disabled={isVerifying || !inviteCode.trim()}
              >
                {isVerifying ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Verify Code
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Interested in early access?{' '}
                <button
                  type="button"
                  onClick={() => window.open('https://www.linkedin.com/in/jiaqi-guo-02ba0329b/', '_blank', 'noopener,noreferrer')}
                  className="text-primary hover:underline font-medium cursor-pointer bg-transparent border-none p-0 inline"
                >
                  Connect on LinkedIn
                </button>{' '}
                to request an invitation.
              </p>
            </div>
          ) : (
            /* Step 2: Create Account */
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-md bg-primary/5 border border-primary/20">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium">
                  Code <span className="font-mono tracking-wider">{inviteCode}</span> verified
                </span>
                <button
                  type="button"
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  onClick={() => setSignUpStep('code')}
                >
                  <ArrowLeft className="w-3 h-3" />
                  Change
                </button>
              </div>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('auth.email')}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('auth.password')}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

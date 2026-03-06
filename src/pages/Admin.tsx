import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserTable } from '@/components/admin/UserTable';
import { InvitationCodesPanel } from '@/components/admin/InvitationCodesPanel';
import { UserActivityPanel } from '@/components/admin/UserActivityPanel';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Shield } from 'lucide-react';

export default function Admin() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: result, error: fnError } = await supabase.functions.invoke('admin-stats');
        if (fnError) throw fnError;
        if (result?.error) throw new Error(result.error);
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh] text-destructive">
          Error: {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold">Operations Dashboard</h1>
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users ({data?.summary?.totalUsers || 0})</TabsTrigger>
            <TabsTrigger value="codes">Invite Codes</TabsTrigger>
            <TabsTrigger value="activity">User Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserTable users={data?.users || []} summary={data?.summary || {}} />
          </TabsContent>

          <TabsContent value="codes">
            <InvitationCodesPanel />
          </TabsContent>

          <TabsContent value="activity">
            <UserActivityPanel users={data?.users || []} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  jobCount: number;
  activityCount: number;
  lastAction: string | null;
  interviewsAnalyzed: number;
}

interface UserTableProps {
  users: AdminUser[];
  summary: {
    totalUsers: number;
    todayUsers: number;
    weekUsers: number;
    activeUsers: number;
  };
}

export function UserTable({ users, summary }: UserTableProps) {
  const kpis = [
    { label: 'Total Users', value: summary.totalUsers, icon: Users, color: 'text-primary' },
    { label: 'Today', value: summary.todayUsers, icon: UserPlus, color: 'text-emerald-500' },
    { label: 'This Week', value: summary.weekUsers, icon: UserPlus, color: 'text-blue-500' },
    { label: 'Active (7d)', value: summary.activeUsers, icon: Activity, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              <div>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Sign-in</TableHead>
                <TableHead className="text-center">Jobs</TableHead>
                <TableHead className="text-center">Activities</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-sm">{user.email}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {user.last_sign_in_at
                      ? formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true })
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-center">{user.jobCount}</TableCell>
                  <TableCell className="text-center">{user.activityCount}</TableCell>
                  <TableCell>
                    {user.email_confirmed_at ? (
                      <Badge variant="default">Verified</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

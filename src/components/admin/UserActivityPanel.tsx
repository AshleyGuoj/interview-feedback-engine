import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  jobCount: number;
  activityCount: number;
  lastAction: string | null;
  interviewsAnalyzed: number;
}

interface UserActivityPanelProps {
  users: AdminUser[];
}

export function UserActivityPanel({ users }: UserActivityPanelProps) {
  // Sort by activity count descending
  const sorted = [...users].sort((a, b) => b.activityCount - a.activityCount);

  const totalJobs = users.reduce((s, u) => s + u.jobCount, 0);
  const totalActivities = users.reduce((s, u) => s + u.activityCount, 0);
  const totalInterviews = users.reduce((s, u) => s + u.interviewsAnalyzed, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{totalJobs}</div>
            <div className="text-xs text-muted-foreground">Total Jobs Created</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{totalActivities}</div>
            <div className="text-xs text-muted-foreground">Total Activities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{totalInterviews}</div>
            <div className="text-xs text-muted-foreground">Interviews Analyzed</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="text-center">Jobs</TableHead>
                <TableHead className="text-center">Activities</TableHead>
                <TableHead className="text-center">Interviews</TableHead>
                <TableHead>Last Action</TableHead>
                <TableHead>Engagement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((user) => {
                const engagement = user.activityCount > 10
                  ? 'high'
                  : user.activityCount > 3
                  ? 'medium'
                  : user.activityCount > 0
                  ? 'low'
                  : 'none';

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-sm">{user.email}</TableCell>
                    <TableCell className="text-center">{user.jobCount}</TableCell>
                    <TableCell className="text-center">{user.activityCount}</TableCell>
                    <TableCell className="text-center">{user.interviewsAnalyzed}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {user.lastAction
                        ? formatDistanceToNow(new Date(user.lastAction), { addSuffix: true })
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={engagement === 'high' ? 'default' : engagement === 'medium' ? 'secondary' : 'outline'}
                      >
                        {engagement}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

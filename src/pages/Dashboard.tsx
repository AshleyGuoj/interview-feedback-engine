import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Clock, Trophy, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Active Applications', value: 4, icon: Briefcase, color: 'text-blue-500' },
    { label: 'Interviews This Week', value: 2, icon: Clock, color: 'text-amber-500' },
    { label: 'Offers Received', value: 1, icon: Trophy, color: 'text-emerald-500' },
    { label: 'Response Rate', value: '68%', icon: TrendingUp, color: 'text-purple-500' },
  ];

  const recentActivity = [
    { company: 'Google', action: 'Round 2 scheduled for Jan 28', time: '2 hours ago' },
    { company: 'Airbnb', action: 'Received offer!', time: '1 day ago' },
    { company: 'ByteDance', action: 'HR Screen completed', time: '2 days ago' },
  ];

  const upcomingInterviews = [
    { company: 'Google', role: 'Senior PM', stage: 'Round 2', date: 'Jan 28, 2024', time: '10:00 AM PST' },
    { company: 'ByteDance', role: 'Product Lead', stage: 'Round 1', date: 'Jan 30, 2024', time: '7:00 PM CST' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your job search overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Interviews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Interviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingInterviews.map((interview, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => navigate('/jobs/1')}
                >
                  <div>
                    <p className="font-medium">{interview.company}</p>
                    <p className="text-sm text-muted-foreground">
                      {interview.role} • {interview.stage}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{interview.date}</p>
                    <p className="text-xs text-muted-foreground">{interview.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.company}</span>
                      {' — '}
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">Ready to prepare for your next interview?</h3>
                <p className="text-muted-foreground text-sm">
                  Use our AI-powered interview analyzer to get actionable feedback.
                </p>
              </div>
              <button
                onClick={() => navigate('/analyze')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Analyze Interview
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

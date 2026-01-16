import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function Timeline() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Interview Timeline</h1>
          <p className="text-muted-foreground mt-1">
            View all your interviews in a unified calendar view.
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Construction className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-lg mb-2">Coming Soon</CardTitle>
            <p className="text-muted-foreground max-w-md mx-auto">
              A unified timeline view showing all your interviews across different companies, 
              with calendar integration and smart reminders.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

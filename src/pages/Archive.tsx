import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Archive as ArchiveIcon } from 'lucide-react';

export default function Archive() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Archive</h1>
          <p className="text-muted-foreground mt-1">
            View your closed applications and past interview experiences.
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <ArchiveIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-lg mb-2">No Archived Jobs</CardTitle>
            <p className="text-muted-foreground max-w-md mx-auto">
              When you close job applications, they'll appear here for future reference
              and to help you learn from past experiences.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

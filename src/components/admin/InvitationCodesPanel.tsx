import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface InvitationCode {
  id: string;
  code: string;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export function InvitationCodesPanel() {
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [maxUses, setMaxUses] = useState(100);

  const fetchCodes = async () => {
    const { data } = await supabase
      .from('invitation_codes')
      .select('*')
      .order('created_at', { ascending: false });
    setCodes((data as InvitationCode[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleCreate = async () => {
    if (!newCode.trim()) return;
    const { error } = await supabase
      .from('invitation_codes')
      .insert({ code: newCode.trim().toUpperCase(), max_uses: maxUses });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Created', description: `Code ${newCode.toUpperCase()} created` });
      setNewCode('');
      setMaxUses(100);
      setDialogOpen(false);
      fetchCodes();
    }
  };

  const toggleActive = async (id: string, currentlyActive: boolean) => {
    await supabase
      .from('invitation_codes')
      .update({ is_active: !currentlyActive })
      .eq('id', id);
    fetchCodes();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Invitation Codes</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Create Code</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Invitation Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Code</Label>
                <Input 
                  value={newCode} 
                  onChange={(e) => setNewCode(e.target.value)} 
                  placeholder="e.g. CAMPUS2026"
                  className="uppercase"
                />
              </div>
              <div>
                <Label>Max Uses</Label>
                <Input 
                  type="number" 
                  value={maxUses} 
                  onChange={(e) => setMaxUses(Number(e.target.value))} 
                />
              </div>
              <Button onClick={handleCreate} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead className="text-center">Used / Max</TableHead>
                <TableHead className="text-center">Usage %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono font-medium">{code.code}</TableCell>
                  <TableCell className="text-center">
                    {code.current_uses} / {code.max_uses}
                  </TableCell>
                  <TableCell className="text-center">
                    {Math.round((code.current_uses / code.max_uses) * 100)}%
                  </TableCell>
                  <TableCell>
                    {code.is_active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(code.id, code.is_active)}
                    >
                      {code.is_active ? (
                        <ToggleRight className="w-4 h-4 text-primary" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
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

import { FC, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Search, ShieldCheck, ShieldOff, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminUsers } from '@/features/admin/api/adminApi';
import { useUpdateAdminUser } from '@/features/admin/api/adminApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import type { User, UserRole } from '@/types/global';

// ─── Constants ────────────────────────────────────────────────
const PAGE_SIZE = 5;

type RoleFilter = 'ALL' | UserRole;

// ─── Sub-components ───────────────────────────────────────────

const RoleBadge: FC<{ role: UserRole }> = ({ role }) => {
  switch (role) {
    case 'ADMIN':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Admin</Badge>;
    case 'DOCTOR':
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Doctor</Badge>;
    case 'PATIENT':
      return (
        <Badge variant="outline" className="border-slate-400 text-slate-600">
          Patient
        </Badge>
      );
  }
};

const StatusBadge: FC<{ isActive: boolean }> = ({ isActive }) => {
  return isActive ? (
    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
  ) : (
    <Badge variant="outline" className="border-red-400 text-red-600 bg-red-50">
      Blocked
    </Badge>
  );
};

// ─── Main Component ───────────────────────────────────────────

export const UserManagement: FC = () => {
  const { data: users, isLoading, isError, error, refetch } = useAdminUsers();
  const { mutate: updateUser, isPending } = useUpdateAdminUser();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [page, setPage] = useState(1);

  // ── Filter + Search ──
  const filtered = useMemo(() => {
    if (!users) return [];
    return users.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const matchesSearch =
        fullName.includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 on filter/search change
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value as RoleFilter);
    setPage(1);
  };

  // ── Actions ──
  const handleApprove = (user: User) => {
    updateUser(
      { id: user.id, updates: { is_approved: true } },
      {
        onSuccess: () => toast.success(`${user.first_name} ${user.last_name} approved`),
        onError: () => toast.error('Failed to approve user. Please try again.'),
      }
    );
  };

  const handleToggleBlock = (user: User) => {
    const nextState = !user.is_active;
    updateUser(
      { id: user.id, updates: { is_active: nextState } },
      {
        onSuccess: () =>
          toast.success(
            `${user.first_name} ${user.last_name} ${nextState ? 'unblocked' : 'blocked'}`
          ),
        onError: () => toast.error('Failed to update user. Please try again.'),
      }
    );
  };

  // ── Render Guards ──
  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : 'Failed to load users'}
        onRetry={refetch}
      />
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">User Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ── Toolbar: Search + Role Filter ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs value={roleFilter} onValueChange={handleRoleFilter}>
            <TabsList>
              <TabsTrigger value="ALL">All</TabsTrigger>
              <TabsTrigger value="PATIENT">Patients</TabsTrigger>
              <TabsTrigger value="DOCTOR">Doctors</TabsTrigger>
              <TabsTrigger value="ADMIN">Admins</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-foreground">Name</TableHead>
                <TableHead className="font-semibold text-foreground">Email</TableHead>
                <TableHead className="font-semibold text-foreground">Role</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <StatusBadge isActive={user.is_active} />
                        {!user.is_approved && user.role !== 'ADMIN' && (
                          <span className="text-xs text-amber-600 font-medium">
                            Pending Approval
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Approve — only for unapproved non-admins */}
                        {!user.is_approved && user.role !== 'ADMIN' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleApprove(user)}
                            disabled={isPending}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                        )}

                        {/* Block / Unblock — not for admins */}
                        {user.role !== 'ADMIN' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 ${
                              user.is_active
                                ? 'text-muted-foreground hover:text-destructive'
                                : 'text-emerald-600 hover:text-emerald-700'
                            }`}
                            onClick={() => handleToggleBlock(user)}
                            disabled={isPending}
                            title={user.is_active ? 'Block User' : 'Unblock User'}
                          >
                            {user.is_active ? (
                              <ShieldOff className="h-4 w-4" />
                            ) : (
                              <ShieldCheck className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination Footer ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground">
              {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
            </span>{' '}
            –{' '}
            <span className="font-medium text-foreground">
              {Math.min(page * PAGE_SIZE, filtered.length)}
            </span>{' '}
            of <span className="font-medium text-foreground">{filtered.length}</span> users
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

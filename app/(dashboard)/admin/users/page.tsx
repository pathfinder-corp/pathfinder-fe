'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { 
  Search, 
  MoreVertical, 
  User,
  Loader2,
  Pencil,
  Eye,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Ban,
  CheckCircle,
  GraduationCap,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { adminService } from '@/services';
import type { 
  IAdminUser, 
  IAdminUserDetail,
  IAdminUsersParams,
  UserRole,
  UserStatus,
  SortField,
  SortOrder
} from '@/types';
import { useDebounceValue } from 'usehooks-ts';
import { ITEMS_PER_PAGE, SORT_ORDER, USER_ROLES, USER_STATUS } from '@/constants';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type RoleFilter = UserRole | 'all';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<IAdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch] = useDebounceValue(searchQuery, 500);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SORT_ORDER.DESC);

  const [selectedUser, setSelectedUser] = useState<IAdminUserDetail | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState<boolean>(false);
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState<boolean>(false);
  const [userToBan, setUserToBan] = useState<IAdminUser | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState<boolean>(false);

  const [isRevokeMentorDialogOpen, setIsRevokeMentorDialogOpen] = useState<boolean>(false);
  const [userToRevoke, setUserToRevoke] = useState<IAdminUser | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>('');
  const [isRevoking, setIsRevoking] = useState<boolean>(false);

  const [isRoleChangeConfirmDialogOpen, setIsRoleChangeConfirmDialogOpen] = useState<boolean>(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{ userId: string; newRole: UserRole; previousRole: UserRole } | null>(null);

  const [editRole, setEditRole] = useState<UserRole>(USER_ROLES.STUDENT);
  const [editStatus, setEditStatus] = useState<UserStatus>(USER_STATUS.ACTIVE);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const params: IAdminUsersParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sortBy,
        sortOrder,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }

      const response = await adminService.getUsers(params);
      setUsers(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalUsers(response.meta.total);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load users';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, roleFilter, sortBy, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC);
    } else {
      setSortBy(field);
      setSortOrder(SORT_ORDER.DESC);
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="size-5 ml-2 opacity-50" />;
    }
    return sortOrder === SORT_ORDER.ASC 
      ? <ArrowUp className="size-5 ml-2" />
      : <ArrowDown className="size-5 ml-2" />;
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter]);

  const handleViewUser = async (user: IAdminUser) => {
    try {
      setIsLoadingAction(true);
      const userDetail = await adminService.getUserById(user.id);
      setSelectedUser(userDetail);
      setIsViewDialogOpen(true);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load user details';
      toast.error(errorMessage);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleEditUser = async (user: IAdminUser) => {
    try {
      setIsLoadingAction(true);
      const userDetail = await adminService.getUserById(user.id);
      setSelectedUser(userDetail);
      setEditRole(userDetail.role);
      setEditStatus(userDetail.status);
      setIsEditDialogOpen(true);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load user details';
      toast.error(errorMessage);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    if (selectedUser.status === USER_STATUS.SUSPENDED && editStatus !== USER_STATUS.SUSPENDED) {
      toast.error('Cannot change status of suspended user. Please use Unban action instead.');
      return;
    }

    if (editStatus === USER_STATUS.SUSPENDED && selectedUser.status !== USER_STATUS.SUSPENDED) {
      toast.error('Cannot set status to suspended. Please use Ban action instead.');
      return;
    }

    if (selectedUser.role === USER_ROLES.MENTOR && editRole !== USER_ROLES.MENTOR) {
      setPendingRoleChange({
        userId: selectedUser.id,
        newRole: editRole,
        previousRole: selectedUser.role
      });
      setIsRoleChangeConfirmDialogOpen(true);
      return;
    }

    await performRoleUpdate(selectedUser.id, editRole, editStatus);
  };

  const performRoleUpdate = async (userId: string, newRole: UserRole, newStatus: UserStatus) => {
    try {
      setIsLoadingAction(true);
      const previousUser = users.find(u => u.id === userId);
      const wasMentor = previousUser?.role === USER_ROLES.MENTOR;
      
      await adminService.updateUser(userId, {
        role: newRole,
        status: newStatus,
      });
      
      toast.success('User updated successfully');
      
      if (wasMentor && newRole !== USER_ROLES.MENTOR) {
        toast.info('Mentor profile has been permanently deleted', {
          description: 'The mentor profile and all associated data have been removed.',
          duration: 5000,
        });
      }
      
      setIsEditDialogOpen(false);
      setIsRoleChangeConfirmDialogOpen(false);
      setPendingRoleChange(null);
      fetchUsers();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update user';
      toast.error(errorMessage);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    await performRoleUpdate(pendingRoleChange.userId, pendingRoleChange.newRole, editStatus);
  };

  const handleBanUser = async () => {
    if (!userToBan) return;

    try {
      setIsLoadingAction(true);
      await adminService.banUser(userToBan.id);
      toast.success('User banned successfully');
      setIsBanDialogOpen(false);
      setUserToBan(null);
      fetchUsers();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to ban user';
      toast.error(errorMessage);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!userToBan) return;

    try {
      setIsLoadingAction(true);
      await adminService.unbanUser(userToBan.id);
      toast.success('User unbanned successfully');
      setIsUnbanDialogOpen(false);
      setUserToBan(null);
      fetchUsers();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to unban user';
      toast.error(errorMessage);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleRevokeMentor = async () => {
    if (!userToRevoke || !revokeReason.trim()) {
      toast.error('Please provide a reason for revoking mentor status');
      return;
    }

    try {
      setIsRevoking(true);
      await adminService.revokeMentorStatus(userToRevoke.id, {
        reason: revokeReason.trim()
      });
      
      toast.success('Mentor status revoked successfully', {
        description: 'The mentor profile has been permanently deleted.',
        duration: 5000,
      });
      
      setIsRevokeMentorDialogOpen(false);
      setUserToRevoke(null);
      setRevokeReason('');
      fetchUsers();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to revoke mentor status';
      toast.error(errorMessage);
    } finally {
      setIsRevoking(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case USER_ROLES.MENTOR:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    if (status === USER_STATUS.ACTIVE) {
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
    if (status === USER_STATUS.SUSPENDED) {
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
    return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalUsers);

  const generatePaginationItems = () => {
    const items: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);
      
      if (currentPage > 3) {
        items.push('ellipsis');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        items.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        items.push('ellipsis');
      }
      
      items.push(totalPages);
    }
    
    return items;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold mb-3">Users</h1>
        <p className="text-xl text-neutral-400">
          Manage all users on the platform
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-6 text-neutral-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 h-14 text-lg! bg-neutral-900/50 border-neutral-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        <Select 
          value={roleFilter} 
          onValueChange={(value) => setRoleFilter(value as RoleFilter)}
        >
          <SelectTrigger className="w-[160px] h-14! text-lg bg-neutral-900/50 border-neutral-800">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-lg">All Roles</SelectItem>
            <SelectItem value="student" className="text-lg">Student</SelectItem>
            <SelectItem value="mentor" className="text-lg">Mentor</SelectItem>
            <SelectItem value="admin" className="text-lg">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead 
                className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 pl-7 cursor-pointer hover:text-white transition-colors w-[240px]"
                onClick={() => handleSort('firstName')}
              >
                <div className="flex items-center">
                  User
                  {getSortIcon('firstName')}
                </div>
              </TableHead>
              <TableHead 
                className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center">
                  Email
                  {getSortIcon('email')}
                </div>
              </TableHead>
              <TableHead 
                className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 cursor-pointer hover:text-white transition-colors w-[120px]"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center">
                  Role
                  {getSortIcon('role')}
                </div>
              </TableHead>
              <TableHead 
                className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 cursor-pointer hover:text-white transition-colors w-[120px]"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead 
                className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 cursor-pointer hover:text-white transition-colors w-[160px]"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  Created
                  {getSortIcon('createdAt')}
                </div>
              </TableHead>
              <TableHead 
                className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 cursor-pointer hover:text-white transition-colors w-[160px]"
                onClick={() => handleSort('lastLoginAt')}
              >
                <div className="flex items-center">
                  Last Login
                  {getSortIcon('lastLoginAt')}
                </div>
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 pr-7 text-right w-[100px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(10)].map((_, i) => (
                <TableRow key={i} className="border-neutral-800">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-full bg-neutral-800" />
                      <Skeleton className="h-5 w-36 bg-neutral-800" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-52 bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-20 rounded-full bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-18 rounded-full bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28 bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28 bg-neutral-800" /></TableCell>
                  <TableCell className="pr-6"><Skeleton className="size-9 rounded-lg bg-neutral-800 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="size-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                    <User className="size-8 text-neutral-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No users found</h3>
                  <p className="text-neutral-400">
                    {searchQuery ? 'Try a different search term' : 'No users match the selected filter'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow 
                  key={user.id} 
                  className="border-neutral-800 hover:bg-neutral-800/30 transition-colors"
                >
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <div className="relative size-10 rounded-full overflow-hidden shrink-0">
                          <Image
                            src={user.avatar}
                            alt={`${user.firstName} ${user.lastName}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="size-10 rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-sm font-bold shrink-0">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                      )}
                      <span className="font-medium text-base text-neutral-100">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-300 text-base">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`py-1.5 px-3 capitalize text-sm ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`py-1.5 px-3 capitalize text-sm ${getStatusBadgeColor(user.status)}`}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-neutral-300 text-base">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-neutral-300 text-base">
                    {formatDate(user.lastLoginAt)}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-9">
                          <MoreVertical className="size-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={() => handleViewUser(user)}
                          className="text-base py-2"
                        >
                          <Eye className="size-4" />
                          View details
                        </DropdownMenuItem>
                        {user.role !== USER_ROLES.ADMIN && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleEditUser(user)}
                              className="text-base py-2"
                            >
                              <Pencil className="size-4" />
                              Edit user
                            </DropdownMenuItem>
                            {user.role === USER_ROLES.MENTOR && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setUserToRevoke(user);
                                    setIsRevokeMentorDialogOpen(true);
                                  }}
                                  className="dark:hover:bg-orange-500/10 transition-colors text-base py-2 text-orange-500 focus:text-orange-500"
                                >
                                  <GraduationCap className="size-4 text-orange-500" />
                                  Revoke Mentor
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            {user.status === USER_STATUS.SUSPENDED ? (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setUserToBan(user);
                                  setIsUnbanDialogOpen(true);
                                }}
                                className="dark:hover:bg-green-500/10 transition-colors text-base py-2 text-green-500 focus:text-green-500"
                              >
                                <CheckCircle className="size-4 text-green-500" />
                                Unban user
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setUserToBan(user);
                                  setIsBanDialogOpen(true);
                                }}
                                className="dark:hover:bg-red-500/10 transition-colors text-base py-2 text-red-500 focus:text-red-500"
                              >
                                <Ban className="size-4 text-red-500" />
                                Ban user
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && totalUsers > 0 && (
          <div className="px-6 py-4 border-t border-neutral-800 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span className="text-base text-neutral-400 whitespace-nowrap">
              Showing {startIndex} to {endIndex} of {totalUsers} user{totalUsers > 1 ? 's' : ''}
            </span>
            
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(p => p - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {generatePaginationItems().map((item, index) => (
                    <PaginationItem key={index}>
                      {item === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(item);
                          }}
                          isActive={currentPage === item}
                          className="cursor-pointer"
                        >
                          {item}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(p => p + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">User Details</DialogTitle>
            <DialogDescription>
              View detailed information about this user
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {selectedUser.avatar ? (
                  <div className="relative size-16 rounded-full overflow-hidden">
                    <Image
                      src={selectedUser.avatar}
                      alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="size-16 rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-xl font-bold">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </div>
                )}
                <div>
                  <p className="text-xl font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-base text-neutral-400">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-base text-neutral-500 mb-1">Role</p>
                  <Badge variant="outline" className={`py-1.5 px-3 capitalize text-sm ${getRoleBadgeColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-base text-neutral-500 mb-1">Status</p>
                  <Badge variant="outline" className={`py-1.5 px-3 capitalize text-sm ${getStatusBadgeColor(selectedUser.status)}`}>
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-base text-neutral-500 mb-1">Roadmaps</p>
                  <p className="text-lg font-semibold">{selectedUser.roadmapCount}</p>
                </div>
                <div>
                  <p className="text-base text-neutral-500 mb-1">Assessments</p>
                  <p className="text-lg font-semibold">{selectedUser.assessmentCount}</p>
                </div>
                <div>
                  <p className="text-base text-neutral-500 mb-1">Joined</p>
                  <p className="text-lg">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <p className="text-base text-neutral-500 mb-1">Last Login</p>
                  <p className="text-lg">{formatDate(selectedUser.lastLoginAt)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit User</DialogTitle>
            <DialogDescription>
              Update user role and status
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {selectedUser.avatar ? (
                  <div className="relative size-12 rounded-full overflow-hidden">
                    <Image
                      src={selectedUser.avatar}
                      alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="size-12 rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-base font-bold">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </div>
                )}
                <div>
                  <p className="text-base font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-sm text-neutral-400">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-base text-neutral-400 mb-2 block">Role</label>
                  <Select value={editRole} onValueChange={(v) => setEditRole(v as typeof editRole)}>
                    <SelectTrigger className="h-12! text-lg!">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student" className="text-lg!">Student</SelectItem>
                      <SelectItem value="mentor" className="text-lg!">Mentor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-base text-neutral-400 mb-2 block">Status</label>
                  <Select 
                    value={editStatus} 
                    onValueChange={(v) => setEditStatus(v as typeof editStatus)}
                    disabled={selectedUser.status === USER_STATUS.SUSPENDED}
                  >
                    <SelectTrigger className="h-12! text-lg!">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="text-lg!">Active</SelectItem>
                      <SelectItem value="inactive" className="text-lg!">Inactive</SelectItem>
                      <SelectItem value="suspended" className="text-lg!" disabled>Suspended (Use Ban/Unban)</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedUser.status === USER_STATUS.SUSPENDED && (
                    <p className="text-sm text-neutral-500 mt-2">
                      User is suspended. Use Unban action to reactivate.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isLoadingAction}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={isLoadingAction}
            >
              Save changes
              {isLoadingAction && <Loader2 className="size-4 animate-spin" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban <strong>{userToBan?.firstName} {userToBan?.lastName}</strong>? 
              This will suspend their account and prevent them from accessing the platform. 
              You can unban them later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoadingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBanUser}
              disabled={isLoadingAction}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Ban User
              {isLoadingAction && <Loader2 className="size-4 animate-spin" />}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isUnbanDialogOpen} onOpenChange={setIsUnbanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unban <strong>{userToBan?.firstName} {userToBan?.lastName}</strong>? 
              This will reactivate their account and allow them to access the platform again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoadingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnbanUser}
              disabled={isLoadingAction}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Unban User
              {isLoadingAction && <Loader2 className="size-4 animate-spin" />}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRoleChangeConfirmDialogOpen} onOpenChange={setIsRoleChangeConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertDialogTitle className="text-2xl">Remove Mentor Role</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Changing role from MENTOR will permanently delete the mentor profile
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="text-base text-neutral-300 space-y-3 mt-4">
            <div>
              Changing <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>&apos;s role from{' '}
              <strong>MENTOR</strong> to{' '}
              <strong>{pendingRoleChange?.newRole.toUpperCase()}</strong> will{' '}
              <strong>permanently delete</strong> their mentor profile.
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 space-y-2">
              <div className="text-base font-semibold text-neutral-300">This action cannot be undone</div>
              <ul className="text-sm text-neutral-400 space-y-1 list-disc list-inside">
                <li>All mentor profile data will be permanently deleted</li>
                <li>Headline, bio, expertise, skills, and other profile information will be lost</li>
                <li>Mentor documents will remain in application history</li>
                <li>Active mentorships will continue but mentor cannot accept new mentees</li>
              </ul>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoadingAction} className="h-12! text-base!">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRoleChange}
              disabled={isLoadingAction}
              className="bg-red-500 hover:bg-red-600 text-white h-12! text-base!"
            >
              Delete Profile & Change Role
              {isLoadingAction && <Loader2 className="size-4 animate-spin" />}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isRevokeMentorDialogOpen} onOpenChange={setIsRevokeMentorDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <DialogTitle className="text-2xl">Revoke Mentor Status</DialogTitle>
            </div>
            <DialogDescription>
              Permanently remove mentor status and delete mentor profile
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-base text-neutral-300 space-y-3">
            <div>
              Revoking mentor status for <strong>{userToRevoke?.firstName} {userToRevoke?.lastName}</strong> will:
            </div>
            <ul className="space-y-2 text-base">
              <li className="flex items-start gap-2">
                <span className="text-neutral-400 mt-1">•</span>
                <span>Change their role to <strong>STUDENT</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400 mt-1">•</span>
                <span><strong>Permanently delete</strong> their mentor profile</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400 mt-1">•</span>
                <span>Send a notification to the user</span>
              </li>
            </ul>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 mt-4">
              <div className="text-sm text-neutral-300 font-semibold mb-1">This action cannot be undone</div>
              <div className="text-sm text-neutral-400">
                All mentor profile data will be permanently deleted.
              </div>
            </div>
          </div>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-base font-medium text-neutral-300">
                Reason for revoking <span className="text-neutral-400">*</span>
              </label>
              <Textarea
                value={revokeReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRevokeReason(e.target.value)}
                placeholder="Enter the reason for revoking mentor status (e.g., Violation of community guidelines, Inactive mentor, etc.)"
                className="min-h-[120px] text-base! resize-none"
                disabled={isRevoking}
              />
              <p className="text-sm text-neutral-500">
                This reason will be included in the notification sent to the user.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRevokeMentorDialogOpen(false);
                setRevokeReason('');
                setUserToRevoke(null);
              }}
              disabled={isRevoking}
              className="h-12! text-base!"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRevokeMentor}
              disabled={isRevoking || !revokeReason.trim()}
              className="bg-red-500 hover:bg-red-600 text-white h-12! text-base!"
            >
              {isRevoking ? (
                <>
                  Revoking...
                  <Loader2 className="size-5 animate-spin" />
                </>
              ) : (
                'Revoke Mentor'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
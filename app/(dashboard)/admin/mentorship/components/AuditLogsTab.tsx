'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services';
import type { IAuditLog, IAuditLogsParams } from '@/types';
import { ITEMS_PER_PAGE } from '@/constants';

import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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

import { formatDateTime, generatePaginationItems } from './utils';

export function AuditLogsTab() {
  const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: IAuditLogsParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE
      };
      const response = await adminService.getAuditLogs(params);
      setAuditLogs(response?.logs || []);
      setTotalPages(response?.meta?.totalPages || 1);
      setTotalLogs(response?.meta?.total || 0);
    } catch (error) {
      toast.error('Failed to load audit logs');
      console.error('Fetch audit logs error:', error);
      setAuditLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalLogs);
  const paginationItems = generatePaginationItems(currentPage, totalPages);

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 pl-6 w-[160px]">
                Action
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[200px]">
                Entity
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 w-[200px]">
                Actor
              </TableHead>
              <TableHead className="text-neutral-400 font-medium text-base uppercase tracking-wider py-5 pr-6 w-[180px]">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(10)].map((_, i) => (
                <TableRow key={i} className="border-neutral-800">
                  <TableCell className="py-5 pl-6">
                    <Skeleton className="h-7 w-28 bg-neutral-800 rounded-full" />
                  </TableCell>
                  <TableCell><Skeleton className="h-6 w-44 bg-neutral-800" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-36 bg-neutral-800" /></TableCell>
                  <TableCell className="pr-6"><Skeleton className="h-6 w-40 bg-neutral-800" /></TableCell>
                </TableRow>
              ))
            ) : auditLogs.length === 0 ? (
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableCell colSpan={4} className="py-16 text-center">
                  <div className="size-20 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                    <FileText className="size-10 text-neutral-500" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">No audit logs</h3>
                  <p className="text-lg text-neutral-400">Activity logs will appear here</p>
                </TableCell>
              </TableRow>
            ) : (
              auditLogs.map((log) => (
                <TableRow key={log.id} className="border-neutral-800 hover:bg-neutral-800/30 transition-colors">
                  <TableCell className="py-5 pl-6">
                    <Badge variant="outline" className="px-4 py-2 text-base uppercase bg-neutral-800/50 text-neutral-300 border-neutral-700">
                      {log.action || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-neutral-300 text-lg uppercase">{log.entityType || 'N/A'}</span>
                    <span className="text-neutral-500 text-base ml-2">
                      #{log.entityId?.substring(0, 8) || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {log.actor ? (
                      <span className="text-neutral-300 text-lg">
                        {log.actor.firstName} {log.actor.lastName}
                      </span>
                    ) : (
                      <span className="text-neutral-500 text-lg">System</span>
                    )}
                  </TableCell>
                  <TableCell className="pr-6 text-neutral-400 text-lg">
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && totalLogs > 0 && (
          <div className="px-6 py-5 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-lg text-neutral-400">
              Showing {startIndex} to {endIndex} of {totalLogs} log{totalLogs > 1 ? 's' : ''}
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
                  
                  {paginationItems.map((item, index) => (
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
    </div>
  );
}
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
        limit: ITEMS_PER_PAGE,
      };
      const response = await adminService.getAuditLogs(params);
      setAuditLogs(response?.logs || []);
      setTotalPages(response?.meta?.totalPages || 1);
      setTotalLogs(response?.meta?.total || 0);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load audit logs';
      toast.error(errorMessage);
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
      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="w-[160px] py-5 pl-6 text-base font-medium tracking-wider text-neutral-400 uppercase">
                Action
              </TableHead>
              <TableHead className="w-[200px] py-5 text-base font-medium tracking-wider text-neutral-400 uppercase">
                Entity
              </TableHead>
              <TableHead className="w-[200px] py-5 text-base font-medium tracking-wider text-neutral-400 uppercase">
                Actor
              </TableHead>
              <TableHead className="w-[180px] py-5 pr-6 text-base font-medium tracking-wider text-neutral-400 uppercase">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(10)].map((_, i) => (
                <TableRow key={i} className="border-neutral-800">
                  <TableCell className="py-5 pl-6">
                    <Skeleton className="h-7 w-28 rounded-full bg-neutral-800" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-44 bg-neutral-800" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-36 bg-neutral-800" />
                  </TableCell>
                  <TableCell className="pr-6">
                    <Skeleton className="h-6 w-40 bg-neutral-800" />
                  </TableCell>
                </TableRow>
              ))
            ) : auditLogs.length === 0 ? (
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableCell colSpan={4} className="py-16 text-center">
                  <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-neutral-800">
                    <FileText className="size-10 text-neutral-500" />
                  </div>
                  <h3 className="mb-2 text-2xl font-semibold">No audit logs</h3>
                  <p className="text-lg text-neutral-400">
                    Activity logs will appear here
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              auditLogs.map((log) => (
                <TableRow
                  key={log.id}
                  className="border-neutral-800 transition-colors hover:bg-neutral-800/30"
                >
                  <TableCell className="py-5 pl-6">
                    <Badge
                      variant="outline"
                      className="border-neutral-700 bg-neutral-800/50 px-4 py-2 text-base text-neutral-300 uppercase"
                    >
                      {log.action || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-lg text-neutral-300 uppercase">
                      {log.entityType || 'N/A'}
                    </span>
                    <span className="ml-2 text-base text-neutral-500">
                      #{log.entityId?.substring(0, 8) || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {log.actor ? (
                      <span className="text-lg text-neutral-300">
                        {log.actor.firstName} {log.actor.lastName}
                      </span>
                    ) : (
                      <span className="text-lg text-neutral-500">System</span>
                    )}
                  </TableCell>
                  <TableCell className="pr-6 text-lg text-neutral-400">
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && totalLogs > 0 && (
          <div className="flex flex-col gap-3 border-t border-neutral-800 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <span className="text-lg whitespace-nowrap text-neutral-400">
              Showing {startIndex} to {endIndex} of {totalLogs} log
              {totalLogs > 1 ? 's' : ''}
            </span>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage((p) => p - 1);
                      }}
                      className={
                        currentPage === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
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
                        if (currentPage < totalPages)
                          setCurrentPage((p) => p + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
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

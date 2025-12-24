'use client';

import { useEffect, useState, useCallback } from 'react';
import { Network } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services';
import type { IIPStatistic } from '@/types';

import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function IPStatisticsTab() {
  const [ipStatistics, setIPStatistics] = useState<IIPStatistic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchIPStatistics = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getIPStatistics();
      setIPStatistics(response || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load IP statistics';
      toast.error(errorMessage);
      setIPStatistics([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIPStatistics();
  }, [fetchIPStatistics]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7">
        <p className="mb-2 text-base font-medium tracking-wider text-neutral-400 uppercase">
          Total Unique IPs
        </p>
        {isLoading ? (
          <Skeleton className="h-12 w-24 bg-neutral-800" />
        ) : (
          <p className="text-5xl font-bold text-neutral-100">
            {ipStatistics.length}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="py-5 pl-6 text-base font-medium tracking-wider text-neutral-400 uppercase">
                IP Hash
              </TableHead>
              <TableHead className="py-5 pr-6 text-right text-base font-medium tracking-wider text-neutral-400 uppercase">
                Application Count
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-neutral-800">
                  <TableCell className="py-5 pl-6">
                    <Skeleton className="h-6 w-72 bg-neutral-800" />
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Skeleton className="ml-auto h-6 w-14 bg-neutral-800" />
                  </TableCell>
                </TableRow>
              ))
            ) : ipStatistics.length === 0 ? (
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableCell colSpan={2} className="py-16 text-center">
                  <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-neutral-800">
                    <Network className="size-10 text-neutral-500" />
                  </div>
                  <h3 className="mb-2 text-2xl font-semibold">
                    No IP data available
                  </h3>
                  <p className="text-lg text-neutral-400">
                    IP statistics will appear here once applications are
                    submitted
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              ipStatistics.map((stat, index) => (
                <TableRow
                  key={index}
                  className="border-neutral-800 transition-colors hover:bg-neutral-800/30"
                >
                  <TableCell className="py-5 pl-6 font-mono text-base text-neutral-300">
                    {stat.ipHash || 'N/A'}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Badge
                      variant="outline"
                      className={`px-4 py-2 text-base ${stat.count > 1 ? 'border-orange-500/30 bg-orange-500/20 text-orange-400' : 'border-neutral-700 bg-neutral-800/50 text-neutral-400'}`}
                    >
                      {stat.count || 0}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && ipStatistics.length > 0 && (
          <div className="border-t border-neutral-800 px-6 py-5">
            <span className="text-lg text-neutral-400">
              {ipStatistics.length} unique IP
              {ipStatistics.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

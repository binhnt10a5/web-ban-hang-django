import React from 'react';
import type { OrderStatus } from '../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'Chờ duyệt',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  approved: {
    label: 'Đã duyệt',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  delivered: {
    label: 'Đã giao',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  awaiting_review: {
    label: 'Chờ đánh giá',
    className: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  reviewed: {
    label: 'Đã hoàn thành',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  rejected: {
    label: 'Từ chối',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  cancelled: {
    label: 'Đã hủy',
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
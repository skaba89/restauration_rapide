'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { 
  Table, 
  Users, 
  Clock, 
  MoreVertical,
  UserCheck,
  Trash2,
  Edit,
  CalendarCheck,
  SprayCan,
  CheckCircle,
  XCircle,
  Merge,
  Split,
  GripVertical,
  Move
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface TableData {
  id: string;
  number: string;
  shape: 'round' | 'square' | 'rectangle';
  capacity: number;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentPartySize?: number;
  currentOrderId?: string;
  currentReservationId?: string;
  serverId?: string;
  serverName?: string;
  seatedAt?: Date;
  section?: string;
  reservationTime?: string;
  reservationName?: string;
  isVip?: boolean;
  isAccessible?: boolean;
  isCombineable?: boolean;
  mergedWith?: string[];
  mergedTables?: TableData[];
}

interface TableCardProps {
  table: TableData;
  onClick?: () => void;
  onStatusChange?: (tableId: string, status: TableData['status']) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMerge?: (tableId: string) => void;
  onSplit?: (tableId: string) => void;
  isDragging?: boolean;
  isEditMode?: boolean;
  isSelected?: boolean;
  isMerging?: boolean;
}

const statusConfig = {
  available: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-400 dark:border-emerald-600',
    hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/50',
    text: 'text-emerald-700 dark:text-emerald-400',
    badge: 'bg-emerald-500',
    label: 'Disponible',
    icon: CheckCircle,
  },
  occupied: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-400 dark:border-red-600',
    hover: 'hover:bg-red-100 dark:hover:bg-red-900/50',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-500',
    label: 'Occupée',
    icon: Users,
  },
  reserved: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-400 dark:border-amber-600',
    hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/50',
    text: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-500',
    label: 'Réservée',
    icon: CalendarCheck,
  },
  cleaning: {
    bg: 'bg-slate-50 dark:bg-slate-950/30',
    border: 'border-slate-400 dark:border-slate-600',
    hover: 'hover:bg-slate-100 dark:hover:bg-slate-900/50',
    text: 'text-slate-700 dark:text-slate-400',
    badge: 'bg-slate-500',
    label: 'Nettoyage',
    icon: SprayCan,
  },
};

export function TableCard({ 
  table, 
  onClick, 
  onStatusChange, 
  onEdit, 
  onDelete,
  onMerge,
  onSplit,
  isDragging: externalDragging = false,
  isEditMode = false,
  isSelected = false,
  isMerging = false,
}: TableCardProps) {
  const [elapsed, setElapsed] = useState<string>('');
  const config = statusConfig[table.status];
  const StatusIcon = config.icon;

  // Setup draggable - toujours actif en mode édition
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isActuallyDragging,
  } = useDraggable({
    id: table.id,
    data: table,
    disabled: !isEditMode, // Désactivé en mode visualisation
  });

  const isDragging = externalDragging || isActuallyDragging;

  // Calculate elapsed time if occupied
  useEffect(() => {
    if (table.status === 'occupied' && table.seatedAt) {
      const updateElapsed = () => {
        const now = new Date();
        const seated = new Date(table.seatedAt!);
        const diffMs = now.getTime() - seated.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        setElapsed(hours > 0 ? `${hours}h ${mins}m` : `${mins} min`);
      };

      updateElapsed();
      const interval = setInterval(updateElapsed, 60000);
      return () => clearInterval(interval);
    }
  }, [table.status, table.seatedAt]);

  // Get shape-specific styles
  const getShapeStyle = useCallback(() => {
    switch (table.shape) {
      case 'round':
        return 'rounded-full';
      case 'square':
        return 'rounded-lg';
      case 'rectangle':
        return 'rounded-lg';
      default:
        return 'rounded-lg';
    }
  }, [table.shape]);

  // Get dimensions based on shape and capacity
  const getDimensions = useCallback(() => {
    const mergeMultiplier = table.mergedWith && table.mergedWith.length > 0 ? 1.5 : 1;
    const baseSize = Math.max(60, 20 + table.capacity * 8) * mergeMultiplier;
    if (table.shape === 'rectangle') {
      return { width: baseSize * 1.5, height: baseSize };
    }
    return { width: baseSize, height: baseSize };
  }, [table.shape, table.capacity, table.mergedWith]);

  const dimensions = getDimensions();
  
  // Check if this table can be merged
  const canMerge = table.isCombineable !== false && 
                   table.status === 'available' && 
                   !table.mergedWith?.length;
  
  // Check if this table can be split
  const canSplit = table.mergedWith && table.mergedWith.length > 0;

  // Transform style for drag
  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : 10,
      }
    : {
        left: table.positionX,
        top: table.positionY,
        zIndex: isDragging ? 50 : 10,
      };

  // Position style quand pas en train de drag
  const positionStyle = transform
    ? {}
    : {
        left: table.positionX,
        top: table.positionY,
      };

  return (
    <motion.div
      ref={isEditMode ? setNodeRef : undefined}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: isDragging ? 1.1 : 1, 
        opacity: isDragging ? 0.8 : 1,
        x: transform?.x || 0,
        y: transform?.y || 0,
      }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`absolute transition-shadow duration-200 ${
        isDragging 
          ? 'z-50 shadow-2xl cursor-grabbing' 
          : isEditMode 
            ? 'z-10 cursor-grab hover:shadow-lg' 
            : 'z-10 cursor-pointer'
      } ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        ...positionStyle,
        ...(transform && { position: 'relative' as const }),
      }}
      onClick={!isEditMode ? onClick : undefined}
    >
      <Card 
        className={`
          w-full h-full ${getShapeStyle()} border-2 ${config.border} ${config.bg} ${config.hover}
          flex flex-col items-center justify-center p-2 gap-1 relative overflow-hidden
          shadow-md hover:shadow-lg transition-all
          ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
          ${isMerging ? 'ring-2 ring-blue-500 ring-offset-2 animate-pulse' : ''}
          ${table.isVip ? 'border-amber-500' : ''}
          ${table.isAccessible ? 'border-blue-500' : ''}
          ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}
        `}
        {...(isEditMode ? { ...attributes, ...listeners } : {})}
      >
        {/* Drag handle for edit mode */}
        {isEditMode && (
          <div className="absolute top-1 left-1 cursor-grab active:cursor-grabbing text-muted-foreground">
            <Move className="h-4 w-4" />
          </div>
        )}
        
        {/* Status indicator dot */}
        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${config.badge}`}>
          {table.status === 'occupied' && (
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
          )}
        </div>

        {/* VIP Badge */}
        {table.isVip && (
          <Badge variant="secondary" className="absolute top-1 left-1 text-[8px] px-1 py-0">
            VIP
          </Badge>
        )}

        {/* Merged indicator */}
        {canSplit && (
          <Badge variant="outline" className="absolute bottom-1 left-1 text-[8px] px-1 py-0 bg-blue-100 text-blue-700">
            {table.mergedWith!.length + 1} tables
          </Badge>
        )}

        {/* Table number */}
        <div className={`font-bold text-sm ${config.text}`}>
          {table.number}
        </div>

        {/* Table icon with capacity */}
        <div className="flex items-center gap-1">
          <Table className={`h-4 w-4 ${config.text}`} />
          <Users className={`h-3 w-3 ${config.text} opacity-70`} />
          <span className={`text-xs ${config.text} opacity-70`}>
            {table.currentPartySize || table.capacity}
          </span>
        </div>

        {/* Elapsed time for occupied tables */}
        {table.status === 'occupied' && elapsed && (
          <div className={`flex items-center gap-0.5 text-xs ${config.text} opacity-80`}>
            <Clock className="h-3 w-3" />
            <span>{elapsed}</span>
          </div>
        )}

        {/* Reservation info */}
        {table.status === 'reserved' && table.reservationTime && (
          <div className={`text-xs ${config.text} opacity-80`}>
            {table.reservationTime} - {table.reservationName}
          </div>
        )}

        {/* Server name for occupied tables */}
        {table.status === 'occupied' && table.serverName && (
          <div className={`flex items-center gap-0.5 text-xs ${config.text} opacity-80`}>
            <UserCheck className="h-3 w-3" />
            <span className="truncate max-w-[60px]">{table.serverName}</span>
          </div>
        )}

        {/* Quick actions menu (for view mode) */}
        {!isEditMode && onStatusChange && (
          <div 
            className="absolute bottom-1 right-1"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onStatusChange(table.id, 'available')}>
                  <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                  Disponible
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(table.id, 'occupied')}>
                  <Users className="h-4 w-4 mr-2 text-red-500" />
                  Occupée
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(table.id, 'reserved')}>
                  <CalendarCheck className="h-4 w-4 mr-2 text-amber-500" />
                  Réservée
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(table.id, 'cleaning')}>
                  <SprayCan className="h-4 w-4 mr-2 text-slate-500" />
                  Nettoyage
                </DropdownMenuItem>
                
                {canMerge && onMerge && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onMerge(table.id)}>
                      <Merge className="h-4 w-4 mr-2 text-blue-500" />
                      Fusionner...
                    </DropdownMenuItem>
                  </>
                )}
                
                {canSplit && onSplit && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onSplit(table.id)}>
                      <Split className="h-4 w-4 mr-2 text-purple-500" />
                      Séparer
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Edit mode actions */}
        {isEditMode && (
          <div className="absolute -top-2 -right-2 flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-5 w-5 rounded-full shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-5 w-5 rounded-full shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default TableCard;

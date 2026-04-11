'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Building,
  MapPin,
  ChevronDown,
  Check,
  Loader2,
  Clock,
  Phone,
  Star,
} from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  status: 'active' | 'construction' | 'closed';
  isOpen: boolean;
  isBusy: boolean;
  isMain?: boolean;
  stats: {
    staffCount: number;
    dailyRevenue: number;
    activeOrders: number;
    rating: number;
  };
  operatingHours: {
    open: string;
    close: string;
  };
}

interface BranchSelectorProps {
  currentBranchId?: string;
  onBranchChange?: (branchId: string) => void;
  compact?: boolean;
  showStatus?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  construction: 'En construction',
  closed: 'Fermé',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  construction: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  closed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export function BranchSelector({
  currentBranchId,
  onBranchChange,
  compact = false,
  showStatus = true,
}: BranchSelectorProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('/api/branches?demo=true&includeStats=true');
        const data = await response.json();
        if (data.success) {
          setBranches(data.branches);
          // Set default branch
          if (currentBranchId) {
            const branch = data.branches.find((b: Branch) => b.id === currentBranchId);
            setSelectedBranch(branch || data.branches[0]);
          } else {
            setSelectedBranch(data.branches[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBranches();
  }, [currentBranchId]);

  const handleBranchSelect = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      setSelectedBranch(branch);
      onBranchChange?.(branchId);
      toast({
        title: 'Succursale changée',
        description: `Vous êtes maintenant sur ${branch.name}`,
      });
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        {compact ? null : 'Chargement...'}
      </Button>
    );
  }

  if (compact) {
    return (
      <Select value={selectedBranch?.id} onValueChange={handleBranchSelect}>
        <SelectTrigger className="w-[180px]">
          <Building className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Sélectionner" />
        </SelectTrigger>
        <SelectContent>
          {branches.map((branch) => (
            <SelectItem 
              key={branch.id} 
              value={branch.id}
              disabled={branch.status !== 'active'}
            >
              <div className="flex items-center gap-2">
                <span>{branch.city}</span>
                {branch.isMain && (
                  <Badge variant="secondary" className="text-xs">Principal</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[200px]">
          <Building className="h-4 w-4 text-orange-500" />
          <div className="flex flex-col items-start text-left flex-1">
            <span className="font-medium truncate">
              {selectedBranch?.name || 'Sélectionner une succursale'}
            </span>
            {selectedBranch && showStatus && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {selectedBranch.isOpen ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Ouvert
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Fermé
                  </>
                )}
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[300px]">
        <DropdownMenuLabel>Succursales</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {branches.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            onClick={() => handleBranchSelect(branch.id)}
            disabled={branch.status !== 'active'}
            className="flex flex-col items-start gap-1 py-3"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-medium">{branch.name}</span>
                {branch.isMain && (
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                    Principal
                  </Badge>
                )}
              </div>
              {selectedBranch?.id === branch.id && (
                <Check className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {branch.city}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {branch.operatingHours.open} - {branch.operatingHours.close}
              </span>
            </div>
            <div className="flex items-center gap-2 w-full">
              <Badge className={STATUS_COLORS[branch.status]}>
                {STATUS_LABELS[branch.status]}
              </Badge>
              {branch.status === 'active' && (
                <>
                  <span className="flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    {branch.stats.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {branch.stats.activeOrders} commandes
                  </span>
                </>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default BranchSelector;

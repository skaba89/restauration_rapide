'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  UserPlus,
  UserMinus,
  Loader2,
  Crown,
  Shield,
  User,
  Mail,
  Phone,
  Search,
} from 'lucide-react';

interface BranchUser {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  userAvatar?: string;
  role: 'manager' | 'supervisor' | 'staff';
  isActive: boolean;
  assignedAt: string;
}

interface AvailableUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  currentBranch?: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  manager: { label: 'Gestionnaire', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', icon: Crown },
  supervisor: { label: 'Superviseur', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: Shield },
  staff: { label: 'Employé', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300', icon: User },
};

interface BranchUserAssignmentProps {
  branchId: string;
  initialUsers?: BranchUser[];
  onUpdate?: (users: BranchUser[]) => void;
}

export function BranchUserAssignment({ branchId, initialUsers, onUpdate }: BranchUserAssignmentProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<BranchUser[]>(initialUsers || []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('staff');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const filteredUsers = users.filter(user =>
    user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    if (!selectedUser) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un utilisateur',
        variant: 'destructive',
      });
      return;
    }

    const userToAdd = null;
    if (!userToAdd) return;

    const newUser: BranchUser = {
      id: `bu-${Date.now()}`,
      userId: userToAdd.id,
      userName: userToAdd.name,
      userEmail: userToAdd.email,
      userPhone: userToAdd.phone,
      role: selectedRole as any,
      isActive: true,
      assignedAt: new Date().toISOString(),
    };

    setUsers([...users, newUser]);
    setIsAddDialogOpen(false);
    setSelectedUser('');
    setSelectedRole('staff');

    toast({
      title: 'Utilisateur assigné',
      description: `${userToAdd.name} a été ajouté comme ${ROLE_CONFIG[selectedRole].label}`,
    });

    onUpdate?.([...users, newUser]);
  };

  const handleRemoveUser = (userId: string) => {
    const user = users.find(u => u.userId === userId);
    setUsers(users.filter(u => u.userId !== userId));
    
    toast({
      title: 'Utilisateur retiré',
      description: `${user?.userName} a été retiré de cette succursale`,
    });

    onUpdate?.(users.filter(u => u.userId !== userId));
  };

  const handleUpdateRole = (userId: string, newRole: string) => {
    setUsers(users.map(u => 
      u.userId === userId ? { ...u, role: newRole as any } : u
    ));

    toast({
      title: 'Rôle mis à jour',
      description: 'Le rôle a été modifié avec succès',
    });
  };

  const getRoleCount = (role: string) => users.filter(u => u.role === role).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
          <p className="mt-2 text-muted-foreground">Chargement des utilisateurs...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              Personnel assigné
            </CardTitle>
            <CardDescription>
              Gérez les employés de cette succursale
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-orange-500 to-red-600">
                <UserPlus className="h-4 w-4" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assigner un utilisateur</DialogTitle>
                <DialogDescription>
                  Ajoutez un employé à cette succursale
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Utilisateur</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {(allUsers || [])
                        .filter((u: any) => !users.find(bu => bu.userId === u.id))
                        .map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-purple-600" />
                          Gestionnaire
                        </div>
                      </SelectItem>
                      <SelectItem value="supervisor">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          Superviseur
                        </div>
                      </SelectItem>
                      <SelectItem value="staff">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-600" />
                          Employé
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddUser} className="bg-gradient-to-r from-orange-500 to-red-600">
                  Assigner
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <Crown className="h-5 w-5 mx-auto text-purple-600 mb-1" />
            <p className="text-sm text-muted-foreground">Gestionnaires</p>
            <p className="font-bold text-purple-600">{getRoleCount('manager')}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <Shield className="h-5 w-5 mx-auto text-blue-600 mb-1" />
            <p className="text-sm text-muted-foreground">Superviseurs</p>
            <p className="font-bold text-blue-600">{getRoleCount('supervisor')}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900/20">
            <User className="h-5 w-5 mx-auto text-slate-600 mb-1" />
            <p className="text-sm text-muted-foreground">Employés</p>
            <p className="font-bold text-slate-600">{getRoleCount('staff')}</p>
          </div>
        </div>

        <Separator />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un employé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Users List */}
        <ScrollArea className="h-[400px]">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'Aucun employé trouvé' : 'Aucun employé assigné à cette succursale'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => {
                const roleConfig = ROLE_CONFIG[user.role];
                const RoleIcon = roleConfig.icon;

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.userAvatar} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                          {user.userName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.userName}</p>
                          <Badge className={roleConfig.color}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {roleConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {user.userEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.userEmail}
                            </span>
                          )}
                          {user.userPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {user.userPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(v) => handleUpdateRole(user.userId, v)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Gestionnaire</SelectItem>
                          <SelectItem value="supervisor">Superviseur</SelectItem>
                          <SelectItem value="staff">Employé</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveUser(user.userId)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Add missing import
import { Label } from '@/components/ui/label';

export default BranchUserAssignment;
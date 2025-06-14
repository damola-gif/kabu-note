
import { useState } from 'react';
import { useStrategies, useDeleteStrategy } from '@/hooks/useStrategies';
import { Button } from '@/components/ui/button';
import { StrategyEditorDialog } from '@/components/strategy/StrategyEditorDialog';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tables } from '@/integrations/supabase/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';

export default function Strategies() {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedStrategy, setSelectedStrategy] = useState<Tables<'strategies'> | undefined>();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { data: strategies, isLoading, error } = useStrategies();
    const deleteMutation = useDeleteStrategy();
    const navigate = useNavigate();

    const handleNewStrategy = () => {
        setSelectedStrategy(undefined);
        setIsEditorOpen(true);
    };

    const handleEdit = (strategy: Tables<'strategies'>) => {
        setSelectedStrategy(strategy);
        setIsEditorOpen(true);
    };
    
    const handleDelete = (strategy: Tables<'strategies'>) => {
        setSelectedStrategy(strategy);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedStrategy) return;
        deleteMutation.mutate(selectedStrategy.id, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setSelectedStrategy(undefined);
            }
        });
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (error) {
            return <p className="text-destructive">Error loading strategies: {error.message}</p>;
        }

        if (!strategies || strategies.length === 0) {
            return (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">No Strategies Yet</h2>
                    <p className="text-muted-foreground mt-2">Click the button to create your first trading strategy.</p>
                    <Button className="mt-4" onClick={handleNewStrategy}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Strategy
                    </Button>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {strategies.map((strategy) => {
                    const imageUrl = strategy.image_path ? supabase.storage.from('strategy_images').getPublicUrl(strategy.image_path).data.publicUrl : null;
                    return (
                    <Card key={strategy.id} className="flex flex-col">
                        {imageUrl && (
                            <div className="aspect-video w-full border-b">
                                <img src={imageUrl} alt={strategy.name} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <CardHeader>
                             <div className="flex justify-between items-start gap-2">
                                <div className="flex-grow space-y-1 overflow-hidden">
                                    <CardTitle className="truncate" title={strategy.name}>{strategy.name}</CardTitle>
                                    <CardDescription>
                                        {strategy.is_public ? <Badge>Public</Badge> : <Badge variant="secondary">Draft</Badge>}
                                    </CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => navigate(`/strategies/${strategy.id}`)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            <span>View Details</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleEdit(strategy)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(strategy)} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground line-clamp-3">
                                {strategy.content_markdown?.substring(0, 150) || "No content."}
                            </p>
                        </CardContent>
                    </Card>
                )})}
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Strategy Library</h1>
                    <p className="text-muted-foreground">Browse and manage your collection of trading strategies.</p>
                </div>
                <Button onClick={handleNewStrategy}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Strategy
                </Button>
            </div>
            
            {renderContent()}

            <StrategyEditorDialog 
                open={isEditorOpen} 
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedStrategy(undefined);
                    }
                    setIsEditorOpen(open);
                }}
                strategy={selectedStrategy}
            />

            {selectedStrategy && (
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the strategy "{selectedStrategy.name}".
                      </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={confirmDelete}
                        disabled={deleteMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                          {deleteMutation.isPending ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
            )}
        </div>
    );
};

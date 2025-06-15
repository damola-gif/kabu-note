
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Eye, Edit } from "lucide-react";
import { format } from "date-fns";
import { StrategyWithProfile } from "@/hooks/useStrategies";
import { useNavigate } from "react-router-dom";

interface DraftStrategiesProps {
  strategies: StrategyWithProfile[];
}

export function DraftStrategies({ strategies }: DraftStrategiesProps) {
  const navigate = useNavigate();
  
  const draftStrategies = strategies
    .filter(strategy => strategy.is_draft)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3); // Show only 3 most recent drafts

  const handleCreateNew = () => {
    navigate("/strategies");
  };

  const handleViewAll = () => {
    navigate("/strategies");
  };

  const handleEdit = (strategyId: string) => {
    navigate(`/strategies?edit=${strategyId}`);
  };

  const handleView = (strategyId: string) => {
    navigate(`/strategy/${strategyId}`);
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-light text-foreground">Draft Strategies</h3>
        <Button 
          size="sm" 
          className="btn-landing-primary"
          onClick={handleCreateNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Strategy
        </Button>
      </div>
      
      {draftStrategies.length > 0 ? (
        <div className="space-y-4">
          {draftStrategies.map((strategy) => (
            <div key={strategy.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h4 className="font-medium text-foreground">{strategy.name}</h4>
                  </div>
                  
                  {strategy.tags && strategy.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {strategy.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {strategy.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{strategy.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">
                      Created {format(new Date(strategy.created_at), "MMM d, yyyy")}
                    </p>
                    
                    {strategy.last_saved_at && (
                      <p className="text-muted-foreground">
                        Last saved {format(new Date(strategy.last_saved_at), "MMM d, h:mm a")}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Draft
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleView(strategy.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEdit(strategy.id)}
                    className="btn-landing-ghost"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="text-center pt-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:text-primary/80"
              onClick={handleViewAll}
            >
              See All Drafts ({strategies.filter(s => s.is_draft).length})
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">No draft strategies yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Start creating strategies to see your drafts here
          </p>
          <Button 
            className="btn-landing-primary"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Strategy
          </Button>
        </div>
      )}
    </div>
  );
}

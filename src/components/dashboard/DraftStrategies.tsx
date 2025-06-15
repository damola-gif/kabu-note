
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";
import { format } from "date-fns";

// Mock data - replace with real data
const mockDrafts = [
  {
    id: "1",
    title: "Swing Trading Setup",
    tags: ["swing", "technical-analysis"],
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "Breakout Strategy",
    tags: ["breakout", "momentum"],
    createdAt: new Date("2024-01-12"),
  }
];

export function DraftStrategies() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#1E2A4E]">Draft Strategies</h3>
        <Button size="sm" className="bg-[#2AB7CA] hover:bg-[#2AB7CA]/90">
          <Plus className="h-4 w-4 mr-2" />
          New Strategy
        </Button>
      </div>
      
      {mockDrafts.length > 0 ? (
        <div className="space-y-4">
          {mockDrafts.map((draft) => (
            <div key={draft.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="h-5 w-5 text-[#2AB7CA]" />
                    <h4 className="font-medium text-[#1E2A4E]">{draft.title}</h4>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {draft.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Created {format(draft.createdAt, "MMM d, yyyy")}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    Continue Editing
                  </Button>
                  <Button size="sm" className="bg-[#2AB7CA] hover:bg-[#2AB7CA]/90">
                    Publish
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="text-center pt-4">
            <Button variant="ghost" size="sm" className="text-[#2AB7CA]">
              See All Drafts
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No draft strategies yet</p>
          <Button className="bg-[#2AB7CA] hover:bg-[#2AB7CA]/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Strategy
          </Button>
        </div>
      )}
    </div>
  );
}

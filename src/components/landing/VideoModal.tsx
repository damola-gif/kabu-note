
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal = ({ isOpen, onClose }: VideoModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-800">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h3 className="text-xl font-medium text-white">Product Demo</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="p-6">
          <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
            <p className="text-gray-400">Demo video coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

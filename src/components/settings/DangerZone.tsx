
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";

export function DangerZone() {
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearTrades = async () => {
    setIsClearing(true);
    try {
      // TODO: Implement clear trades logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("All trades cleared successfully");
    } catch (error) {
      toast.error("Failed to clear trades");
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password to confirm");
      return;
    }

    setIsDeleting(true);
    try {
      // TODO: Implement account deletion logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Account deletion initiated");
    } catch (error) {
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="text-red-800 font-semibold">Danger Zone</h3>
        </div>
        <p className="text-red-700 text-sm mt-1">
          These actions are irreversible. Please proceed with caution.
        </p>
      </div>

      {/* Clear All Trades */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Clear All Trades</CardTitle>
          <CardDescription>
            Permanently delete all your trading journal entries and history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This will permanently delete all your trades, 
              P&L data, and trading history. This action cannot be undone.
            </p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Trades
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your trading data including trades, 
                  P&L calculations, and journal entries. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearTrades}
                  disabled={isClearing}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isClearing ? 'Clearing...' : 'Yes, Clear All Trades'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Delete Account</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> Account deletion is permanent and irreversible. 
              All your data including strategies, trades, and profile information will be lost forever.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deletePassword">
                Enter your password to confirm account deletion
              </Label>
              <Input
                id="deletePassword"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className="max-w-md"
              />
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  disabled={!deletePassword}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account - Final Confirmation</AlertDialogTitle>
                  <AlertDialogDescription>
                    This is your final warning. Deleting your account will:
                    <ul className="list-disc ml-4 mt-2 space-y-1">
                      <li>Permanently delete all your strategies and trades</li>
                      <li>Remove your profile and account data</li>
                      <li>Cancel any active subscriptions</li>
                      <li>Make your username available for others</li>
                    </ul>
                    <strong className="block mt-3 text-red-600">
                      This action is irreversible and cannot be undone.
                    </strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? 'Deleting Account...' : 'Yes, Delete My Account Forever'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

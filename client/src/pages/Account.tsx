import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Coins, LogOut, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Account() {
  const [, setLocation] = useLocation();
  const { user, credits, loading, signOut } = useAuth();

  if (!loading && !user) {
    setLocation("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container max-w-2xl py-12 px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <h1 className="text-4xl font-black gradient-text mb-8">My Account</h1>

        <div className="space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user?.name || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Credits */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Coins className="w-5 h-5 text-purple-600" />
                Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-5xl font-black gradient-text mb-1">
                  {credits ?? "..."}
                </p>
                <p className="text-gray-600 text-sm">credits remaining</p>
              </div>
              {credits === 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  You're out of credits. More purchasing options coming soon.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Button
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

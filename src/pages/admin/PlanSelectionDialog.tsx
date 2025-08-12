// src/components/admin/PlanSelectionDialog.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, CheckCircle, Loader2 } from "lucide-react";
import { subscriptionPlansService, type SubscriptionPlan } from "@/lib/subscriptionPlans";
import { toast } from "sonner";

interface PlanSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onPlanSelect: (plan: SubscriptionPlan) => Promise<void>;
  title?: string;
  description?: string;
  userInfo?: {
    name: string;
    email: string;
  };
}

const PlanSelectionDialog = ({ 
  open, 
  onClose, 
  onPlanSelect, 
  title = "Select Subscription Plan",
  description = "Choose a subscription plan for the user",
  userInfo 
}: PlanSelectionDialogProps) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [activating, setActivating] = useState(false);

  // Load active subscription plans
  useEffect(() => {
    if (open) {
      loadPlans();
    }
  }, [open]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const plansData = await subscriptionPlansService.getActivePlans();
      setPlans(plansData);
    } catch (error) {
      console.error('Failed to load plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    try {
      setActivating(true);
      await onPlanSelect(selectedPlan);
      onClose();
      setSelectedPlan(null);
    } catch (error) {
      console.error('Failed to activate plan:', error);
      toast.error('Failed to activate subscription plan');
    } finally {
      setActivating(false);
    }
  };

  const formatDuration = (months: number) => {
    if (months === 1) return '1 Month';
    if (months < 12) return `${months} Months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return years === 1 ? '1 Year' : `${years} Years`;
    return `${years} Year${years > 1 ? 's' : ''} ${remainingMonths} Month${remainingMonths > 1 ? 's' : ''}`;
  };

  const handleClose = () => {
    if (!activating) {
      onClose();
      setSelectedPlan(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
            {userInfo && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{userInfo.name}</p>
                <p className="text-sm text-gray-600">{userInfo.email}</p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
              <p className="text-gray-600">Loading subscription plans...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {plans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No active subscription plans available</p>
                <p className="text-sm text-gray-400">Please create some plans first in the Subscription Plans tab</p>
              </div>
            ) : (
              <>
                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <Card 
                      key={plan.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedPlan?.id === plan.id 
                          ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
                          : 'hover:border-gray-300 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          {selectedPlan?.id === plan.id && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        {plan.description && (
                          <CardDescription>{plan.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span className="text-sm">{formatDuration(plan.duration_months)}</span>
                            </div>
                            <div className="flex items-center text-green-600 font-semibold">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span>₹{plan.amount.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          {/* Price per month calculation */}
                          <div className="text-xs text-gray-500 text-right">
                            ₹{(plan.amount / plan.duration_months).toFixed(0)}/month
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Selected Plan Summary */}
                {selectedPlan && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Selected Plan Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Plan:</span>
                        <p className="font-medium">{selectedPlan.name}</p>
                      </div>
                      <div>
                        <span className="text-blue-700">Duration:</span>
                        <p className="font-medium">{formatDuration(selectedPlan.duration_months)}</p>
                      </div>
                      <div>
                        <span className="text-blue-700">Amount:</span>
                        <p className="font-medium text-green-600">₹{selectedPlan.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-blue-700">Per Month:</span>
                        <p className="font-medium">₹{(selectedPlan.amount / selectedPlan.duration_months).toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleClose}
                    disabled={activating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handlePlanSelect}
                    disabled={!selectedPlan || activating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {activating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      'Activate Plan'
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlanSelectionDialog;
// src/components/admin/SubscriptionPlansManagement.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle
} from "lucide-react";
import { subscriptionPlansService, type SubscriptionPlan } from "@/lib/subscriptionPlans";
import { toast } from "sonner";

interface SubscriptionPlansManagementProps {
  onPlansUpdate?: () => void;
}

const SubscriptionPlansManagement = ({ onPlansUpdate }: SubscriptionPlansManagementProps) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_months: 1,
    amount: 0
  });

  // Load subscription plans
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const plansData = await subscriptionPlansService.getAllPlans();
      setPlans(plansData);
    } catch (error) {
      console.error('Failed to load plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Plan name is required');
        return;
      }

      if (formData.amount <= 0) {
        toast.error('Amount must be greater than 0');
        return;
      }

      if (formData.duration_months <= 0) {
        toast.error('Duration must be greater than 0');
        return;
      }

      await subscriptionPlansService.createPlan(formData);
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        duration_months: 1,
        amount: 0
      });
      setShowCreateModal(false);
      
      // Reload plans
      await loadPlans();
      onPlansUpdate?.();
      
      toast.success('Subscription plan created successfully!');
    } catch (error) {
      console.error('Failed to create plan:', error);
      toast.error('Failed to create subscription plan');
    }
  };

  const handleEditPlan = async () => {
    if (!editingPlan) return;

    try {
      if (!formData.name.trim()) {
        toast.error('Plan name is required');
        return;
      }

      if (formData.amount <= 0) {
        toast.error('Amount must be greater than 0');
        return;
      }

      if (formData.duration_months <= 0) {
        toast.error('Duration must be greater than 0');
        return;
      }

      await subscriptionPlansService.updatePlan(editingPlan.id, formData);
      
      // Reset form and close modal
      setEditingPlan(null);
      setFormData({
        name: '',
        description: '',
        duration_months: 1,
        amount: 0
      });
      
      // Reload plans
      await loadPlans();
      onPlansUpdate?.();
      
      toast.success('Subscription plan updated successfully!');
    } catch (error) {
      console.error('Failed to update plan:', error);
      toast.error('Failed to update subscription plan');
    }
  };

  const handleTogglePlanStatus = async (planId: number, currentStatus: boolean) => {
    try {
      await subscriptionPlansService.updatePlan(planId, { is_active: !currentStatus });
      await loadPlans();
      onPlansUpdate?.();
      toast.success(`Plan ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Failed to toggle plan status:', error);
      toast.error('Failed to update plan status');
    }
  };

  const startEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      duration_months: plan.duration_months,
      amount: plan.amount
    });
  };

  const startCreate = () => {
    setShowCreateModal(true);
    setFormData({
      name: '',
      description: '',
      duration_months: 1,
      amount: 0
    });
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      duration_months: 1,
      amount: 0
    });
  };

  const formatDuration = (months: number) => {
    if (months === 1) return '1 Month';
    if (months < 12) return `${months} Months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return years === 1 ? '1 Year' : `${years} Years`;
    return `${years} Year${years > 1 ? 's' : ''} ${remainingMonths} Month${remainingMonths > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription Plans</h2>
          <p className="text-gray-600">Create and manage subscription plans for users</p>
        </div>
        <Button onClick={startCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            All Subscription Plans
            <Badge variant="secondary">{plans.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      {plan.description && (
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      {formatDuration(plan.duration_months)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                      ₹{plan.amount.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={plan.is_active ? "default" : "destructive"}
                      className={plan.is_active ? "bg-green-600" : ""}
                    >
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{new Date(plan.created_at).toLocaleDateString()}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(plan)}
                        title="Edit Plan"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleTogglePlanStatus(plan.id, plan.is_active)}
                        className={plan.is_active ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}
                        title={plan.is_active ? "Deactivate Plan" : "Activate Plan"}
                      >
                        {plan.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {plans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-gray-500">No subscription plans found</p>
                    <Button onClick={startCreate} className="mt-2">
                      Create your first plan
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal || !!editingPlan} onOpenChange={closeModals}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
            </DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update the subscription plan details' : 'Create a new subscription plan for users'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="planName">Plan Name *</Label>
              <Input
                id="planName"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Monthly Plan, Annual Plan"
              />
            </div>

            <div>
              <Label htmlFor="planDescription">Description</Label>
              <Textarea
                id="planDescription"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Optional description of the plan"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (Months) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration_months}
                  onChange={(e) => setFormData({...formData, duration_months: parseInt(e.target.value) || 1})}
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={closeModals}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={editingPlan ? handleEditPlan : handleCreatePlan}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPlansManagement;
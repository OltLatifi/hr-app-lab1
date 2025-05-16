import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface Plan {
  name: string;
  priceId: string;
  features: string[];
}

interface PlanSelectionProps {
  plans: Record<string, Plan>;
  onSelectPlan: (planId: string) => void;
  currentPlanId?: string | null;
}

export function PlanSelection({ plans, onSelectPlan, currentPlanId }: PlanSelectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    onSelectPlan(planId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(plans).map(([planId, plan]) => (
        <Card
          key={planId}
          className={`relative ${selectedPlan === planId ? 'border-primary' : ''}`}
        >
          {currentPlanId === planId && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
              Current Plan
            </div>
          )}
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>Select this plan to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={selectedPlan === planId ? 'default' : 'outline'}
              onClick={() => handlePlanSelect(planId)}
              disabled={currentPlanId === planId}
            >
              {currentPlanId === planId ? 'Current Plan' : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 
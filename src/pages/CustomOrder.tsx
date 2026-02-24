import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Loader2, CheckCircle, Mail } from 'lucide-react';
import { useTenantStore } from '@/store/tenantStore';
import { useOrderStore, OrderData } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { createOrder } from '@/lib/supabase/orders';
import { sendConfirmationEmail } from '@/lib/api/email';

// Step components
import { FabricStep } from '@/components/order/FabricStep';
import { GarmentStep } from '@/components/order/GarmentStep';
import { DesignStep } from '@/components/order/DesignStep';
import { MeasurementsStep } from '@/components/order/MeasurementsStep';
import { SummaryStep } from '@/components/order/SummaryStep';

const steps = [
  { id: 1, name: 'Fabric' },
  { id: 2, name: 'Garment' },
  { id: 3, name: 'Design' },
  { id: 4, name: 'Measurements' },
  { id: 5, name: 'Summary' },
];

export default function CustomOrder() {
  const { tenant } = useParams<{ tenant: string }>();
  const navigate = useNavigate();
  const { config } = useTenantStore();
  const { user, username } = useAuthStore();
  const { currentOrder, currentStep, setStep, nextStep, prevStep, resetOrder } = useOrderStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'sending-email' | 'success'>('idle');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // Pre-fill customer info from authenticated user
  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        email: user.email || prev.email,
        name: username || prev.name,
      }));
    }
  }, [user, username]);

  if (!config || !tenant) return null;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return currentOrder.fabric?.type && currentOrder.fabric?.color;
      case 2:
        return currentOrder.garment;
      case 3:
        return currentOrder.design?.neckDesign;
      case 4:
        const requiredFields = config.measurementFields.filter(f => f.required);
        return requiredFields.every(f => currentOrder.measurements?.[f.id]);
      case 5:
        return customerInfo.name && customerInfo.email && customerInfo.phone && customerInfo.address;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setSubmitState('submitting');
    
    try {
      // Create the order using Supabase (link to authenticated user)
      const order = await createOrder({
        tenant: tenant!,
        customer: customerInfo,
        orderData: currentOrder as OrderData,
        userId: user?.id, // Link order to authenticated user
      });
      
      const orderId = order.id;
      
      // Send confirmation email
      setSubmitState('sending-email');
      try {
        await sendConfirmationEmail(tenant!, {
          orderId,
          customerEmail: user?.email || customerInfo.email,
          adminEmail: `admin@${tenant}.com`, // Default admin email
          orderDetails: {
            fabric: currentOrder.fabric!,
            garment: currentOrder.garment!,
            design: currentOrder.design!,
            measurements: currentOrder.measurements!,
            unit: currentOrder.unit || 'inches',
            customerInfo: {
              ...customerInfo,
              email: user?.email || customerInfo.email,
            },
          },
        });
        toast.success('✅ Order placed successfully!');
        toast.info('📩 A confirmation email has been sent to your registered email address.');
      } catch (emailError) {
        // Order was placed, but email failed - still show success
        console.error('Failed to send confirmation email:', emailError);
        toast.success('✅ Order placed successfully!');
        toast.error('Failed to send email. Please try again later.');
      }
      
      setSubmitState('success');
      
      // Wait a moment to show success state, then navigate
      setTimeout(() => {
        resetOrder();
        navigate(`/${tenant}/order-success`);
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error?.message || 'Failed to submit order. Please try again.');
      setSubmitState('idle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FabricStep />;
      case 2:
        return <GarmentStep />;
      case 3:
        return <DesignStep />;
      case 4:
        return <MeasurementsStep />;
      case 5:
        return <SummaryStep customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8 md:py-12 animate-fade-in">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2">Custom Order</h1>
          <p className="text-muted-foreground">
            Create your perfect custom-tailored garment
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8 md:mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => step.id < currentStep && setStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`flex flex-col items-center ${
                    step.id <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step.id < currentStep
                        ? 'bg-green-500 text-white'
                        : step.id === currentStep
                        ? 'bg-tenant-primary text-tenant-secondary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span className="hidden md:block text-xs mt-2 text-muted-foreground">
                    {step.name}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 md:w-16 lg:w-24 mx-2 ${
                      step.id < currentStep ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl border border-border p-6 md:p-8 min-h-[400px]">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="btn-tenant disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting || submitState === 'success'}
                className="btn-tenant disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
              >
                {submitState === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : submitState === 'sending-email' ? (
                  <>
                    <Mail className="w-4 h-4 mr-2 animate-pulse" />
                    Sending Confirmation...
                  </>
                ) : submitState === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Order Placed!
                  </>
                ) : (
                  'Submit Order'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

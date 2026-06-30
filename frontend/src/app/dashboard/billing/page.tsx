'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSubscriptionPlans, getCurrentSubscription, createPaymentOrder, verifyPaymentOrder } from '@/features/subscription/api/subscription';
import { Check, AlertCircle, Zap, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingPage() {
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: plans = [], isLoading: isLoadingPlans } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: getSubscriptionPlans,
  });

  const { data: currentSub, isLoading: isLoadingSub } = useQuery({
    queryKey: ['currentSubscription'],
    queryFn: getCurrentSubscription,
  });

  if (isLoadingPlans || isLoadingSub) {
    return <div className="animate-pulse space-y-8">
      <div className="h-32 bg-slate-200 dark:bg-neutral-800 rounded-2xl w-full"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-96 bg-slate-200 dark:bg-neutral-800 rounded-2xl"></div>)}
      </div>
    </div>;
  }

  const isTrial = currentSub?.status === 'TRIAL';
  const isExpired = currentSub?.status === 'EXPIRED';
  const isCancelled = currentSub?.status === 'CANCELLED';
  const isManuallySuspended = currentSub?.clinicStatus === 'SUSPENDED' && !isExpired;
  const planName = currentSub?.plan?.name || 'Starter';
  const expiresAt = currentSub?.currentPeriodEnd ? new Date(currentSub.currentPeriodEnd) : null;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (plan: any) => {
    setProcessingId(plan._id);
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // 1. Create order on backend
      const order = await createPaymentOrder(plan._id);

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
        amount: order.amount,
        currency: order.currency,
        name: 'Clinixy',
        description: `Upgrade to ${plan.name} Plan`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // 3. Verify payment on backend
            await verifyPaymentOrder({
              ...response,
              planId: plan._id
            });
            toast.success(`Successfully upgraded to ${plan.name} Plan!`);
            await queryClient.refetchQueries({ queryKey: ['currentSubscription'] });
          } catch (error: any) {
            toast.error(error.response?.data?.message || 'Payment verification failed');
          }
        },
        theme: {
          color: '#2563eb', // blue-600
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error.description || 'Payment failed');
      });
      rzp.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setProcessingId(null);
    }
  };

  if (isManuallySuspended) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Billing & Subscription</h2>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Account Suspended</h3>
          <p className="text-red-600 dark:text-red-300 max-w-md mx-auto">
            Your clinic account has been suspended by the administrator. You cannot modify your subscription or access the dashboard at this time. Please contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Billing & Subscription</h2>
        <p className="text-slate-500 dark:text-neutral-400">Manage your clinic's plan and billing details.</p>
      </div>

      {/* Current Plan Banner */}
      <div className={`rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden ${isExpired ? 'bg-gradient-to-r from-red-600 to-rose-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
          <Zap className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold">Current Plan: {planName}</h3>
              {isTrial && (
                <span className="px-2.5 py-1 text-xs font-semibold bg-white text-blue-600 rounded-full uppercase tracking-wide">
                  Free Trial
                </span>
              )}
              {isExpired && (
                <span className="px-2.5 py-1 text-xs font-semibold bg-white text-red-600 rounded-full uppercase tracking-wide">
                  EXPIRED
                </span>
              )}
            </div>
            <p className={isExpired ? 'text-red-100' : 'text-blue-100'}>
              {isExpired 
                ? `Your subscription expired on ${expiresAt ? format(expiresAt, 'MMMM d, yyyy h:mm a') : 'recently'}. Please renew to restore access.`
                : isTrial 
                ? `Your trial expires on ${expiresAt ? format(expiresAt, 'MMMM d, yyyy h:mm a') : 'soon'}. Upgrade to continue.`
                : `Your subscription renews on ${expiresAt ? format(expiresAt, 'MMMM d, yyyy h:mm a') : 'N/A'}.`}
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Upgrade your plan</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan: any) => {
            const isCurrent = plan.name === planName;
            return (
              <div 
                key={plan._id} 
                className={`relative flex flex-col bg-white dark:bg-[#111] rounded-2xl p-8 border-2 transition-all duration-200 ${
                  isCurrent 
                    ? 'border-blue-600 dark:border-blue-500 shadow-xl shadow-blue-900/5' 
                    : 'border-slate-100 dark:border-neutral-800 shadow-sm hover:border-slate-300 dark:hover:border-neutral-700'
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                    Current Plan
                  </div>
                )}
                
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString()}`}
                    </span>
                    {plan.price > 0 && <span className="text-slate-500 dark:text-neutral-400 font-medium">/{plan.interval === 'LIFETIME' ? 'lifetime' : `${plan.intervalCount > 1 ? plan.intervalCount + ' ' : ''}${plan.interval.replace('_', ' ').toLowerCase()}`}</span>}
                  </div>
                </div>

                <ul className="flex-1 space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-neutral-300">Up to <strong className="text-slate-900 dark:text-white">{plan.features.maxDoctors === 999 ? 'Unlimited' : (plan.features.maxDoctors || 0)}</strong> Doctors</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-neutral-300">Up to <strong className="text-slate-900 dark:text-white">{plan.features.maxPatients >= 999999 ? 'Unlimited' : (plan.features.maxPatients || 0).toLocaleString()}</strong> Patients</span>
                  </li>
                  <li className="flex items-start gap-3">
                    {plan.features.hasWhatsApp ? (
                      <Check className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-slate-300 dark:text-neutral-600 shrink-0" />
                    )}
                    <span className={`text-sm ${plan.features.hasWhatsApp ? 'text-slate-600 dark:text-neutral-300' : 'text-slate-400 dark:text-neutral-600 line-through'}`}>
                      WhatsApp Notifications
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    {plan.features.hasOnlineBooking ? (
                      <Check className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-slate-300 dark:text-neutral-600 shrink-0" />
                    )}
                    <span className={`text-sm ${plan.features.hasOnlineBooking ? 'text-slate-600 dark:text-neutral-300' : 'text-slate-400 dark:text-neutral-600 line-through'}`}>
                      Public Booking Portal
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    {plan.features.hasGoogleMapsSetup ? (
                      <Check className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-slate-300 dark:text-neutral-600 shrink-0" />
                    )}
                    <span className={`text-sm font-medium ${plan.features.hasGoogleMapsSetup ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-neutral-600 line-through'}`}>
                      Free Google Maps Setup
                    </span>
                  </li>
                </ul>

                <button 
                  disabled={(isCurrent && !isExpired && !isCancelled) || (plan.price === 0 && !isTrial && !isExpired && !isCancelled) || processingId !== null}
                  onClick={() => handleUpgrade(plan)}
                  className={`w-full py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    isCurrent && !isExpired && !isCancelled
                      ? 'bg-slate-100 text-slate-400 dark:bg-neutral-800 dark:text-neutral-500 cursor-not-allowed'
                      : isCurrent && (isExpired || isCancelled)
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200'
                  }`}
                >
                  {processingId === plan._id && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCurrent && !isExpired && !isCancelled ? 'Current Plan' : isCurrent && (isExpired || isCancelled) ? 'Renew Plan' : (plan.price < (currentSub?.plan?.price || 0) ? 'Downgrade to ' + plan.name : 'Upgrade to ' + plan.name)}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

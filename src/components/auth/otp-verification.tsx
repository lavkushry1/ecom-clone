'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Clock, 
  Smartphone, 
  Mail, 
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface OTPVerificationProps {
  type: 'phone' | 'email';
  contactInfo: string;
  onVerify: (otp: string) => Promise<boolean>;
  onResend: () => Promise<boolean>;
  onCancel?: () => void;
  purpose?: 'payment' | 'registration' | 'password-reset' | 'login';
  autoSubmit?: boolean;
  length?: number;
  validityMinutes?: number;
  className?: string;
}

export function OTPVerification({
  type,
  contactInfo,
  onVerify,
  onResend,
  onCancel,
  purpose = 'payment',
  autoSubmit = true,
  length = 6,
  validityMinutes = 5,
  className = ''
}: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(validityMinutes * 60);
  const [canResend, setCanResend] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (autoSubmit && otp.every(digit => digit !== '') && verificationStatus === 'idle') {
      handleVerify();
    }
  }, [otp, autoSubmit, verificationStatus]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Reset verification status when user starts typing again
    if (verificationStatus !== 'idle') {
      setVerificationStatus('idle');
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'Enter' && otp.every(digit => digit !== '')) {
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, ''); // Remove non-digits
    
    if (pastedData.length === length) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[length - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== length) {
      toast({
        title: "Incomplete OTP",
        description: `Please enter all ${length} digits`,
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const success = await onVerify(otpString);
      if (success) {
        setVerificationStatus('success');
        toast({
          title: "Verification successful",
          description: `Your ${type} has been verified successfully`,
        });
      } else {
        setVerificationStatus('error');
        toast({
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect. Please try again.",
          variant: "destructive",
        });
        // Clear OTP on error
        setOtp(new Array(length).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setVerificationStatus('error');
      toast({
        title: "Verification failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const success = await onResend();
      if (success) {
        toast({
          title: "OTP resent",
          description: `A new OTP has been sent to your ${type}`,
        });
        setTimeLeft(validityMinutes * 60);
        setCanResend(false);
        setOtp(new Array(length).fill(''));
        setVerificationStatus('idle');
        inputRefs.current[0]?.focus();
      } else {
        toast({
          title: "Failed to resend",
          description: "Could not resend OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Resend failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPurposeTitle = () => {
    switch (purpose) {
      case 'payment': return 'Secure Payment Verification';
      case 'registration': return 'Account Verification';
      case 'password-reset': return 'Password Reset Verification';
      case 'login': return 'Login Verification';
      default: return 'Verification Required';
    }
  };

  const getPurposeDescription = () => {
    switch (purpose) {
      case 'payment': return 'To complete your payment securely';
      case 'registration': return 'To activate your account';
      case 'password-reset': return 'To reset your password';
      case 'login': return 'To secure your login';
      default: return 'To verify your identity';
    }
  };

  const maskContactInfo = (info: string) => {
    if (type === 'phone') {
      return info.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2');
    } else {
      const [username, domain] = info.split('@');
      const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
      return `${maskedUsername}@${domain}`;
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full ${
            verificationStatus === 'success' ? 'bg-green-100' :
            verificationStatus === 'error' ? 'bg-red-100' :
            'bg-blue-100'
          }`}>
            {verificationStatus === 'success' ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : verificationStatus === 'error' ? (
              <AlertCircle className="h-8 w-8 text-red-600" />
            ) : (
              <Shield className="h-8 w-8 text-blue-600" />
            )}
          </div>
        </div>
        
        <CardTitle className="text-xl">{getPurposeTitle()}</CardTitle>
        <p className="text-gray-600 mt-2">
          {getPurposeDescription()}
        </p>
        
        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
          {type === 'phone' ? (
            <Smartphone className="h-4 w-4" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          <span>
            OTP sent to {maskContactInfo(contactInfo)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* OTP Input */}
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-12 h-12 text-center text-lg font-bold border-2 ${
                  verificationStatus === 'error' ? 'border-red-300' :
                  verificationStatus === 'success' ? 'border-green-300' :
                  digit ? 'border-blue-300' : 'border-gray-300'
                } focus:border-blue-500`}
                disabled={isVerifying || verificationStatus === 'success'}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className={timeLeft <= 30 ? 'text-red-500' : 'text-gray-500'}>
              {timeLeft > 0 ? `Valid for ${formatTime(timeLeft)}` : 'OTP expired'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!autoSubmit && (
            <Button
              onClick={handleVerify}
              disabled={isVerifying || otp.some(digit => !digit) || verificationStatus === 'success'}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={!canResend || isResending}
              className="flex-1"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Resending...
                </>
              ) : (
                'Resend OTP'
              )}
            </Button>

            {onCancel && (
              <Button
                variant="ghost"
                onClick={onCancel}
                disabled={isVerifying || isResending}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>Didn&apos;t receive the OTP?</p>
          <p>Check your spam folder or try resending after the timer expires.</p>
        </div>
      </CardContent>
    </Card>
  );
}

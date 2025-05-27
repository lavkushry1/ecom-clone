'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, RefreshCw, Shield, Timer } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

interface OTPVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerifySuccess: (otp: string) => void
  onResendOTP: () => void
  phoneNumber?: string
  email?: string
  purpose: 'payment' | 'login' | 'registration'
  timeoutDuration?: number // in seconds
}

export function OTPVerificationModal({
  isOpen,
  onClose,
  onVerifySuccess,
  onResendOTP,
  phoneNumber,
  email,
  purpose = 'payment',
  timeoutDuration = 300 // 5 minutes
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timeoutDuration)
  const [canResend, setCanResend] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(30)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  // Resend cooldown timer
  useEffect(() => {
    if (!canResend) return

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanResend(false)
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [canResend])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', ''])
      setVerificationStatus('idle')
      setTimeLeft(timeoutDuration)
      setCanResend(false)
      setResendCooldown(30)
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [isOpen, timeoutDuration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent pasting multiple characters

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verify when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''))
      setOtp(newOtp.slice(0, 6))
      
      // Focus the next empty field or last field
      const nextEmptyIndex = newOtp.findIndex(digit => digit === '')
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus()
      } else {
        inputRefs.current[5]?.focus()
      }
    }
  }

  const handleVerifyOTP = async (otpValue: string = otp.join('')) => {
    if (otpValue.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter all 6 digits",
        variant: "destructive"
      })
      return
    }

    setIsVerifying(true)
    setVerificationStatus('verifying')

    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500))

      // In a real implementation, you would:
      // 1. Send OTP to your backend for verification
      // 2. Check against the generated OTP
      // 3. Return success/failure

      // Simulate success (you can add logic for testing different OTPs)
      if (otpValue === '123456' || Math.random() > 0.3) {
        setVerificationStatus('success')
        
        setTimeout(() => {
          onVerifySuccess(otpValue)
          toast({
            title: "OTP Verified",
            description: "Verification successful!",
          })
        }, 1000)
      } else {
        throw new Error('Invalid OTP')
      }
    } catch (error) {
      setVerificationStatus('error')
      toast({
        title: "Verification Failed",
        description: "Invalid OTP. Please try again.",
        variant: "destructive"
      })
      
      // Clear OTP on error
      setTimeout(() => {
        setOtp(['', '', '', '', '', ''])
        setVerificationStatus('idle')
        inputRefs.current[0]?.focus()
      }, 1500)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      setCanResend(true)
      setResendCooldown(30)
      
      // Simulate sending new OTP
      await onResendOTP()
      
      toast({
        title: "OTP Sent",
        description: `A new OTP has been sent to ${phoneNumber || email}`,
      })
      
      // Reset timer
      setTimeLeft(timeoutDuration)
      
    } catch (error) {
      toast({
        title: "Resend Failed",
        description: "Unable to resend OTP. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getPurposeText = () => {
    switch (purpose) {
      case 'payment':
        return 'Complete your payment'
      case 'login':
        return 'Verify your login'
      case 'registration':
        return 'Complete your registration'
      default:
        return 'Verify your identity'
    }
  }

  const getVerificationIcon = () => {
    switch (verificationStatus) {
      case 'verifying':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Shield className="h-5 w-5 text-blue-600" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getVerificationIcon()}
            OTP Verification
          </DialogTitle>
          <DialogDescription>
            Enter the 6-digit code sent to {phoneNumber || email} to {getPurposeText().toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <Timer className="h-4 w-4 text-orange-500" />
            <span className={`font-medium ${timeLeft < 60 ? 'text-red-500' : 'text-orange-500'}`}>
              Code expires in: {formatTime(timeLeft)}
            </span>
          </div>

          {/* OTP Input Fields */}
          <div className="space-y-2">
            <Label className="text-center block">Enter Verification Code</Label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-12 h-12 text-center text-lg font-semibold ${
                    verificationStatus === 'error' 
                      ? 'border-red-500 focus:border-red-500' 
                      : verificationStatus === 'success'
                        ? 'border-green-500 focus:border-green-500'
                        : ''
                  }`}
                  disabled={isVerifying || verificationStatus === 'success'}
                />
              ))}
            </div>
          </div>

          {/* Status Messages */}
          {verificationStatus === 'verifying' && (
            <div className="text-center text-sm text-blue-600">
              Verifying your code...
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center text-sm text-green-600 font-medium">
              ✓ Verification successful!
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="text-center text-sm text-red-600">
              Invalid code. Please try again.
            </div>
          )}

          {/* Resend Section */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Didn&apos;t receive the code?</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResendOTP}
              disabled={canResend || timeLeft === 0}
              className="h-8"
            >
              {canResend ? (
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Resend OTP
                </span>
              )}
            </Button>
          </div>
        </div>

        <DialogFooter className="flex-col space-y-2">
          <Button
            onClick={() => handleVerifyOTP()}
            disabled={otp.some(digit => digit === '') || isVerifying || verificationStatus === 'success'}
            className="w-full"
          >
            {isVerifying ? 'Verifying...' : 'Verify & Continue'}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isVerifying}
            className="w-full"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

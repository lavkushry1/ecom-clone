import * as functions from 'firebase-functions'
import { z } from 'zod'

// Validate ZIP code
export const validateZipCode = functions.https.onCall(async (data: any, context: any) => {
  const schema = z.object({
    zipCode: z.string().min(5).max(10),
    address: z.object({
      addressLine1: z.string(),
      addressLine2: z.string().optional(),
      city: z.string(),
      state: z.string()
    }).optional()
  })

  try {
    const { zipCode, address } = schema.parse(data)

    // For demo purposes, consider ZIP codes starting with '9' as invalid
    const isValid = !zipCode.startsWith('9')

    let suggestions: any[] = []
    
    if (!isValid && address) {
      // Provide address correction suggestions
      suggestions = [
        {
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          zipCode: zipCode.replace(/^9/, '1'), // Suggest replacing first digit
          confidence: 0.9
        },
        {
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          zipCode: zipCode.replace(/^9/, '2'),
          confidence: 0.8
        }
      ]
    }

    return {
      isValid,
      zipCode,
      suggestions,
      serviceableAreas: isValid ? ['standard', 'express'] : [],
      estimatedDeliveryDays: isValid ? 3 : null
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid ZIP code data')
    }
    console.error('Error validating ZIP code:', error)
    throw new functions.https.HttpsError('internal', 'ZIP code validation failed')
  }
})

// Validate email
export const validateEmail = functions.https.onCall(async (data: any, context: any) => {
  const schema = z.object({
    email: z.string().email()
  })

  try {
    const { email } = schema.parse(data)
    
    // Simple email validation (in production, might check against email service)
    const isValid = z.string().email().safeParse(email).success
    
    return {
      isValid,
      email,
      domain: email.split('@')[1],
      suggestions: !isValid ? ['Please check the email format'] : []
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid email data')
    }
    console.error('Error validating email:', error)
    throw new functions.https.HttpsError('internal', 'Email validation failed')
  }
})

// Validate phone number
export const validatePhone = functions.https.onCall(async (data: any, context: any) => {
  const schema = z.object({
    phone: z.string(),
    countryCode: z.string().optional().default('+91')
  })

  try {
    const { phone, countryCode } = schema.parse(data)
    
    // Simple Indian phone number validation
    const cleanPhone = phone.replace(/\D/g, '')
    const isValid = countryCode === '+91' ? 
      /^[6-9]\d{9}$/.test(cleanPhone) : 
      cleanPhone.length >= 7 && cleanPhone.length <= 15

    return {
      isValid,
      phone: cleanPhone,
      countryCode,
      formattedPhone: isValid && countryCode === '+91' ? 
        `${countryCode}-${cleanPhone.slice(0, 5)}-${cleanPhone.slice(5)}` :
        `${countryCode}-${cleanPhone}`,
      carrier: isValid ? 'Unknown' : null
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid phone data')
    }
    console.error('Error validating phone:', error)
    throw new functions.https.HttpsError('internal', 'Phone validation failed')
  }
})

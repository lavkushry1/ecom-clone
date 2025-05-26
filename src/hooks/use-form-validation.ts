import { useState, useCallback } from 'react';
import { z } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

export interface UseFormValidationProps<T> {
  schema: z.ZodSchema<T>;
  initialValues?: Partial<T>;
}

export interface UseFormValidationReturn<T> {
  values: Partial<T>;
  errors: ValidationError[];
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  validate: (field?: keyof T) => boolean;
  validateField: (field: keyof T, value: any) => string | null;
  handleSubmit: (onSubmit: (data: T) => Promise<void> | void) => (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
  clearErrors: () => void;
  setError: (field: keyof T, message: string) => void;
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  initialValues = {},
}: UseFormValidationProps<T>): UseFormValidationReturn<T> {
  const [values, setValuesState] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when value changes
    setErrors(prev => prev.filter(error => error.field !== String(field)));
  }, []);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
    
    // Clear errors for updated fields
    const updatedFields = Object.keys(newValues);
    setErrors(prev => prev.filter(error => !updatedFields.includes(error.field)));
  }, []);

  const validateField = useCallback((field: keyof T, value: any): string | null => {
    try {
      // Create a partial schema for single field validation
      const fieldSchema = schema.pick({ [field]: true } as any);
      fieldSchema.parse({ [field]: value });
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => err.path[0] === field);
        return fieldError ? fieldError.message : null;
      }
      return 'Validation error';
    }
  }, [schema]);

  const validate = useCallback((field?: keyof T): boolean => {
    try {
      if (field) {
        // Validate single field
        const fieldValue = values[field];
        const errorMessage = validateField(field, fieldValue);
        
        if (errorMessage) {
          setErrors(prev => [
            ...prev.filter(error => error.field !== String(field)),
            { field: String(field), message: errorMessage }
          ]);
          return false;
        } else {
          setErrors(prev => prev.filter(error => error.field !== String(field)));
          return true;
        }
      } else {
        // Validate all fields
        schema.parse(values);
        setErrors([]);
        return true;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: String(err.path[0]),
          message: err.message,
        }));
        setErrors(validationErrors);
        return false;
      }
      return false;
    }
  }, [values, schema, validateField]);

  const handleSubmit = useCallback((onSubmit: (data: T) => Promise<void> | void) => {
    return async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setIsSubmitting(true);
      
      try {
        if (validate()) {
          const validatedData = schema.parse(values) as T;
          await onSubmit(validatedData);
        }
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [values, validate, schema]);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors([]);
    setIsSubmitting(false);
  }, [initialValues]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const setError = useCallback((field: keyof T, message: string) => {
    setErrors(prev => [
      ...prev.filter(error => error.field !== String(field)),
      { field: String(field), message }
    ]);
  }, []);

  const isValid = errors.length === 0 && Object.keys(values).length > 0;

  return {
    values,
    errors,
    isValid,
    isSubmitting,
    setValue,
    setValues,
    validate,
    validateField,
    handleSubmit,
    reset,
    clearErrors,
    setError,
  };
}

// Utility function to get error message for a specific field
export function getFieldError(errors: ValidationError[], field: string): string | undefined {
  return errors.find(error => error.field === field)?.message;
}

// Utility function to check if a field has an error
export function hasFieldError(errors: ValidationError[], field: string): boolean {
  return errors.some(error => error.field === field);
}

// Common validation schemas
export const commonSchemas = {
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  zipCode: z.string().regex(/^\d{5,6}$/, 'Please enter a valid ZIP code'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Please enter a valid 16-digit card number'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Please enter a valid CVV'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Please enter date in MM/YY format'),
};

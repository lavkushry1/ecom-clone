'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Home, Building, Save, Plus } from 'lucide-react';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  pincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode'),
  state: z.string().min(1, 'Please select a state'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  landmark: z.string().optional(),
  addressType: z.enum(['home', 'work', 'other']),
  isDefault: z.boolean().default(false),
});

export type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  initialData?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  showSaveAsDefault?: boolean;
  className?: string;
}

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
];

export function AddressForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  showSaveAsDefault = true,
  className = ''
}: AddressFormProps) {
  const [isValidatingPincode, setIsValidatingPincode] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      addressType: 'home',
      isDefault: false,
      ...initialData
    }
  });

  const watchedPincode = watch('pincode');
  const watchedAddressType = watch('addressType');

  // Simulate pincode validation (in real app, you'd call an API)
  const validatePincode = async (pincode: string) => {
    if (pincode.length === 6) {
      setIsValidatingPincode(true);
      
      // Simulate API call
      setTimeout(() => {
        // Mock validation - you can integrate with India Post API or similar
        const mockCityState = {
          '110001': { city: 'New Delhi', state: 'Delhi' },
          '400001': { city: 'Mumbai', state: 'Maharashtra' },
          '560001': { city: 'Bangalore', state: 'Karnataka' },
          '600001': { city: 'Chennai', state: 'Tamil Nadu' },
          '700001': { city: 'Kolkata', state: 'West Bengal' },
        };

        const location = mockCityState[pincode as keyof typeof mockCityState];
        if (location) {
          setValue('city', location.city);
          setValue('state', location.state);
          toast({
            title: "Pincode verified",
            description: `Delivery available to ${location.city}, ${location.state}`,
          });
        } else {
          toast({
            title: "Pincode not found",
            description: "Please enter a valid pincode",
            variant: "destructive",
          });
        }
        setIsValidatingPincode(false);
      }, 1000);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pincode = e.target.value;
    setValue('pincode', pincode);
    
    if (pincode.length === 6) {
      validatePincode(pincode);
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'work':
        return <Building className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const handleFormSubmit = (data: AddressFormData) => {
    onSubmit(data);
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {initialData ? 'Edit Address' : 'Add New Address'}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="Enter your full name"
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Mobile Number *</Label>
                <Input
                  id="phoneNumber"
                  {...register('phoneNumber')}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  className={errors.phoneNumber ? 'border-red-500' : ''}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  {...register('pincode')}
                  onChange={handlePincodeChange}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  className={errors.pincode ? 'border-red-500' : ''}
                />
                {isValidatingPincode && (
                  <p className="text-sm text-blue-600">Validating pincode...</p>
                )}
                {errors.pincode && (
                  <p className="text-sm text-red-500">{errors.pincode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select
                  value={watch('state')}
                  onValueChange={(value) => setValue('state', value)}
                >
                  <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="Enter city"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (House No, Building, Street, Area) *</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="Enter complete address"
                rows={3}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                id="landmark"
                {...register('landmark')}
                placeholder="e.g., Near Metro Station"
              />
            </div>
          </div>

          {/* Address Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address Type</h3>
            
            <div className="flex gap-4">
              {(['home', 'work', 'other'] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={watchedAddressType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setValue('addressType', type)}
                  className="flex items-center gap-2"
                >
                  {getAddressTypeIcon(type)}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Save as Default */}
          {showSaveAsDefault && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={watch('isDefault')}
                onCheckedChange={(checked) => setValue('isDefault', !!checked)}
              />
              <Label htmlFor="isDefault" className="text-sm font-medium">
                Make this my default address
              </Label>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={!isValid || isLoading || isValidatingPincode}
            className="flex-1 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : initialData ? 'Update Address' : 'Save Address'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// Address selector component for choosing from saved addresses
interface SavedAddress extends AddressFormData {
  id: string;
  createdAt: string;
}

interface AddressSelectorProps {
  addresses: SavedAddress[];
  selectedAddressId?: string;
  onSelectAddress: (addressId: string) => void;
  onEditAddress: (address: SavedAddress) => void;
  onDeleteAddress: (addressId: string) => void;
  onAddNewAddress: () => void;
  className?: string;
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onEditAddress,
  onDeleteAddress,
  onAddNewAddress,
  className = ''
}: AddressSelectorProps) {
  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'work':
        return <Building className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const formatAddress = (address: SavedAddress) => {
    return `${address.address}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Delivery Address</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddNewAddress}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Address
        </Button>
      </div>

      <div className="space-y-3">
        {addresses.map((address) => (
          <Card
            key={address.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedAddressId === address.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelectAddress(address.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getAddressTypeIcon(address.addressType)}
                    <span className="font-medium capitalize">{address.addressType}</span>
                    {address.isDefault && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <p className="font-medium">{address.fullName}</p>
                  <p className="text-sm text-gray-600">{formatAddress(address)}</p>
                  {address.landmark && (
                    <p className="text-sm text-gray-500">Landmark: {address.landmark}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">Mobile: {address.phoneNumber}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAddress(address);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAddress(address.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {addresses.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <MapPin className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No saved addresses</p>
              <Button onClick={onAddNewAddress} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

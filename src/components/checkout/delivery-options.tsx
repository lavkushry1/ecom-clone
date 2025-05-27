'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Truck, 
  Zap, 
  Clock, 
  Calendar as CalendarIcon,
  MapPin,
  Shield,
  Star,
  ChevronRight
} from 'lucide-react'
import { format, addDays, addHours, isToday, isTomorrow } from 'date-fns'

interface DeliveryOption {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: number
  icon: any
  features: string[]
  isRecommended?: boolean
  timeSlots?: string[]
}

interface DeliveryOptionsProps {
  selectedOption?: string
  onOptionSelect: (optionId: string, deliveryDate?: Date, timeSlot?: string) => void
  deliveryAddress?: {
    city: string
    pincode: string
    state: string
  }
  totalAmount?: number
  className?: string
}

const deliveryOptions: DeliveryOption[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Regular delivery with tracking',
    price: 40,
    estimatedDays: 5,
    icon: Truck,
    features: ['Free for orders above ₹500', 'Package tracking', 'Delivery to doorstep'],
    timeSlots: ['9:00 AM - 12:00 PM', '12:00 PM - 3:00 PM', '3:00 PM - 6:00 PM', '6:00 PM - 9:00 PM']
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Fast delivery within 2-3 days',
    price: 99,
    estimatedDays: 3,
    icon: Zap,
    features: ['Priority handling', 'Real-time tracking', 'Faster processing'],
    isRecommended: true,
    timeSlots: ['10:00 AM - 1:00 PM', '1:00 PM - 4:00 PM', '4:00 PM - 7:00 PM']
  },
  {
    id: 'same_day',
    name: 'Same Day Delivery',
    description: 'Get it delivered today',
    price: 149,
    estimatedDays: 0,
    icon: Clock,
    features: ['Available in select cities', 'Order before 2 PM', 'Premium service'],
    timeSlots: ['2:00 PM - 5:00 PM', '5:00 PM - 8:00 PM', '8:00 PM - 11:00 PM']
  }
]

export function DeliveryOptions({
  selectedOption = 'standard',
  onOptionSelect,
  deliveryAddress,
  totalAmount = 0,
  className = ''
}: DeliveryOptionsProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [showCalendar, setShowCalendar] = useState(false)

  const getDeliveryDate = (option: DeliveryOption) => {
    if (option.estimatedDays === 0) {
      return new Date()
    }
    return addDays(new Date(), option.estimatedDays)
  }

  const formatDeliveryDate = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEE, MMM dd')
  }

  const getEffectivePrice = (option: DeliveryOption) => {
    if (option.id === 'standard' && totalAmount >= 500) {
      return 0
    }
    return option.price
  }

  const handleOptionSelect = (optionId: string) => {
    const option = deliveryOptions.find(opt => opt.id === optionId)
    if (option) {
      const deliveryDate = getDeliveryDate(option)
      setSelectedDate(deliveryDate)
      onOptionSelect(optionId, deliveryDate, selectedTimeSlot)
    }
  }

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot)
    onOptionSelect(selectedOption, selectedDate, timeSlot)
  }

  const selectedOptionData = deliveryOptions.find(opt => opt.id === selectedOption)

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Options
          </CardTitle>
          <CardDescription>
            Choose your preferred delivery option
            {deliveryAddress && (
              <span className="block mt-1">
                Delivering to {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <RadioGroup value={selectedOption} onValueChange={handleOptionSelect}>
            <div className="space-y-3">
              {deliveryOptions.map((option) => {
                const Icon = option.icon
                const effectivePrice = getEffectivePrice(option)
                const deliveryDate = getDeliveryDate(option)
                const isSelected = selectedOption === option.id
                
                return (
                  <div key={option.id} className="relative">
                    <Label htmlFor={option.id} className="cursor-pointer">
                      <Card className={`transition-all duration-200 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                            
                            <div className={`p-2 rounded-lg ${
                              isSelected ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <Icon className={`h-5 w-5 ${
                                isSelected ? 'text-blue-600' : 'text-gray-600'
                              }`} />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">
                                  {option.name}
                                </h3>
                                {option.isRecommended && (
                                  <Badge className="bg-orange-100 text-orange-700">
                                    <Star className="h-3 w-3 mr-1 fill-current" />
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">
                                {option.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-700 mb-2">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  <span>
                                    {option.estimatedDays === 0 
                                      ? 'Today' 
                                      : `${option.estimatedDays} ${option.estimatedDays === 1 ? 'day' : 'days'}`
                                    }
                                  </span>
                                </div>
                                <span>•</span>
                                <span>By {formatDeliveryDate(deliveryDate)}</span>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 mb-2">
                                {option.features.map((feature, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-semibold">
                                {effectivePrice === 0 ? (
                                  <span className="text-green-600">FREE</span>
                                ) : (
                                  <span>₹{effectivePrice}</span>
                                )}
                              </div>
                              {option.price > effectivePrice && (
                                <div className="text-xs text-gray-500 line-through">
                                  ₹{option.price}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Label>
                  </div>
                )
              })}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Time Slot Selection */}
      {selectedOptionData?.timeSlots && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Delivery Time</CardTitle>
            <CardDescription>
              Choose a convenient time slot for {formatDeliveryDate(selectedDate || new Date())}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Date Selection for Same Day Delivery */}
            {selectedOption === 'same_day' && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Delivery Date</Label>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date)
                        setShowCalendar(false)
                        onOptionSelect(selectedOption, date, selectedTimeSlot)
                      }}
                      disabled={(date) => date < new Date() || date > addDays(new Date(), 1)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Time Slots */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Time Slot</Label>
              <RadioGroup value={selectedTimeSlot} onValueChange={handleTimeSlotSelect}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedOptionData.timeSlots.map((timeSlot) => (
                    <Label key={timeSlot} htmlFor={timeSlot} className="cursor-pointer">
                      <Card className={`transition-all duration-200 ${
                        selectedTimeSlot === timeSlot 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={timeSlot} id={timeSlot} />
                            <span className="text-sm font-medium">{timeSlot}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Delivery Information</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• All deliveries are contactless and safe</p>
                <p>• Track your order in real-time</p>
                <p>• No signature required for orders under ₹10,000</p>
                <p>• Reschedule delivery if needed (subject to availability)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ReportButtonProps {
  entityType: 'PLAYLIST' | 'TRACK' | 'USER' | 'COMMENT'
  entityId: string
  entityName?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ReportButton({ 
  entityType, 
  entityId, 
  entityName,
  variant = 'outline',
  size = 'sm'
}: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!reason) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityType,
          entityId,
          reason,
          description,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          setOpen(false)
          setSubmitted(false)
          setReason('')
          setDescription('')
        }, 2000)
      } else {
        console.error('Failed to submit report')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const reportReasons = [
    { value: 'SPAM', label: 'Spam or misleading content' },
    { value: 'HARASSMENT', label: 'Harassment or hate speech' },
    { value: 'COPYRIGHT', label: 'Copyright infringement' },
    { value: 'EXPLICIT', label: 'Explicit or inappropriate content' },
    { value: 'PRIVACY', label: 'Privacy violation' },
    { value: 'OTHER', label: 'Other' },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            {entityName && `Reporting: ${entityName}`}
            {!entityName && `Report this ${entityType.toLowerCase()}`}
          </DialogDescription>
        </DialogHeader>
        
        {submitted ? (
          <div className="py-4 text-center">
            <div className="text-green-600 font-semibold mb-2">
              Report Submitted Successfully
            </div>
            <p className="text-sm text-gray-600">
              Thank you for helping keep JamFind safe. Our moderation team will review your report.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for reporting</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reportReasons.map((reasonOption) => (
                    <SelectItem key={reasonOption.value} value={reasonOption.value}>
                      {reasonOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">
                Additional details (optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Please provide any additional information that might help our moderation team..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}
        
        <DialogFooter>
          {!submitted && (
            <>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!reason || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

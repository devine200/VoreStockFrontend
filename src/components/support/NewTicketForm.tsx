import { FormEvent, useState } from 'react'
import { TICKET_CATEGORIES } from '@/api/fixtures'
import { Button } from '@/components/shared/Button'
import { Field, Input, Select, Textarea } from '@/components/shared/Field'
import { useAppDispatch } from '@/store/hooks'
import { addTicket } from '@/store/slices/accountSlices'
import { showSuccess } from '@/store/slices/uiSlice'

export function NewTicketForm() {
  const dispatch = useAppDispatch()
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [details, setDetails] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    dispatch(
      addTicket({
        category,
        subject: subject.trim(),
        details: details.trim(),
      }),
    )
    dispatch(
      showSuccess({
        title: 'Ticket submitted',
        body: 'Your ticket has been submitted and added to queue',
        actionLabel: 'Done',
      }),
    )
    setCategory('')
    setSubject('')
    setDetails('')
  }

  return (
    <form
      id="new-ticket"
      onSubmit={onSubmit}
      className="scroll-mt-8 overflow-hidden rounded-2xl border border-[#ebebec] bg-white"
    >
      <div className="border-b border-[#ebebec] px-5 py-4">
        <h2 className="text-[14px] font-semibold leading-5 text-[#1a1e26]">New ticket</h2>
        <p className="mt-0.5 text-[13px] leading-[18px] text-[#7a7b7c]">
          Can’t find an answer? Our team typically responds within 4 hours.
        </p>
      </div>
      <div className="space-y-4 px-5 py-4">
        <Field label="Category">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="h-11"
          >
            <option value="" disabled>
              Select a category…
            </option>
            {TICKET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Subject">
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Briefly describe your issue"
            required
            className="h-[42px]"
          />
        </Field>
        <Field label="Describe the issue">
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Include any relevant order numbers, lot IDs, or transaction references..."
            className="min-h-[106px] px-[15px] py-[13px]"
            required
          />
        </Field>
        <Button type="submit" className="h-[52px] w-full rounded-xl text-[14px] font-semibold !bg-[#480516]">
          Submit ticket
        </Button>
      </div>
    </form>
  )
}

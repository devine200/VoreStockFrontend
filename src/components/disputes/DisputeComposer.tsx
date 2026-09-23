import { FormEvent, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Textarea } from '@/components/shared/Field'
import { Icon } from '@/components/shared/Icon'
import { icons } from '@/assets'
import { useAppDispatch } from '@/store/hooks'
import { replyToDispute } from '@/store/slices/accountSlices'
import { showToast } from '@/store/slices/uiSlice'
import type { Dispute } from '@/types'

export function DisputeComposer({ dispute }: { dispute: Dispute }) {
  const dispatch = useAppDispatch()
  const fileRef = useRef<HTMLInputElement>(null)
  const [reply, setReply] = useState('')
  const [files, setFiles] = useState<string[]>([])

  useEffect(() => {
    setReply('')
    setFiles([])
  }, [dispute.id])

  const closed = dispute.status === 'resolved' || dispute.status === 'closed'
  const waiting = dispute.status === 'awaiting_response'

  const onSend = (e: FormEvent) => {
    e.preventDefault()
    const body = reply.trim()
    if (!body && files.length === 0) return
    dispatch(replyToDispute({ id: dispute.id, body, files }))
    dispatch(showToast(files.length ? 'Evidence submitted' : 'Reply sent'))
    setReply('')
    setFiles([])
    if (fileRef.current) fileRef.current.value = ''
  }

  if (closed) {
    return (
      <p className="border-t border-[#ebebec] px-4 py-4 text-[13px] text-[#9ca3af] sm:px-6">
        This dispute is resolved. The conversation is closed.
      </p>
    )
  }

  return (
    <form onSubmit={onSend} className="shrink-0 border-t border-[#ebebec] px-4 py-4 sm:px-6">
      <p className="text-[12px] font-medium text-[#46494f]">
        {waiting ? 'Continue this case' : 'Add an update'}
      </p>
      <p className="mt-0.5 text-[12px] leading-4 text-[#9ca3af]">
        {waiting
          ? 'CS asked for more detail. Reply below or attach the requested files.'
          : 'Send a follow-up — it is added to the case thread.'}
      </p>
      <Textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder={waiting ? 'Add a reply or describe the attached evidence…' : 'Write a reply…'}
        className="mt-3 min-h-[72px] rounded-xl bg-[#fafafa] px-3.5 py-3 text-[14px]"
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.pdf"
        multiple
        className="sr-only"
        onChange={(e) => {
          const next = Array.from(e.target.files ?? []).map((f) => f.name)
          setFiles((prev) => [...prev, ...next].slice(0, 8))
        }}
      />
      {files.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {files.map((name, i) => (
            <li
              key={`${name}-${i}`}
              className="inline-flex max-w-full items-center gap-1 rounded-lg bg-[#f8f8f9] py-1 pl-2 pr-1 text-[11px] text-[#46494f]"
            >
              <Icon src={icons.fileText} size={12} />
              <span className="min-w-0 truncate">{name}</span>
              <button
                type="button"
                className="flex size-5 items-center justify-center rounded text-[#9ca3af] hover:text-[#1a1e26]"
                aria-label={`Remove ${name}`}
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <Icon src={icons.close} size={10} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          type="submit"
          className="h-[42px] w-full px-5 text-[14px] font-semibold !bg-[#480516] sm:w-auto"
          disabled={!reply.trim() && files.length === 0}
        >
          Send reply
        </Button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex h-[42px] items-center justify-center gap-2 rounded-xl border border-[#ebebec] px-4 text-[14px] font-medium text-[#46494f] hover:bg-[#fafafa]"
        >
          <Icon src={icons.fileText} size={14} />
          Attach files
        </button>
      </div>
    </form>
  )
}

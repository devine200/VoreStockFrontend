import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Field'
import { Icon } from '@/components/shared/Icon'
import mailIcon from '@/assets/icons/mail.svg'
import callIcon from '@/assets/icons/call.svg'
import profileIcon from '@/assets/icons/profile.svg'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  setDocumentUploaded,
  setEmailVerified,
  setPhoneCodeSent,
} from '@/store/slices/onboardingSlice'
import { showSuccess, showToast } from '@/store/slices/uiSlice'
import { cn } from '@/utils/format'

export function VerificationStep({
  onContinue,
  onSkip,
}: {
  onContinue: () => void
  onSkip: () => void
}) {
  const dispatch = useAppDispatch()
  const { emailVerified, phoneCodeSent, documentUploaded } = useAppSelector((s) => s.onboarding)
  const [code, setCode] = useState('')

  const verifyEmail = () => {
    if (code.trim().length < 6) {
      dispatch(showToast('Enter the 6-digit code from your inbox'))
      return
    }
    dispatch(setEmailVerified(true))
    dispatch(
      showSuccess({
        title: 'Email Verified',
        body: 'Your email is confirmed. You can continue with the remaining verification steps.',
        actionLabel: 'Done',
      }),
    )
  }

  return (
    <div>
      <h2 className="text-[20px] font-semibold leading-7 tracking-tight text-[#1a1e26]">
        Verify your identity
      </h2>
      <p className="mt-1 text-[14px] leading-5 text-[#7a7b7c]">
        Verification keeps the marketplace safe and unlocks higher bidding limits.
      </p>

      <div className="mt-6 space-y-3.5">
        <div className="rounded-xl border border-[#ebebec] p-[21px]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f6]">
                <Icon src={mailIcon} size={16} />
              </span>
              <div>
                <p className="text-[14px] font-semibold leading-5 text-[#1a1e26]">Email verification</p>
                <p className="text-[12px] leading-4 text-[#7a7b7c]">
                  {emailVerified ? 'Verified successfully.' : 'Check your inbox for a verification code.'}
                </p>
              </div>
            </div>
            {!emailVerified ? (
              <button
                type="button"
                className="shrink-0 text-[12px] font-medium leading-4 text-[#480516]"
                onClick={() => dispatch(showToast('Verification code resent'))}
              >
                Resend code
              </button>
            ) : (
              <span className="text-[12px] font-medium text-[#16a34a]">Verified</span>
            )}
          </div>
          {!emailVerified ? (
            <div className="mt-4 flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                inputMode="numeric"
                className="h-[42px] flex-1 rounded-lg"
              />
              <Button
                type="button"
                onClick={verifyEmail}
                className="h-[42px] w-[82px] shrink-0 rounded-lg bg-[#480516] px-0 text-[14px]"
              >
                Verify
              </Button>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-[#ebebec] p-[21px]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f6]">
                <Icon src={callIcon} size={16} />
              </span>
              <div>
                <p className="text-[14px] font-semibold leading-5 text-[#1a1e26]">
                  Phone verification (optional)
                </p>
                <p className="text-[12px] leading-4 text-[#7a7b7c]">
                  {phoneCodeSent ? 'Code sent to your phone.' : 'Adds an extra layer of security.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 text-[12px] font-medium leading-4 text-[#480516]"
              onClick={() => {
                dispatch(setPhoneCodeSent(true))
                dispatch(showToast('Phone code sent'))
              }}
            >
              {phoneCodeSent ? 'Resend code' : 'Send code'}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[#ebebec] p-[21px]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f6]">
                <Icon src={profileIcon} size={16} />
              </span>
              <div>
                <p className="text-[14px] font-semibold leading-5 text-[#1a1e26]">Identity document</p>
                <p className="text-[12px] leading-4 text-[#7a7b7c]">
                  {documentUploaded
                    ? 'Document uploaded for review.'
                    : "Passport, national ID, or driver's licence."}
                </p>
              </div>
            </div>
            <button
              type="button"
              className={cn(
                'shrink-0 text-[12px] font-medium leading-4 text-[#480516]',
                documentUploaded && 'text-[#16a34a]',
              )}
              onClick={() => {
                dispatch(setDocumentUploaded(true))
                dispatch(
                  showSuccess({
                    title: 'Document Uploaded',
                    body: 'Your identity document was received and is pending review.',
                    actionLabel: 'Done',
                  }),
                )
              }}
            >
              {documentUploaded ? 'Uploaded' : 'Upload document'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <Button
          type="button"
          onClick={onContinue}
          className="h-12 w-full rounded-xl bg-[#480516] text-[14px] font-semibold"
          size="lg"
        >
          Continue with email only
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onSkip}
          className="h-[50px] w-full rounded-xl border-[#ebebec] text-[14px] font-medium text-[#7a7b7c]"
        >
          Skip for now
        </Button>
      </div>
    </div>
  )
}

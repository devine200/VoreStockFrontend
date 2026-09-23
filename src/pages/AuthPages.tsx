import { FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/shared/Button'
import { Checkbox, Field, Input } from '@/components/shared/Field'
import { Icon } from '@/components/shared/Icon'
import { GoogleAccountPicker } from '@/components/session/GoogleAccountPicker'
import eyeIcon from '@/assets/icons/eye.svg'
import googleIcon from '@/assets/icons/google.svg'
import { useAppDispatch } from '@/store/hooks'
import { loginDummy, registerUser } from '@/store/slices/sessionSlice'
import { setEmailVerified, startOnboarding } from '@/store/slices/onboardingSlice'
import { showToast } from '@/store/slices/uiSlice'
import { getRememberMe, getRememberedEmail, setRememberMe, setRememberedEmail } from '@/store/persistStorage'
import { normalizeReferralCode } from '@/utils/referral'
import type { GoogleAccount } from '@/session/googleAuth'

const googleBtnClass =
  'flex h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-[#ebebec] bg-white text-[14px] font-medium text-[#46494f] transition hover:bg-[#f4f4f4]'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const returnTo = from.startsWith('/admin') ? '/' : from
  const rememberedEmail = getRememberedEmail()
  const [email, setEmail] = useState(rememberedEmail || 'chukwuemeka@northbridge.ng')
  const [password, setPassword] = useState('password')
  const [showPw, setShowPw] = useState(false)
  const [rememberMe, setRememberMeChecked] = useState(getRememberMe())
  const [googleOpen, setGoogleOpen] = useState(false)

  const persistRememberMe = (loginEmail: string) => {
    setRememberMe(rememberMe)
    setRememberedEmail(rememberMe ? loginEmail : null)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    persistRememberMe(email)
    dispatch(loginDummy({ email, role: 'user' }))
    navigate(returnTo)
  }

  const continueWithGoogle = (account: GoogleAccount) => {
    persistRememberMe(account.email)
    dispatch(loginDummy({ email: account.email, name: account.name }))
    setGoogleOpen(false)
    navigate(returnTo)
  }

  return (
    <div className="rounded-[24px] border border-[#ebebec] bg-white p-5 shadow-[0px_10px_20px_rgba(72,5,22,0.08)] sm:p-8">
      <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-[#1a1e26]">Welcome back</h1>
      <p className="mt-1.5 text-[14px] leading-5 text-[#7a7b7c]">
        Sign in to your account to continue bidding
      </p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <Field label="Email address">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
          />
        </Field>
        <div>
          <Field label="Password">
            <div className="relative">
              <Input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPw((v) => !v)}
                aria-label="Toggle password"
              >
                <Icon src={eyeIcon} size={16} />
              </button>
            </div>
          </Field>
          <div className="mt-1 flex justify-end">
            <button type="button" className="text-[12px] font-medium leading-4 text-[#480516]">
              Forgot password?
            </button>
          </div>
        </div>

        <Checkbox
          name="rememberMe"
          checked={rememberMe}
          onChange={setRememberMeChecked}
          className="text-[12px] leading-5 text-[#7a7b7c]"
        >
          Remember me for 30 days
        </Checkbox>

        <Button type="submit" className="h-12 w-full rounded-xl bg-[#480516] font-semibold" size="lg">
          Sign in →
        </Button>
      </form>

      <div className="my-7 flex items-center gap-3 text-[12px] text-[#9d9ea2]">
        <span className="h-px flex-1 bg-[#ebebec]" />
        or continue with email
        <span className="h-px flex-1 bg-[#ebebec]" />
      </div>

      <button type="button" className={googleBtnClass} onClick={() => setGoogleOpen(true)}>
        <Icon src={googleIcon} size={16} />
        Google
      </button>

      <p className="mt-7 text-center text-[14px] leading-5 text-[#7a7b7c]">
        Don’t have an account?{' '}
        <Link to="/signup" className="font-semibold text-[#480516]">
          Create one free
        </Link>
      </p>

      <GoogleAccountPicker
        open={googleOpen}
        suggested={{ email, name: email.split('@')[0] }}
        onClose={() => setGoogleOpen(false)}
        onSelect={continueWithGoogle}
      />
    </div>
  )
}

export function SignupPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const linkedCode = normalizeReferralCode(searchParams.get('ref'))
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [referralCode, setReferralCode] = useState(linkedCode)
  const [agreed, setAgreed] = useState(false)
  const [googleOpen, setGoogleOpen] = useState(false)
  const referralLocked = Boolean(linkedCode)

  const appliedReferral = normalizeReferralCode(referralLocked ? linkedCode : referralCode) || undefined

  const finishSignup = (signupEmail: string, signupName: string) => {
    dispatch(loginDummy({ email: signupEmail, name: signupName, referredBy: appliedReferral }))
    dispatch(startOnboarding())
    navigate('/')
  }

  const createGoogleAccount = (account: GoogleAccount) => {
    dispatch(
      registerUser({
        email: account.email,
        name: account.name,
        phone: phone || undefined,
        referredBy: appliedReferral,
      }),
    )
    dispatch(startOnboarding())
    dispatch(setEmailVerified(true))
    setGoogleOpen(false)
    navigate('/')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!agreed) return
    finishSignup(email, name || 'New Buyer')
  }

  const onGoogleClick = () => {
    if (!agreed) {
      dispatch(showToast('Agree to the Terms of Service and Privacy Policy to continue'))
      return
    }
    setGoogleOpen(true)
  }

  return (
    <div className="rounded-[24px] border border-[#ebebec] bg-white p-5 shadow-[0px_10px_20px_rgba(72,5,22,0.08)] sm:p-8">
      <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-[#1a1e26]">Create your account</h1>
      <p className="mt-1.5 text-[14px] leading-5 text-[#7a7b7c]">
        Join thousands of buyers accessing verified auction lots
      </p>
      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <Field label="Full name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Chukwuemeka Adeyemi"
            required
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Email address">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Phone (optional)">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>
        <Field label="Password" hint="Min. 8 characters">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            placeholder="Enter your password"
            required
          />
        </Field>
        <Field label="Confirm password">
          <Input type="password" placeholder="Enter your password" required />
        </Field>
        <Field
          label="Referral code (optional)"
          hint={
            referralLocked
              ? 'Filled from your referral link and locked for this registration.'
              : 'Have a code from another buyer? Enter it here.'
          }
        >
          <Input
            name="referralCode"
            value={referralLocked ? linkedCode : referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            placeholder="e.g. CHUKWU2024"
            autoComplete="off"
            disabled={referralLocked}
            readOnly={referralLocked}
            className="uppercase disabled:cursor-not-allowed disabled:bg-[#f5f5f6] disabled:text-[#1a1e26]"
          />
        </Field>
        <Checkbox
          name="agreeToTerms"
          checked={agreed}
          onChange={setAgreed}
          required
          align="start"
          className="text-[14px] leading-[1.5] text-[#7a7b7c]"
        >
          <span>
            I agree to the{' '}
            <Link
              to="/terms"
              className="font-semibold text-[#480516] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy"
              className="font-semibold text-[#480516] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Privacy Policy
            </Link>
          </span>
        </Checkbox>
        <Button type="submit" className="h-12 w-full rounded-xl bg-[#480516] font-semibold" size="lg">
          Create account →
        </Button>
      </form>
      <div className="my-7 flex items-center gap-3 text-[12px] text-[#9d9ea2]">
        <span className="h-px flex-1 bg-[#ebebec]" />
        or sign up with
        <span className="h-px flex-1 bg-[#ebebec]" />
      </div>
      <button type="button" className={googleBtnClass} onClick={onGoogleClick}>
        <Icon src={googleIcon} size={16} />
        Google
      </button>
      <p className="mt-7 text-center text-[14px] leading-5 text-[#7a7b7c]">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-[#480516]">
          Sign in
        </Link>
      </p>
      <GoogleAccountPicker
        open={googleOpen}
        suggested={{ email, name }}
        onClose={() => setGoogleOpen(false)}
        onSelect={createGoogleAccount}
      />
    </div>
  )
}

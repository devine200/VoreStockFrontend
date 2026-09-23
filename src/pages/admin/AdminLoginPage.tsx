import { FormEvent, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/shared/Button'
import { Checkbox, Field, Input } from '@/components/shared/Field'
import { Icon } from '@/components/shared/Icon'
import eyeIcon from '@/assets/icons/eye.svg'
import { useAppDispatch } from '@/store/hooks'
import { loginDummy } from '@/store/slices/sessionSlice'
import { getRememberMe, getRememberedEmail, setRememberMe, setRememberedEmail } from '@/store/persistStorage'

function adminReturnTo(from?: string) {
  if (!from) return '/admin'
  if (!from.startsWith('/admin') || from === '/admin/login') return '/admin'
  return from
}

export function AdminLoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const rememberedEmail = getRememberedEmail()
  const [email, setEmail] = useState(rememberedEmail || 'ops@vskglobal.com')
  const [password, setPassword] = useState('password')
  const [showPw, setShowPw] = useState(false)
  const [rememberMe, setRememberMeChecked] = useState(getRememberMe())

  const persistRememberMe = (loginEmail: string) => {
    setRememberMe(rememberMe)
    setRememberedEmail(rememberMe ? loginEmail : null)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    persistRememberMe(email)
    dispatch(
      loginDummy({
        email,
        name: 'Ops Admin',
        role: 'admin',
      }),
    )
    navigate(adminReturnTo(from), { replace: true })
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-[#1a1e26]">Admin sign in</h1>
      <p className="pt-1 text-[14px] leading-5 text-[#7a7b7c]">
        Access the operations console to manage queues, buyers, and settlements
      </p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <Field label="Work email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ops@vskglobal.com"
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
        </div>

        <Checkbox
          name="rememberMe"
          checked={rememberMe}
          onChange={setRememberMeChecked}
          className="text-[12px] leading-5 text-[#7a7b7c]"
        >
          Remember me for 30 days
        </Checkbox>

        <Button type="submit" className="h-12 w-full rounded-xl bg-maroon-600 font-semibold" size="lg">
          Sign in to admin →
        </Button>
      </form>
    </div>
  )
}

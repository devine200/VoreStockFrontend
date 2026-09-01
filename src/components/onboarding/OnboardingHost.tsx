import { OnboardingShell } from '@/components/onboarding/OnboardingShell'
import { WelcomeStep } from '@/components/onboarding/WelcomeStep'
import { VerificationStep } from '@/components/onboarding/VerificationStep'
import { PreferencesStep } from '@/components/onboarding/PreferencesStep'
import { CompleteStep } from '@/components/onboarding/CompleteStep'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  completeOnboarding,
  nextOnboardingStep,
  prevOnboardingStep,
} from '@/store/slices/onboardingSlice'
import { updatePrefs } from '@/store/slices/accountSlices'
import { showSuccess } from '@/store/slices/uiSlice'

export function OnboardingHost() {
  const dispatch = useAppDispatch()
  const { active, step, categories } = useAppSelector((s) => s.onboarding)

  if (!active) return null

  const goNext = () => dispatch(nextOnboardingStep())
  const goBack = () => dispatch(prevOnboardingStep())

  const finish = () => {
    if (categories.length) {
      dispatch(updatePrefs({ categories }))
    }
    dispatch(completeOnboarding())
    dispatch(
      showSuccess({
        title: 'Welcome to VSK Global',
        body: 'Your account is ready. Start browsing verified lots and place your first bid.',
        actionLabel: 'Browse lots',
        actionTo: '/',
      }),
    )
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-[#1a1e26]/55 px-4 py-10 backdrop-blur-[2px]">
      <div className="my-auto w-full max-w-[512px] animate-slide-up">
        <OnboardingShell step={step} onBack={step !== 'welcome' ? goBack : undefined}>
          {step === 'welcome' ? <WelcomeStep onContinue={goNext} /> : null}
          {step === 'verification' ? (
            <VerificationStep onContinue={goNext} onSkip={goNext} />
          ) : null}
          {step === 'preferences' ? (
            <PreferencesStep
              onContinue={() => {
                if (categories.length) dispatch(updatePrefs({ categories }))
                goNext()
              }}
              onSkip={goNext}
            />
          ) : null}
          {step === 'complete' ? <CompleteStep onFinish={finish} /> : null}
        </OnboardingShell>
      </div>
    </div>
  )
}

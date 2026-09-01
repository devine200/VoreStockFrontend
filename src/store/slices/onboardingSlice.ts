import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { logout } from '@/store/slices/sessionSlice'

export type OnboardingStep = 'welcome' | 'verification' | 'preferences' | 'complete'

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'verification',
  'preferences',
  'complete',
]

export const ONBOARDING_LABELS: Record<OnboardingStep, string> = {
  welcome: 'Welcome',
  verification: 'Verification',
  preferences: 'Preferences',
  complete: 'Complete',
}

interface OnboardingState {
  active: boolean
  step: OnboardingStep
  emailVerified: boolean
  phoneCodeSent: boolean
  documentUploaded: boolean
  categories: string[]
  orderSize: string | null
  completed: boolean
}

const initialState: OnboardingState = {
  active: false,
  step: 'welcome',
  emailVerified: false,
  phoneCodeSent: false,
  documentUploaded: false,
  categories: [],
  orderSize: null,
  completed: false,
}

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    startOnboarding(state) {
      state.active = true
      state.step = 'welcome'
      state.emailVerified = false
      state.phoneCodeSent = false
      state.documentUploaded = false
      state.categories = []
      state.orderSize = null
      state.completed = false
    },
    setOnboardingStep(state, action: PayloadAction<OnboardingStep>) {
      state.step = action.payload
    },
    nextOnboardingStep(state) {
      const i = ONBOARDING_STEPS.indexOf(state.step)
      if (i < ONBOARDING_STEPS.length - 1) {
        state.step = ONBOARDING_STEPS[i + 1]
      }
    },
    prevOnboardingStep(state) {
      const i = ONBOARDING_STEPS.indexOf(state.step)
      if (i > 0) {
        state.step = ONBOARDING_STEPS[i - 1]
      }
    },
    setEmailVerified(state, action: PayloadAction<boolean>) {
      state.emailVerified = action.payload
    },
    setPhoneCodeSent(state, action: PayloadAction<boolean>) {
      state.phoneCodeSent = action.payload
    },
    setDocumentUploaded(state, action: PayloadAction<boolean>) {
      state.documentUploaded = action.payload
    },
    toggleOnboardingCategory(state, action: PayloadAction<string>) {
      const cat = action.payload
      if (state.categories.includes(cat)) {
        state.categories = state.categories.filter((c) => c !== cat)
      } else {
        state.categories.push(cat)
      }
    },
    setOrderSize(state, action: PayloadAction<string>) {
      state.orderSize = action.payload
    },
    completeOnboarding(state) {
      state.active = false
      state.completed = true
      state.step = 'complete'
    },
    dismissOnboarding(state) {
      state.active = false
      state.completed = true
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState)
  },
})

export const {
  startOnboarding,
  setOnboardingStep,
  nextOnboardingStep,
  prevOnboardingStep,
  setEmailVerified,
  setPhoneCodeSent,
  setDocumentUploaded,
  toggleOnboardingCategory,
  setOrderSize,
  completeOnboarding,
  dismissOnboarding,
} = onboardingSlice.actions

export default onboardingSlice.reducer

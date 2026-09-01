import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ModalType, SuccessModalPayload } from '@/types'

interface UiState {
  accountMenuOpen: boolean
  promoDismissed: boolean
  modal: ModalType
  modalPayload: Record<string, unknown> | null
  toast: string | null
  quickViewLotId: string | null
}

const initialState: UiState = {
  accountMenuOpen: false,
  promoDismissed: false,
  modal: null,
  modalPayload: null,
  toast: null,
  quickViewLotId: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleAccountMenu(state, action: PayloadAction<boolean | undefined>) {
      state.accountMenuOpen = action.payload ?? !state.accountMenuOpen
    },
    dismissPromo(state) {
      state.promoDismissed = true
    },
    openModal(state, action: PayloadAction<{ type: Exclude<ModalType, null>; payload?: Record<string, unknown> }>) {
      state.modal = action.payload.type
      state.modalPayload = action.payload.payload ?? null
      state.accountMenuOpen = false
    },
    closeModal(state) {
      state.modal = null
      state.modalPayload = null
    },
    openQuickView(state, action: PayloadAction<string>) {
      state.quickViewLotId = action.payload
      state.accountMenuOpen = false
    },
    closeQuickView(state) {
      state.quickViewLotId = null
    },
    showToast(state, action: PayloadAction<string>) {
      state.toast = action.payload
    },
    clearToast(state) {
      state.toast = null
    },
  },
})

export const {
  toggleAccountMenu,
  dismissPromo,
  openModal,
  closeModal,
  openQuickView,
  closeQuickView,
  showToast,
  clearToast,
} = uiSlice.actions

export function showSuccess(payload: SuccessModalPayload) {
  return openModal({
    type: 'success',
    payload: {
      title: payload.title,
      body: payload.body,
      ...(payload.actionLabel ? { actionLabel: payload.actionLabel } : {}),
      ...(payload.actionTo ? { actionTo: payload.actionTo } : {}),
    },
  })
}

export default uiSlice.reducer

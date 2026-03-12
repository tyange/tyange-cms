declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          cancel: () => void
          disableAutoSelect: () => void
          initialize: (options: {
            callback: (response: { credential?: string }) => void
            client_id: string
          }) => void
          prompt: () => void
          renderButton: (
            parent: HTMLElement,
            options: {
              logo_alignment?: 'center' | 'left'
              shape?: 'circle' | 'pill' | 'rectangular' | 'square'
              size?: 'large' | 'medium' | 'small'
              text?: 'continue_with' | 'signin' | 'signin_with' | 'signup_with'
              theme?: 'filled_black' | 'filled_blue' | 'outline'
              width?: number
            },
          ) => void
        }
      }
    }
  }
}

export {}

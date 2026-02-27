// ============================================
// Provider 供应商配置管理（参考 ClawX）
// ============================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProviderConfig } from './types'

interface ProvidersState {
  providers: ProviderConfig[]
  activeProvider: string
  
  // Actions
  setProviders: (providers: ProviderConfig[]) => void
  addProvider: (provider: ProviderConfig) => void
  updateProvider: (id: string, updates: Partial<ProviderConfig>) => void
  removeProvider: (id: string) => void
  setActiveProvider: (id: string) => void
  toggleProvider: (id: string) => void
}

export const useProvidersStore = create<ProvidersState>()(
  persist(
    (set) => ({
      // 默认供应商配置
      providers: [
        {
          id: 'minimax',
          name: 'MiniMax',
          type: 'minimax',
          apiKey: '',
          baseUrl: 'https://api.minimax.chat/v1',
          model: 'MiniMax-M2.5',
          enabled: true,
        },
        {
          id: 'openai',
          name: 'OpenAI',
          type: 'openai',
          apiKey: '',
          baseUrl: 'https://api.openai.com/v1',
          model: 'gpt-4o',
          enabled: false,
        },
        {
          id: 'anthropic',
          name: 'Anthropic',
          type: 'anthropic',
          apiKey: '',
          baseUrl: 'https://api.anthropic.com',
          model: 'claude-sonnet-4-20250514',
          enabled: false,
        },
        {
          id: 'ollama',
          name: 'Ollama (本地)',
          type: 'ollama',
          apiKey: '',
          baseUrl: 'http://localhost:11434/v1',
          model: 'llama3',
          enabled: false,
        },
      ],
      activeProvider: 'minimax',

      setProviders: (providers) => set({ providers }),
      
      addProvider: (provider) => set((state) => ({ 
        providers: [...state.providers, provider] 
      })),
      
      updateProvider: (id, updates) => set((state) => ({ 
        providers: state.providers.map(p => p.id === id ? { ...p, ...updates } : p) 
      })),
      
      removeProvider: (id) => set((state) => ({ 
        providers: state.providers.filter(p => p.id !== id) 
      })),
      
      setActiveProvider: (id) => set({ activeProvider: id }),
      
      toggleProvider: (id) => set((state) => ({ 
        providers: state.providers.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p) 
      })),
    }),
    {
      name: 'openclaw-providers',
    }
  )
)

// 便捷访问
export const useProviders = () => useProvidersStore((s) => s.providers)
export const useActiveProvider = () => useProvidersStore((s) => s.providers.find(p => p.id === s.activeProvider))
export const useEnabledProviders = () => useProvidersStore((s) => s.providers.filter(p => p.enabled))

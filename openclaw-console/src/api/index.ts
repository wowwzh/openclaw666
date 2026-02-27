// API 统一导出
// ============================================

// Gateway
export { fetchGatewayStatus, type GatewayStatus } from './gateway'
export { gateway, on, connect } from './gateway-ws'
export { 
  gatewayProcess, 
  startGateway, 
  stopGateway, 
  restartGateway, 
  getGatewayStatus, 
  onGatewayStatusChange 
} from './gateway-process'

// Gateway Hooks
export { useGateway, useSendMessage, useLoadHistory } from './useGateway'
export { useGatewaySync, useGatewayOnline, useGatewayVersion, useGatewayUptime } from './useGatewaySync'

// Channel
export { 
  channelManager, 
  connectChannel, 
  disconnectChannel, 
  toggleChannel, 
  getChannels, 
  getConnectedChannels,
  getChannelQRCode 
} from './channel-manager'

// Notifications
export { 
  notifications, 
  notify, 
  notifySuccess, 
  notifyError, 
  notifyMessage, 
  notifyTask,
  requestNotificationPermission 
} from './notifications'

// LLM
export * from './llm'

// EvoMap
export { searchCapsules, getReputation, type Capsule, type Task, type PublishResult } from './evomap'

// Channels (本地)
export { fetchChannels, fetchChannelStats, type Channel, type ChannelStats } from './channels'

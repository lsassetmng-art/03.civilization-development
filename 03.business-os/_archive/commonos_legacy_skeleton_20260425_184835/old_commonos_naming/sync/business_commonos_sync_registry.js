window.BusinessOSCommonOSSyncRegistry = {
  syncMode: 'offline-first',
  syncTriggers: [
    'app_launch',
    'foreground_resume',
    'online_recovery',
    'manual_sync',
    'send_possible'
  ],
  queueStates: [
    'pending',
    'processing',
    'retry_wait',
    'sent',
    'failed',
    'cancelled',
    'conflict'
  ],
  presentationOwner: 'CommonOS'
};

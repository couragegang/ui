import { ChatScreen } from '@couragegang/app-ui/screens'

import { bffApi } from '../../src/platform/bff'
import { chatStorage } from '../../src/platform/chat-storage'

export default function ChatRoute() {
  return <ChatScreen api={bffApi} chatStorage={chatStorage} />
}

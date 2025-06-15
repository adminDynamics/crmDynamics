import { ConnectionStatus } from "./connection-status"

interface TwilioConfigProps {
  onConfigSaved: () => void
}

export function TwilioConfig({ onConfigSaved }: TwilioConfigProps) {
  return <ConnectionStatus />
}

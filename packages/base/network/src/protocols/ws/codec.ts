import type { WsCodec, WsTypedMessage } from './types'

/** JSON 编解码器 */
export const jsonCodec: WsCodec = {
  encode(message: WsTypedMessage): string {
    return JSON.stringify(message)
  },
  async decode(raw: string | ArrayBuffer | Blob): Promise<WsTypedMessage> {
    const text =
      typeof raw === 'string'
        ? raw
        : raw instanceof Blob
          ? await raw.text()
          : new TextDecoder().decode(raw)
    return JSON.parse(text) as WsTypedMessage
  },
}
export type Note = {
  id: number
  cloudId?: string           // 云端 UUID，用于跨设备识别同一条笔记
  title: string
  content: string
  updatedAt: string          // YYYY-MM-DD 格式，用于显示
  localUpdatedAt: number     // 毫秒时间戳，用于精确比较
  tags: string[]
  isFavorite?: boolean
}

export type CollapsedSections = {
  recent: boolean
  favorite: boolean
  all: boolean
}

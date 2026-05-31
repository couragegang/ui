/** Нормализует переносы, если бэкенд отдал литералы `\n`. */
export function normalizeChatContent(text: string): string {
  return text.replace(/\\n/g, '\n')
}

/** Plain Notion URLs → markdown-ссылки для заметного клика. */
export function linkifyNotionUrls(text: string): string {
  return text.replace(
    /(https:\/\/(?:[\w-]+\.)*notion\.(?:so|site)\/[^\s)\]]+)/gi,
    (url) => `[Открыть в Notion](${url})`,
  )
}

/** GFM task list → обычный список с ☐/☑ (без HTML `<input>` на native). */
export function convertTaskLists(text: string): string {
  return text.replace(/^(\s*)[-*+]\s+\[([ xX])\]\s+/gm, (_match, indent: string, mark: string) => {
    const icon = /x/i.test(mark) ? '☑' : '☐'
    return `${indent}- ${icon} `
  })
}

export function prepareChatMarkdownBody(content: string): string {
  return convertTaskLists(linkifyNotionUrls(normalizeChatContent(content)))
}

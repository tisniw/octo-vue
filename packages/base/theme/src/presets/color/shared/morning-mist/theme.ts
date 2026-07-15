import type { ThemeConfig } from '../../../../theme/types.ts'

/**
 * shared 专属主题 - 晨雾
 *
 * 以雾霾蓝灰为主色，冷调中性底色模拟清晨薄雾的朦胧与宁静，
 * 适用于天气类应用、新闻资讯平台以及需要沉静感的阅读类数字产品。
 */
export const morningMistTheme: ThemeConfig = {
  name: 'morning-mist',
  label: '晨雾',
  mode: 'light',
  source: 'builtin',
  tokens: {
    primary: '#8DA9C4',
    success: '#5B9279',
    error: '#C97064',
    warning: '#D9A56B',
    info: '#7AA2C3',
    emphasis: '#A586BD',
    default: '#7C8591',
  },
  bgTokens: {
    primary: '#FAFBFC',
    secondary: '#F1F3F5',
    tertiary: '#E3E7EB',
    quaternary: '#CFD5DB',
    quinary: '#B5BCC4',
  },
}

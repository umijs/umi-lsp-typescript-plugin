export default {
  kind: 'method',
  kindModifiers: 'declare',
  textSpan: {
    start: 9,
    length: 16,
  },
  displayParts: [
    {
      text: '(',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: 'method',
      kind: 'text',
    },
    {
      text: ')',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: 'addEventListener',
      // 属性
      kind: 'propertyName',
    },
    {
      text: '<',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: 'K',
      // 类型参数
      kind: 'typeParameterName',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: 'extends',
      // 类型值
      // 类型操作符
      kind: 'keyword',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: 'keyof',
      // 类型操作符
      kind: 'keyword',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: 'WindowEventMap',
      // 类型
      kind: 'interfaceName',
    },
    {
      text: '>',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: '(',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: 'type',
      // 方法参数
      kind: 'parameterName',
    },
    {
      text: ':',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: 'K',
      // 类型参数
      kind: 'typeParameterName',
    },
    {
      text: ',',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: 'listener',
      // 方法参数
      kind: 'parameterName',
    },
    {
      text: ':',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: '(',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: 'this',
      // 方法参数
      kind: 'parameterName',
    },
    {
      text: ':',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: 'Window',
      kind: 'localName',
    },
    {
      text: ',',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: 'ev',
      // 方法参数
      kind: 'parameterName',
    },
    {
      text: ':',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: 'WindowEventMap',
      // 类型
      kind: 'interfaceName',
    },
    {
      text: '[',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: 'K',
      // 类型参数
      kind: 'typeParameterName',
    },
    {
      text: ']',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: ')',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: '=>',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: 'any',
      // 类型操作符
      kind: 'keyword',
    },
    {
      text: ',',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: 'options',
      // 方法参数
      kind: 'parameterName',
    },
    {
      text: '?',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: ':',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: 'boolean',
      // 类型操作符
      kind: 'keyword',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: '|',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: 'AddEventListenerOptions',
      // 类型
      kind: 'interfaceName',
    },
    {
      text: ')',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: ':',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: 'void',
      // 类型操作符
      kind: 'keyword',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: '(',
      // 标点符号
      kind: 'punctuation',
    },
    {
      text: '+',
      kind: 'operator',
    },
    {
      text: '1',
      kind: 'numericLiteral',
    },
    {
      text: ' ',
      // 空格
      kind: 'space',
    },
    {
      text: 'overload',
      kind: 'text',
    },
    {
      text: ')',
      // 标点符号
      kind: 'punctuation',
    },
  ],
  documentation: [
    {
      text: "Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched.\n\nThe options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture.\n\nWhen set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET.\n\nWhen set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners.\n\nWhen set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed.\n\nThe event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture.",
      kind: 'text',
    },
  ],
};

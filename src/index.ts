import ts, { ScriptElementKind } from 'typescript/lib/tsserverlibrary';
import path from 'path';
import slash2 from 'slash2';
import { findNode, _findTemplateNode } from './util';

/**
 * 这里可以想办法从服务器搞一个提示，这样config的代码和参考链接都可以在vscode中看到
 * @param sourceText
 * @returns
 */
const getTextInfo = (sourceText) => {
  if (sourceText.includes('history')) {
    return `配置 history 类型和配置项。
    包含以下子配置项：
    
    type: 可选 browser hash 和 memory
    
    options:可选 传给 create{{{ type }}}History 的配置项，每个类型器的配置项不同
    `;
  }
  if (sourceText.includes('component')) {
    return `配置路由path对应渲染的组件`;
  }
  return ``;
};

function create(info: ts.server.PluginCreateInfo) {
  const { project, config: pluginConfigObj } = info;

  const projectDir = path.dirname(project.getProjectName());
  const logger = (msg: string) =>
    project.projectService.logger.info(`[umi-typescript-plugin] ${msg}`);

  logger('config: ' + JSON.stringify(pluginConfigObj));
  logger('projectDir: ' + projectDir);
  // Set up decorator
  const proxy: ts.LanguageService = Object.create(null);
  for (let k of Object.keys(info.languageService) as Array<
    keyof ts.LanguageService
  >) {
    const x = info.languageService[k];
    //@ts-ignore
    proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
  }

  /**
   * 是不是在config 文件夹中，如果是说明是 umi 的配置
   * @param fileName
   * @returns
   */
  const isConfigFolder = (fileName: string): boolean => {
    logger('fileName: ' + fileName);
    logger('projectDir config path: ' + path.join(projectDir, 'config'));
    // 如果不在 config 文件中
    if (slash2(fileName).includes(slash2(path.join(projectDir, 'config')))) {
      return true;
    }
    return false;
  };

  const ctx = info.languageService;

  proxy.getCompletionsAtPosition = (fileName, position, options) => {
    const prior = info.languageService.getCompletionsAtPosition(
      fileName,
      position,
      options
    );

    // if (isConfigFolder(fileName)) {
    //   // 在 config 文件夹中删除 window 的自动提示
    //   prior!.entries = prior!.entries.filter((item) => {
    //     if (item.name.toLocaleLowerCase() === 'window') {
    //       return false;
    //     }
    //     return true;
    //   });
    //   return prior;
    // }

    logger(`prior ${JSON.stringify(prior, null, 2)}`);

    // 在 config 文件夹中删除 @@ 和 @/.umi 的自动补全
    prior!.entries = prior!.entries.filter((item) => {
      if (
        item.source?.toLocaleLowerCase().startsWith('@@') ||
        item.source?.toLocaleLowerCase().startsWith('@/.umi')
      ) {
        return false;
      }

      if (!item.source) {
        return false;
      }
      return true;
    });

    /**
     * 带 umi 的排在前面
     */
    prior!.entries = prior!.entries.sort((item, nextItem) => {
      if (item.source?.includes('umi') || nextItem.source?.includes('umi'))
        return 0;
      if (!item.source?.includes('umi') || nextItem.source?.includes('umi'))
        return 1;
      if (item.source?.includes('umi') || !nextItem.source?.includes('umi'))
        return -1;
      return 0;
    });

    logger(`prior result ${JSON.stringify(prior!.entries, null, 2)}`);
    return prior;
  };

  const getSourceFile = (fileName: string) => {
    const program = ctx.getProgram();
    if (!program) {
      throw new Error('language service host does not have program!');
    }
    const s = program.getSourceFile(fileName);
    if (!s) {
      throw new Error('No source file: ' + fileName);
    }
    return s;
  };

  proxy.getSemanticDiagnostics = (fileName) => {
    const diagnostic = ctx.getSemanticDiagnostics(fileName) || [];
    const result = [...diagnostic];
    logger(`diagnostic： ${JSON.stringify(diagnostic, null, 2)}`);
    return result;
  };

  proxy.getQuickInfoAtPosition = (fileName, position) => {
    const quickInfo = ctx.getQuickInfoAtPosition(fileName, position);
    logger(`quickInfo: ${JSON.stringify(quickInfo, null, 2)}`);
    const node = findNode(getSourceFile(fileName), position);
    const sourceText = node.getText();

    return {
      kind: ts.ScriptElementKind.string,
      textSpan: {
        start: position,
        length: 1,
      },
      kindModifiers: '',
      displayParts: quickInfo.displayParts,
      documentation: [
        {
          text: getTextInfo(sourceText),
          kind: ts.ScriptElementKind.string,
        },
      ],
    } as ts.QuickInfo;
  };

  proxy.getDefinitionAndBoundSpan = (fileName, position) => {
    logger(`sourceText: ${fileName}:${position}`);

    const andBoundSpanList = ctx.getDefinitionAndBoundSpan(fileName, position);

    const node = findNode(getSourceFile(fileName), position);
    const sourceText = node.getText();

    if (sourceText === 'component') {
      const fullStart = node.parent
        .getFullText()
        .split(':')
        .pop()
        .trim()
        .replace("'", '')
        .replace("'", '');
      logger(`fullStart: ${JSON.stringify(fullStart, null, 2)}`);

      logger(
        `fullStart: ${JSON.stringify(
          {
            ...andBoundSpanList,
            definitions: [
              {
                ...andBoundSpanList.definitions[0],
                containerName: '',
                kind: 'function',
                fileName: slash2(path.join(projectDir, 'src/pages', fullStart)),
                // fileName: 'c:/github/umi-plugin/demo/index.ts',
              },
            ],
          },
          null,
          2
        )}`
      );
      const definitions: ts.DefinitionInfoAndBoundSpan['definitions'] = [
        {
          ...andBoundSpanList.definitions[0],
          containerName: '',
          kind: ScriptElementKind.functionElement,
          fileName: slash2(
            path.join(projectDir, 'src/pages', `${fullStart}.tsx`)
          ),
          // fileName: 'c:/github/umi-plugin/demo/index.ts',
        },
      ];

      const span: ts.DefinitionInfoAndBoundSpan = {
        ...andBoundSpanList,
        definitions,
      };
      return span;
    }
    return andBoundSpanList;
  };

  return proxy;
}

const pluginModuleFactory: ts.server.PluginModuleFactory = ({}: {
  typescript: typeof ts;
}) => {
  return { create };
};

export = pluginModuleFactory;

import ts from 'typescript/lib/tsserverlibrary';
import path from 'path';
import slash2 from 'slash2';
import { findNode, _findTemplateNode } from './util';

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
  for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
    const x = info.languageService[k];
    //@ts-ignore
    proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
  }

  /**
   * 是不是在config 文件夹中
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
    const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);
    logger(`prior ${JSON.stringify(prior, null, 2)}`);
    if (!isConfigFolder(fileName)) {
      return prior;
    }
    // 在 config 文件夹中删除 window 的自动提示
    prior!.entries = prior!.entries.filter((item) => {
      if (item.name.toLocaleLowerCase() === 'window') {
        return false;
      }
      return true;
    });

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
    const andBoundSpanList = ctx.getDefinitionAndBoundSpan(fileName, position);
    logger(`DefinitionAndBoundSpan: ${JSON.stringify(andBoundSpanList, null, 2)}`);
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
      return {
        ...andBoundSpanList,
        definitions: [
          {
            ...andBoundSpanList.definitions[0],
            containerName: '',
            kind: 'function',
            fileName: slash2(path.join(projectDir, 'src/pages', `${fullStart}.tsx`)),
            // fileName: 'c:/github/umi-plugin/demo/index.ts',
          },
        ],
      };
    }
    return andBoundSpanList;
  };

  return proxy;
}

const pluginModuleFactory: ts.server.PluginModuleFactory = ({}: { typescript: typeof ts }) => {
  return { create };
};

export = pluginModuleFactory;

import ts from 'typescript/lib/tsserverlibrary';
import path from 'path';
import slash2 from 'slash2';

/**
 * config 中配置一般是string
 */
type TagCondition = string;

function hasTagged(node: ts.Node | undefined, condition: TagCondition) {
  if (!node) return;
  if (!ts.isTaggedTemplateExpression(node)) return false;
  const tagNode = node;
  return tagNode.tag.getText() === condition;
}

function isTagged(node: ts.Node | undefined, condition: TagCondition) {
  if (!node) return false;
  return hasTagged(node.parent, condition);
}

function _findTemplateNodes(fileName: string) {
  const allTemplateStringNodes = this._helper.getAllNodes(
    fileName,
    (n: ts.Node) => ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateExpression(n)
  );
  const nodes = allTemplateStringNodes.filter((n) => {
    if (!this._tagCondition) return true;
    return isTagged(n, this._tagCondition);
  }) as (ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression)[];
  return nodes;
}

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

  proxy.getSemanticDiagnostics = (fileName) => {
    const diagnostic = ctx.getSemanticDiagnostics(fileName);
    logger(`diagnostic： ${JSON.stringify(diagnostic, null, 2)}`);
    const nodes = _findTemplateNodes(fileName);
    nodes.map((node) => {
      node.getSourceFile();
    });
    return diagnostic;
  };

  proxy.getQuickInfoAtPosition = (fileName, position) => {
    const quickInfo = ctx.getQuickInfoAtPosition(fileName, position);
    logger(`quickInfo: ${JSON.stringify(quickInfo, null, 2)}`);
    return quickInfo;
  };

  return proxy;
}

const pluginModuleFactory: ts.server.PluginModuleFactory = ({}: { typescript: typeof ts }) => {
  return { create };
};

export = pluginModuleFactory;

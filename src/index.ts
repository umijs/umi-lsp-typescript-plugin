import ts from 'typescript/lib/tsserverlibrary';
import path from 'path';
import slash2 from 'slash2';

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
    logger(
      'is umi config folder: ' + slash2(fileName).includes(slash2(path.join(projectDir, 'config')))
    );
    // 如果不在 config 文件中
    if (slash2(fileName).includes(slash2(path.join(projectDir, 'config')))) {
      return true;
    }
    return false;
  };

  proxy.getCompletionsAtPosition = (fileName, position, options) => {
    const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);

    if (!isConfigFolder(fileName)) {
      return prior;
    }
    // 在 config 文件夹中删除 window 的自动提示
    prior!.entries = prior!.entries.filter((item) => {
      if (item.name === 'window') {
        return false;
      }
      return true;
    });

    return prior;
  };

  return proxy;
}

const pluginModuleFactory: ts.server.PluginModuleFactory = ({}: { typescript: typeof ts }) => {
  return { create };
};

export = pluginModuleFactory;

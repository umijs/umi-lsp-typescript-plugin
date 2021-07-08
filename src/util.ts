import ts, { isTemplateLiteralTypeNode } from 'typescript/lib/tsserverlibrary';

/**
 * config 中配置一般是string
 */
type TagCondition = string;

export function hasTagged(node: ts.Node | undefined, condition: TagCondition) {
  if (!node) return;
  if (!ts.isTaggedTemplateExpression(node)) return false;
  const tagNode = node;
  return tagNode.tag.getText() === condition;
}

export function isTagged(node: ts.Node | undefined, condition: TagCondition) {
  if (!node) return false;
  return hasTagged(node.parent, condition);
}

export function findAllNodes(sourceFile: ts.SourceFile, cond: (n: ts.Node) => boolean): ts.Node[] {
  const result: ts.Node[] = [];
  function find(node: ts.Node) {
    if (cond(node)) {
      result.push(node);
      return;
    } else {
      ts.forEachChild(node, find);
    }
  }
  find(sourceFile);
  return result;
}

export function _findTemplateNodes(fileName: string) {
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

export function findNode(sourceFile: ts.SourceFile, position: number): ts.Node | undefined {
  function find(node: ts.Node): ts.Node | undefined {
    if (position >= node.getStart() && position < node.getEnd()) {
      return ts.forEachChild(node, find) || node;
    }
  }
  return find(sourceFile);
}

const getSourceFile = (fileName: string, ctx) => {
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

export function _findTemplateNode(fileName: string, position: number, ctx) {
  const foundNode = findNode(getSourceFile(fileName, ctx), position);
  if (!foundNode) return;
  let node: ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression;
  if (ts.isNoSubstitutionTemplateLiteral(foundNode)) {
    node = foundNode;
  } else if (ts.isTemplateHead(foundNode) && !isTemplateLiteralTypeNode(foundNode.parent)) {
    node = foundNode.parent;
  } else if (
    (ts.isTemplateMiddle(foundNode) || ts.isTemplateTail(foundNode)) &&
    !isTemplateLiteralTypeNode(foundNode.parent.parent)
  ) {
    node = foundNode.parent.parent;
  } else {
    return;
  }
  if (this._tagCondition && !isTagged(node, this._tagCondition)) {
    return;
  }
  return node;
}

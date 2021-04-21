import yaml from 'js-yaml';
import {provideFormatter} from './utils/formatter';
import {
  TemplateMetaData,
  GenerateOptions,
  Template,
  TemplateParameter,
} from './interfaces';
import {
  getParameterList,
  getTemplateType,
  requiredParameter,
} from './utils/templates';
import nunjucks from 'nunjucks';
import path from 'path';

let generatorFormat = 'markdown'

export function getFormatter() {
    return provideFormatter(generatorFormat)
}

const nunjucksEnv = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(path.resolve(__dirname, '../templates')),
  {
    autoescape: false,
  }
);

nunjucksEnv.addFilter(
  'expandVariables',
  (str: string, meta: TemplateMetaData) => {
    let templatePath = meta.filePath;
    if (meta.repo) {
      templatePath += `@${meta.repo.identifier}`;
    }

    const variables = {
      templatePath,
    };

    return Object.entries(variables).reduce((prevStr, [key, value]) => {
      return prevStr.replace(new RegExp(`\\$<${key}>`, 'g'), value);
    }, str);
  }
);

nunjucksEnv.addFilter('dumpYaml', (data: any) => {
  return yaml.dump(data, { skipInvalid: true }).trim();
});

nunjucksEnv.addFilter('heading', (depth: number) => {
    return (generatorFormat === 'asciidoc' ? '=' : '#').repeat(depth);
});

nunjucksEnv.addFilter('requiredParam', requiredParameter);

nunjucksEnv.addFilter('paramName', (param: TemplateParameter) => {
  let paramName = getFormatter().code(param.name);
  if (requiredParameter(param)) {
    paramName += " " + getFormatter().bold(generatorFormat === 'asciidoc' ? '\*' : '\\*');
  }
  if (param.displayName) {
    paramName += '<br/>' + param.displayName;
  }
  return paramName;
});

nunjucksEnv.addFilter('paramType', (param: TemplateParameter) => {
  let paramType = param.type ? getFormatter().code(param.type) : '';
  if (param.values) {
    const values = param.values.map((value) => getFormatter().code(JSON.stringify(value)));
    paramType += ' ' + `(${values.join(' \\| ')})`;
  }
  return paramType;
});

nunjucksEnv.addFilter('paramDefault', (param: TemplateParameter) => {
  if (!requiredParameter(param)) {
    return getFormatter().code(JSON.stringify(param.default));
  }
  return '';
});

nunjucksEnv.addFilter(
  'paramDescription',
  (param: TemplateParameter, meta: TemplateMetaData) => {
    return meta.parameters?.[param.name]?.description
      ?.replace(/\n\n/g, '<br/><br/>')
      ?.replace(/\n/g, ' ');
  }
);

export function generate(
  data: string,
  meta: TemplateMetaData,
  options?: Partial<GenerateOptions>
) {
  const template = yaml.load(data) as Template;

  const fullOptions: GenerateOptions = {
    headingDepth: options?.headingDepth ?? 1,
    generateFrontmatter: options?.generateFrontmatter ?? false,
    generatorFormat: options?.generatorFormat ?? 'markdown',
    indexFileName: options?.indexFileName ?? 'index',
    generator: options?.generator ?? { name: 'unknown', version: '0' },
    sourceRepositoryUrl: options?.sourceRepositoryUrl ?? ''
  };

  generatorFormat = fullOptions.generatorFormat

  const parameterList = getParameterList(template.parameters);
  const derived = {
    templateType: getTemplateType(template),
    parameterList: parameterList,
    hasParameters: parameterList && parameterList.length > 0,
    hasRequiredParameters: parameterList?.some((param) =>
      requiredParameter(param)
    ),
  };

  const extension = fullOptions.generatorFormat === 'asciidoc' ? 'adoc' : 'md'
  return (
    nunjucksEnv
      .render('template.' + `${extension}` +'.njk', {
        template,
        meta,
        options: fullOptions,
        derived,
      })
      .trim() + '\n'
  );
}

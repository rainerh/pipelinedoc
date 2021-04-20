import { GluegunToolbox } from 'gluegun';
import { GenerateOptions, TemplateMetaData } from '../az-pipelines';
import { glob } from 'glob';
import { promisify } from 'util';
import { info } from 'console';
import { watch } from 'chokidar';

const globAsync = promisify(glob);

module.exports = {
  name: 'generate',
  run: async (toolbox: GluegunToolbox) => {
    const {
      parameters: { array: patterns, options },
      doc: { getRepoDetails, generateDocs, hadErrors, assertNoUnstagedDocs },
      runtime: { brand },
      meta: { version }
    } = toolbox;

    const repoDetails = await getRepoDetails();

    const generateOptions: Partial<GenerateOptions> = {
      headingDepth: 1,
      generateFrontmatter: options.generateFrontmatter,
      generator: {
        name: brand,
        version: version()
      }
    };

    const repoMeta: Partial<TemplateMetaData> = {
      repo: {
        ...repoDetails,
        identifier: options.repoIdentifier ?? 'templates',
        endpoint: options.repoServiceConnectionEndpoint ?? ''
      }
    };

    const clearOutputDir = options.clearOutputDir ?? options.c ?? false;

    const outputDir = options.outDir ?? options.o ?? './docs';

    if (options.watch || options.w) {
      info('Watching for changes...');
      const watcher = watch(patterns, {
        ignored: ['node_modules', '.git']
      });
      watcher.on('add', async file => {
        info('File added: ', file);
        await generateDocs([file], generateOptions, repoMeta, outputDir, clearOutputDir);
      });
      watcher.on('change', async file => {
        info('File changed: ', file);
        await generateDocs([file], generateOptions, repoMeta, outputDir, clearOutputDir);
      });
    } else {
      const files = (
        await Promise.all(
          patterns.map(pattern =>
            globAsync(pattern, {
              ignore: ['node_modules', '.git']
            })
          )
        )
      ).flat();

      await generateDocs(files, generateOptions, repoMeta, outputDir, clearOutputDir);

      if (options.assertUnstaged) {
        await assertNoUnstagedDocs(outputDir);
      }

      if (hadErrors()) {
        process.exit(1);
      }
    }
  }
};

import * as asciidoc from "./asciidoc";
import * as markdown from "./markdown";

export function provideFormatter(generatorFormat: string) {
    if ( generatorFormat === 'asciidoc') {
        return asciidoc
    }
    return markdown
}

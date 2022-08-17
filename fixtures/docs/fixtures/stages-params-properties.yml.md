<!-- this file was generated by pipelinedoc v1.8.0-development-asciidoc - do not modify directly -->

# Stages (parameters & properties)



_Source: [/fixtures/stages-params-properties.yml](/fixtures/stages-params-properties.yml)_
<br/>
_Template type: `stages`_
<br/>
_Version: 1_


A stages template with parameters and a properties file.


## Example usage

### Use template repository

```yaml
resources:
  repositories:
    - repo: templates
      name: rainerh/pipelinedoc
      type: github
```


### Use template

```yaml
stages:
  - template: fixtures/stages-params-properties.yml@templates
    # parameters:
      # name: value
```




### Example 1



```yaml
stages:
  - template: fixtures/stages-params-properties.yml@templates
    parameters:
      name: John Smith
  - template: fixtures/stages-params-properties.yml@templates
    parameters:
      name: Jane Doe
```




## Parameters

|Parameter            |Type                   |Default                   |Description                         |
|---------------------|-----------------------|--------------------------|------------------------------------|
|`name`|`string`|`"value"`|A useless parameter with a multi-line description.<br/><br/>And a second paragraph! |
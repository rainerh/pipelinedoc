<!-- this file was generated by pipelinedoc v0.0.0-development - do not modify directly -->

# steps-optional-parameters



_Source: [/fixtures/steps-optional-parameters.yml](/fixtures/steps-optional-parameters.yml)_
<br/>
_Template type: `steps`_

## Example usage

### Use template repository

```yaml
resources:
  repositories:
    - repo: templates
      name: blake-mealey/pipelinedoc
      type: github
```


### Use template

```yaml
steps:
  - template: fixtures/steps-optional-parameters.yml@templates
    # parameters:
      # condition: null
      # myParameter: my-string
```


## Parameters

|Parameter            |Type                   |Default                   |Description                         |
|---------------------|-----------------------|--------------------------|------------------------------------|
|`condition`|`string`|`null`||
|`myParameter`|`string`|`"my-string"`||
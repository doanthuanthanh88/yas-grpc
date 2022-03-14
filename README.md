# yaml-scene-extension
A template for yaml-scene extension

# Setup project information
1. Update extension information in package.json
2. Run file [setup.sh](./setup.sh) to replace project information to all of template files

```sh
  ./setup.sh
```

# Implementation

Example [Translator](./src/Translator.ts)

```ts
  export class YourExtension implements IElement { 
    // Proxy object which provides some utils functions (logger...)
    proxy?: ElementProxy<any>
    async?: boolean
    delay?: number

    // Init properties from yaml to object
    init?(props: any){}

    // Prepare data, replace data value before executing
    prepare?(){}

    // Execute main flow
    exec?(){}

    // After executed done need dispose object
    dispose?(){}

    // Clone new object in loop or template...
    clone?(){}
  }
```

# Write document
This project template support auto generate document base on comment line in code.

1. Write extension information. [Learn more](https://github.com/doanthuanthanh88/yaml-scene/blob/main/GUIDE.md#Doc~GuideMD)

    ```js
    /**
      * yaml-scene-extension~Translator
      * @description Translate hello text to vietnamese
      * @group extension
      * @order 
      * @example
    - yaml-scene-extension~Translator:
        text: hello
        var: result
    - Echo: ${result}
      */
    export class Translator implements IElement { ... }
    ```

2. Run `yarn run doc` or `npm run doc` 
3. A file [GUIDE.md](./GUIDE.md) will be generate to root folder

# Test extension via jest
The project use `jest` to test project.

1. Write testing files to `test/`.  
2. There are 2 options to run test
    - **Only test** 
      ```sh
        yarn test 
        # OR 
        npm test
      ```
    - **Test & Debug** 
      ```sh
        yarn test:debug
        # OR 
        npm run test:debug
      ```

# Test extension via yaml-scene
The project allow inject extension into yaml-scene global.

1. Create a scenario file at `scenes/test/your_extension.yaml`
2. Register your extension to yaml-scene
    ```yaml
    extensions:
      - ../../dist/src/Your_Extension        # Register a new extension
    ```
3. Call your extension
    ```yaml
      - Your_Extension:
          prop1: hello
          prop2: vi
          var: yourVar
    ```
4. Run test
    ```sh
      yas scenes/test/your_extension.yaml
    ```
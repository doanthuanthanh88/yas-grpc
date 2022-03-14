# Document
*Describe all of elements in tool. (meaning, how to use...)*
| Element | Description |  
|---|---|  
| --- | --- |
|[yaml-scene-extension~Translator](#yaml-scene-extension~Translator)| Translate hello text to vietnamese|  
  
  
# Details
## yaml-scene-extension~Translator <a name="yaml-scene-extension~Translator"></a>
Translate hello text to vietnamese  
```yaml
- yaml-scene-extension~Translator:
    text: hello
    var: result
- Echo: ${result}
```
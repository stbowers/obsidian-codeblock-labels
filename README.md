# Obsidian Code Block Labels Plugin

This plugin renders labels for code blocks.

Source                preview
[image of source]     [image of preview]

The plugin can also be optionally configured to show the language as a label, if no explicit label was set


```rust
fn main() {
  println!("Hello, world");
}
```

Labels are assigned the "codeblock-label" class, and so can be styled with CSS:

```css
.codeblock-label {
  color: magenta;
  background: green;
}
```

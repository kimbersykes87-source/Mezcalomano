# Astro Client Directives - Common Pitfall

## The Issue

Astro's `client:` directives (like `client:load`, `client:idle`, `client:visible`) are designed for **framework components** (React, Vue, Svelte, etc.) that need client-side hydration.

**Astro components (`.astro` files) are server-rendered only and cannot use client directives.**

## Symptoms

When you incorrectly add `client:load` or other client directives to an Astro component, you'll see build errors like:

```
Unexpected "default"
  Location:
     astro-entry:C:/path/to/src/Component.astro:24:25
```

Or errors about null bytes in paths:

```
The argument 'path' must be a string, Uint8Array, or URL without null bytes.
Received 'C:\\path\\\x00astro-entry:C:\\path\\src\\tsconfig.json'
```

## The Fix

Remove the `client:` directive from Astro components:

```astro
<!-- WRONG: Astro components can't be hydrated -->
<MyAstroComponent client:load />

<!-- CORRECT: Astro components are server-only -->
<MyAstroComponent />
```

## When to Use Client Directives

Use client directives only on:
- React components (`.jsx`, `.tsx`)
- Vue components (`.vue`)
- Svelte components (`.svelte`)
- Solid components (`.jsx`, `.tsx` with Solid)
- Preact components
- Lit components

## Making Astro Components Interactive

If you need client-side interactivity in an Astro component, use:

1. **Inline `<script>` tags** - JavaScript that runs in the browser

```astro
<div id="my-element">Click me</div>

<script>
  document.getElementById('my-element').addEventListener('click', () => {
    alert('Clicked!');
  });
</script>
```

2. **`<script define:vars>`** - Pass server data to client scripts

```astro
---
const data = { items: ['a', 'b', 'c'] };
---

<script define:vars={{ data }}>
  console.log(data.items);
</script>
```

3. **Framework components** - For complex interactivity, create a React/Vue/Svelte component

```astro
---
import InteractiveWidget from '../components/InteractiveWidget.jsx';
---

<InteractiveWidget client:load />
```

## References

- [Astro Docs: Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)
- [Astro Docs: Framework Components](https://docs.astro.build/en/guides/framework-components/)
